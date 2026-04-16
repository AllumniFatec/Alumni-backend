import prisma from '../config/prisma.js';
import CustomError from '../utils/CustomError.js';
import { authenticateUser } from './userService.js';
import { enqueueEmail } from '../queues/emailQueue.js';
import { messageApproveUser, messageRefuseUser } from '../utils/emailMessages.js';
import { getPageNumber } from '../utils/validations.js';
import { UserType } from '../generated/prisma/index.js';
import * as userService from './userService.js';

const actions = {
  getDashboard: 'acessar painel administrador',
  listAllUsersInAnalysis: 'listar usuários para aprovação',
  approveUser: 'aprovar usuário',
  refuseUser: 'recusar usuário',
  getUsers: 'listar usuários',
  searchUsers: 'buscar usuários',
  changeUserType: 'alterar tipo de usuário',
};

function verifyAdminUser(user, action) {
  if (user.user_status !== 'Active') {
    throw new CustomError(`Usuário não autorizado a realizar esta ação: ${action}`, 403);
  }

  if (user.user_type !== 'Admin') {
    throw new CustomError(`Usuário não autorizado a realizar esta ação: ${action}`, 403);
  }
}

export const getDashboard = async (userToken) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.getDashboard, async (user) => {
    verifyAdminUser(user, actions.getDashboard);

    const usersInAnalysis = await prisma.user.findMany({
      where: {
        user_status: 'InAnalysis',
      },
      orderBy: {
        create_date: 'asc',
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        student_id: true,
        courses: {
          select: {
            course_name: true,
            enrollmentYear: true,
          },
        },
        gender: true,
        user_type: true,
      },
      take: 10,
    });

    const [countUsersInAnalysis, countUsersActive, countJobsActive] = await Promise.all([
      prisma.user.count({ where: { user_status: 'InAnalysis' } }),
      prisma.user.count({ where: { user_status: 'Active' } }),
      prisma.job.count({ where: { status: 'Active' } }),
    ]);

    return { usersInAnalysis, countJobsActive, countUsersActive, countUsersInAnalysis };
  });
};

export const listAllUsersInAnalysis = async (userToken, page = 2) => {
  const user_id = userToken.id;

  const currentPageNumber = getPageNumber(page);

  const limit = 10;
  const skip = (currentPageNumber - 1) * limit;

  return authenticateUser(user_id, actions.listAllUsersInAnalysis, async (user) => {
    verifyAdminUser(user, actions.listAllUsersInAnalysis);

    const users = await prisma.user.findMany({
      where: {
        user_status: 'InAnalysis',
      },
      orderBy: {
        create_date: 'asc',
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        student_id: true,
        courses: {
          select: {
            course_name: true,
            enrollmentYear: true,
          },
        },
        gender: true,
        user_type: true,
      },
      take: limit,
      skip: skip,
    });

    return users;
  });
};

export const approveUser = async (userToken, alumniId, protocol, host) => {
  const user_id = userToken.id;
  const alumni_id = alumniId;

  return authenticateUser(user_id, actions.approveUser, async (user) => {
    verifyAdminUser(user, actions.approveUser);

    const targetUser = await prisma.user.findUnique({
      where: {
        user_id: alumni_id,
        user_status: 'InAnalysis',
      },
    });

    if (!targetUser) {
      throw new CustomError('Usuário já processado!', 404);
    }

    if (targetUser.user_status === 'Active') {
      throw new CustomError('Usuário já está ativo!', 401);
    }

    try {
      await prisma.user.update({
        where: {
          user_id: alumni_id,
          user_status: 'InAnalysis',
        },
        data: {
          user_status: 'Active',
        },
      });

      const urlPlatform = `${protocol}://${host}/sign-in`;
      const message = messageApproveUser(targetUser.name, urlPlatform);

      // Não bloquear a resposta da API: o envio acontece em background pela fila.
      enqueueEmail({
        email: targetUser.email,
        subject: 'Aprovação de Cadastro Alumni Fatec Sorocaba',
        message: message,
        jobKey: `approve:${alumni_id}`,
      });
    } catch (err) {
      throw new CustomError('Algo de errado aconteceu. Por favor, tente novamente mais tarde', 500);
    }
  });
};

export const refuseUser = async (userToken, alumniId, protocol, host) => {
  const user_id = userToken.id;
  const alumni_id = alumniId;

  return authenticateUser(user_id, actions.refuseUser, async (user) => {
    verifyAdminUser(user, actions.refuseUser);

    const targetUser = await prisma.user.findUnique({
      where: {
        user_id: alumni_id,
        user_status: 'InAnalysis',
      },
    });

    if (!targetUser) {
      throw new CustomError('Usuário já processado!', 404);
    }

    if (targetUser.user_status === 'Refused') {
      throw new CustomError('Usuário já foi recusado!', 401);
    }

    try {
      await prisma.user.update({
        where: {
          user_id: alumni_id,
          user_status: 'InAnalysis',
        },
        data: {
          user_status: 'Refused',
        },
      });

      const urlPlatform = `${protocol}://${host}/sign-up`;
      const message = messageRefuseUser(targetUser.name, urlPlatform);

      // Não bloquear a resposta da API: o envio acontece em background pela fila.
      enqueueEmail({
        email: targetUser.email,
        subject: 'Recusa de Cadastro Alumni Fatec Sorocaba',
        message: message,
        jobKey: `refuse:${alumni_id}`,
      });
    } catch (err) {
      throw new CustomError('Algo de errado aconteceu. Por favor, tente novamente mais tarde', 500);
    }
  });
};

export const getUsers = async (userToken, page = 1) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.getUsers, async (user) => {
    verifyAdminUser(user, actions.getUsers);

    const currentPageNumber = getPageNumber(page);

    const { users, pagination } = await userService.getUsers(userToken, currentPageNumber);

    return { users, pagination };
  });
};

export const searchUsers = async (userToken, search, page = 1) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.searchUsers, async (user) => {
    verifyAdminUser(user, actions.searchUsers);

    const currentPageNumber = getPageNumber(page);

    const { users, pagination } = await userService.searchUsers(
      userToken,
      search,
      currentPageNumber
    );

    return { users, pagination };
  });
};

export const changeUserType = async (userToken, userTargetId, type) => {
  const user_id = userToken.id;
  const user_target_id = userTargetId;

  if (!Object.values(UserType).includes(type)) {
    throw new CustomError('Tipo de usuário inválido!', 422);
  }

  return authenticateUser(user_id, actions.changeUserType, async (user) => {
    verifyAdminUser(user, actions.changeUserType);

    const targetUser = await prisma.user.findUnique({
      where: {
        user_id: user_target_id,
      },
    });

    if (!targetUser) {
      throw new CustomError('Usuário não encontrado!', 404);
    }

    if (targetUser.user_status !== 'Active') {
      throw new CustomError('Usuário não pode ser alterado!', 400);
    }

    if (targetUser.user_type === type) {
      throw new CustomError('Tipo de usuário já é o mesmo!', 409);
    }

    const updatedUser = await prisma.user.update({
      where: {
        user_id: user_target_id,
      },
      data: {
        user_type: type,
        updated_at: new Date(),
      },
    });

    return { message: 'Tipo de usuário alterado com sucesso!' };
  });
};
