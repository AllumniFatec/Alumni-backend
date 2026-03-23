import { PrismaClient } from '../generated/prisma/index.js';
import CustomError from '../utils/CustomError.js';
import { authenticateUser } from './userService.js';
import { enqueueEmail } from '../utils/emailQueue.js';

const prisma = new PrismaClient();

const actions = {
  getDashboard: 'acessar painel administrador',
  listAllUsersInAnalysis: 'listar usuários para aprovação',
  approveUser: 'aprovar usuário',
  refuseUser: 'recusar usuário',
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

    const users = await prisma.user.findMany({
      where: {
        user_status: 'Active',
      },
    });

    const jobs = await prisma.job.findMany({
      where: {
        status: 'Active',
      },
    });

    const countUsersInAnalysis = usersInAnalysis.length;
    const countUsersActive = users.length;
    const countJobsActive = jobs.length;

    return { usersInAnalysis, countJobsActive, countUsersActive, countUsersInAnalysis };
  });
};

export const listAllUsersInAnalysis = async (userToken, page = 1) => {
  const user_id = userToken.id;

  const pageVerifyed = Number(page);

  if (!Number.isInteger(pageVerifyed) || pageVerifyed < 1) {
    page = 1;
  }

  const limit = 30;
  const skip = (pageVerifyed - 1) * limit;

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

export const approveUser = async (userToken, userData, protocol, host) => {
  const user_id = userToken.id;
  const alumni_id = userData;

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
      const message = `<div style="width: 100%; text-align: center; font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px 0;">
  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td align="center" style="color: #333333; font-size: 18px;">
        <h3 style="margin-top: 0;">Bem-vindo(a), ${targetUser.name}!</h3>

        <p style="margin: 10px 0 20px 0;">
          Seu perfil no <strong>Sistema Alumni Fatec Sorocaba</strong> foi aprovado!
        </p>

        <p style="margin: 10px 0 20px 0;">
          Agora você pode se conectar com outros ex-alunos, compartilhar experiências,
          acompanhar novidades e expandir sua rede profissional.
        </p>

        <a href="${urlPlatform}" 
           style="background-color: #AE0C0D;
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 8px;
                  display: inline-block;
                  font-weight: bold;
                  margin: 20px 0;">
          ACESSAR PLATAFORMA
        </a>

        <p style="margin-top: 20px; color: #555555;">
          Complete seu perfil para aproveitar ao máximo todos os recursos disponíveis.
        </p>

        <p style="margin-top: 10px; color: #777777; font-size: 14px;">
          Se você tiver qualquer dúvida, nossa equipe estará pronta para ajudar.
        </p>

        <p style="margin-top: 25px; color: #999999; font-size: 13px;">
          © ${new Date().getFullYear()} Alumni — Conectando histórias e oportunidades.
        </p>
      </td>
    </tr>
  </table>
</div>`;

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

export const refuseUser = async (userToken, userData, protocol, host) => {
  const user_id = userToken.id;
  const alumni_id = userData;

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
      const message = `<div style="width: 100%; text-align: center; font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px 0;">
  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td align="center" style="color: #333333; font-size: 18px;">
        <h3 style="margin-top: 0;">Olá, ${targetUser.name}</h3>

        <p style="margin: 10px 0 20px 0;">
          Após a análise realizada pela administração, seu cadastro no 
          <strong>Sistema Alumni Fatec Sorocaba</strong> não pôde ser aprovado neste momento.
        </p>

        <p style="margin: 10px 0 20px 0;">
          Isso pode ocorrer devido a informações incompletas ou divergentes no cadastro.
          Caso tenha sido um engano, você pode realizar um novo cadastro normalmente.
        </p>

        <p style="margin: 10px 0 20px 0;">
          Você pode se cadastrar novamente utilizando <strong>o mesmo e-mail</strong>, 
          corrigindo ou atualizando suas informações.
        </p>

        <a href="${urlPlatform}" 
           style="background-color: #AE0C0D;
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 8px;
                  display: inline-block;
                  font-weight: bold;
                  margin: 20px 0;">
          REALIZAR NOVO CADASTRO
        </a>

        <p style="margin-top: 20px; color: #555555;">
          Se você acredita que esta decisão foi um erro ou possui dúvidas,
          recomendamos realizar um novo cadastro revisando os dados informados, e, após isso, entre em contato com a administração do sistema.
        </p>

        <p style="margin-top: 10px; color: #777777; font-size: 14px;">
          Agradecemos seu interesse em participar da comunidade Alumni.
        </p>

        <p style="margin-top: 25px; color: #999999; font-size: 13px;">
          © ${new Date().getFullYear()} Alumni — Conectando histórias e oportunidades.
        </p>
      </td>
    </tr>
  </table>
</div>`;

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
