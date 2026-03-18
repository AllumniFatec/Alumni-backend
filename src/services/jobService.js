import {
  SeniorityLevel,
  EmploymentType,
  PrismaClient,
  WorkModel,
} from '../generated/prisma/index.js';
import CustomError from '../utils/CustomError.js';
import { authenticateUser } from './userService.js';

const actions = {
  createJob: 'criar vaga',
  updateJob: 'atualizar vaga',
  deleteJob: 'deletar vaga',
  getJobs: 'listar vagas',
  getJobById: 'buscar vaga',
};

const prisma = new PrismaClient();

export const findOrCreateWorkplace = async (companyName) => {
  const name = companyName.trim();

  let workplace = await prisma.workplace.findUnique({
    where: { company: name },
  });

  if (!workplace) {
    workplace = await prisma.workplace.create({
      data: { company: name },
    });
  }

  return workplace;
};

export const createJob = async (data, userToken) => {
  const user_id = userToken.id;
  const {
    title,
    description,
    city,
    state,
    country,
    employment_type,
    seniority_level,
    work_model,
    workplace_name,
  } = data;

  if (Object.values(data).some((value) => !value)) {
    throw new CustomError('Todos os campos são obrigatórios', 400);
  }

  if (!Object.values(EmploymentType).includes(employment_type)) {
    throw new CustomError('Tipo de emprego inválido', 400);
  }

  if (!Object.values(SeniorityLevel).includes(seniority_level)) {
    throw new CustomError('Nível de senioridade inválido', 400);
  }

  if (!Object.values(WorkModel).includes(work_model)) {
    throw new CustomError('Modelo de trabalho inválido', 400);
  }

  if (description.length > 3500) {
    throw new CustomError('A descrição da vaga deve conter no máximo 3500 caracteres', 400);
  }

  return authenticateUser(user_id, actions.createJob, async (user) => {
    const workplace = await findOrCreateWorkplace(workplace_name);

    await prisma.job.create({
      data: {
        title: title,
        description: description,
        location: {
          city: city,
          state: state,
          country: country,
        },
        employment_type: employment_type,
        seniority_level: seniority_level,
        work_model: work_model,
        workplace_id: workplace.workplace_id,
        author_id: user.user_id,
      },
    });

    return { message: 'Vaga criada com sucesso!' };
  });
};

export const getJobs = async (userToken, page = 1) => {
  const user_id = userToken.id;

  const limit = 20;
  const skip = (page - 1) * limit;

  return authenticateUser(user_id, actions.getJobs, async (user) => {
    const jobs = await prisma.job.findMany({
      take: limit,
      skip: skip,
      where: {
        status: { not: 'Deleted' },
      },
      orderBy: {
        create_date: 'desc',
      },
      select: {
        job_id: true,
        title: true,
        author_id: true,
        workplace: {
          select: {
            company: true,
          },
        },
        location: {
          select: {
            city: true,
            state: true,
          },
        },
        employment_type: true,
        work_model: true,
        status: true,
        create_date: true,
      },
    });

    const formattedJobs = jobs.map((job) => ({
      id: job.job_id,
      title: job.title,
      author_id: job.author_id,
      workplace: job.workplace.company,
      city: job.location.city,
      state: job.location.state,
      employment_type: job.employment_type,
      work_model: job.work_model,
      status: job.status,
      create_date: job.create_date,
    }));

    return formattedJobs;
  });
};

export const getJobById = async (userToken, jobId) => {
  const user_id = userToken.id;
  const job_id = jobId;

  return authenticateUser(user_id, actions.getJobById, async (user) => {
    const job = await prisma.job.findUnique({
      where: {
        job_id: job_id,
      },
      select: {
        job_id: true,
        title: true,
        description: true,
        workplace: {
          select: {
            company: true,
          },
        },
        location: {
          select: {
            city: true,
            state: true,
            country: true,
          },
        },
        author: {
          select: {
            user_id: true,
            name: true,
            perfil_photo: true,
            workplace: {
              select: {
                company: true,
              },
            },
            courses: {
              select: {
                abbreviation: true,
                enrollmentYear: true,
              },
            },
          },
        },
        employment_type: true,
        work_model: true,
        status: true,
        create_date: true,
      },
    });

    if (!job) {
      throw new CustomError('Vaga não encontrada', 404);
    }

    const formattedJob = {
      id: job.job_id,
      title: job.title,
      description: job.description,
      author_id: job.author.user_id,
      author_name: job.author.name,
      author_perfil_photo: job.author.perfil_photo,
      author_workplace: job.author.workplace?.company,
      author_course_abbreviation: job.author.courses[0]?.abbreviation,
      author_course_enrollmentYear: job.author.courses[0]?.enrollmentYear,
      workplace: job.workplace.company,
      city: job.location.city,
      state: job.location.state,
      country: job.location.country,
      employment_type: job.employment_type,
      work_model: job.work_model,
      status: job.status,
      create_date: job.create_date,
    };

    return formattedJob;
  });
};

export const updateJob = async (jobId, data, userToken) => {
  const user_id = userToken.id;
  const {
    title,
    description,
    city,
    state,
    country,
    employment_type,
    seniority_level,
    work_model,
    workplace_name,
  } = data;
  const job_id = jobId;

  if (Object.values(data).some((value) => !value)) {
    throw new CustomError('Todos os campos são obrigatórios', 400);
  }

  if (!Object.values(EmploymentType).includes(employment_type)) {
    throw new CustomError('Tipo de emprego inválido', 400);
  }

  if (!Object.values(SeniorityLevel).includes(seniority_level)) {
    throw new CustomError('Nível de senioridade inválido', 400);
  }

  if (!Object.values(WorkModel).includes(work_model)) {
    throw new CustomError('Modelo de trabalho inválido', 400);
  }

  if (description.length > 3500) {
    throw new CustomError('A descrição da vaga deve conter no máximo 3500 caracteres', 400);
  }

  return authenticateUser(user_id, actions.updateJob, async (user) => {
    const job = await prisma.job.findUnique({
      where: {
        job_id: job_id,
      },
    });

    if (!job) {
      throw new CustomError('Vaga não encontrada', 404);
    }

    if (user.user_type !== 'Admin') {
      if (job.author_id !== user.user_id) {
        throw new CustomError('Usuário não autorizado a editar esta vaga', 403);
      }
    }

    const workplace = await findOrCreateWorkplace(workplace_name);

    await prisma.job.update({
      where: {
        job_id: job_id,
      },
      data: {
        title: title,
        description: description,
        location: {
          city: city,
          state: state,
          country: country,
        },
        employment_type: employment_type,
        seniority_level: seniority_level,
        work_model: work_model,
        workplace_id: workplace.workplace_id,
        updated_at: new Date(),
      },
    });

    return { message: 'Vaga atualizada com sucesso!' };
  });
};

export const deleteJob = async (jobId, userToken) => {
  const user_id = userToken.id;
  const job_id = jobId;
  return authenticateUser(user_id, actions.deleteJob, async (user) => {
    const job = await prisma.job.findUnique({
      where: {
        job_id: job_id,
      },
    });

    if (user.user_status !== 'Admin') {
      if (job.author_id !== user.user_id) {
        throw new CustomError('Usuário não autorizado a excluir esta vaga', 403);
      }
    }

    await prisma.job.update({
      where: {
        job_id: job_id,
      },
      data: {
        status: 'Deleted',
      },
    });

    return { message: 'Vaga excluída com sucesso!' };
  });
};
