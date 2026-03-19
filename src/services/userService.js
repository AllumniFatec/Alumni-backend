import { PrismaClient, UserGender, SocialMediaType } from '../generated/prisma/index.js';
import { findOrCreateWorkplace } from './jobService.js';
import CustomError from '../utils/CustomError.js';
import levenshtein from 'fast-levenshtein';
import cloudinary from '../config/cloudinary.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

const actions = {
  updateProfile: 'atualizar perfil',
  deleteProfile: 'excluir perfil',
  getUsers: 'listar usuários',
  getProfile: 'carregar perfil',
  updateProfilePhoto: 'atualizar foto de perfil',
  editJob: 'editar local de trabalho',
  insertJob: 'inserir local de trabalho',
  deleteJob: 'excluir local de trabalho',
  insertUserSkill: 'inserir habilidade',
  deleteUserSkill: 'excluir habilidade',
  insertSocialMedia: 'inserir rede social',
  updatedSocialMedia: 'editar rede social',
  deleteSocialMedia: 'excluir rede social',
};

async function findOrCreateSkill(skillName, slugName) {
  let skillData;
  let skill_id;

  const skill = await prisma.skill.findFirst({
    where: {
      name: {
        contains: skillName,
        mode: 'insensitive',
      },
    },
    select: {
      skill_id: true,
    },
  });

  if (skill) {
    skill_id = skill.skill_id;
  }

  if (!skill) {
    const skills = await prisma.skill.findMany();

    skillData = skills.find((s) => {
      return levenshtein.get(s.name.toLowerCase(), skillName.toLowerCase()) <= 3;
    });

    if (!skillData) {
      const newSkill = await prisma.skill.create({
        data: {
          name: skillName,
          slug: slugName,
        },
      });

      skill_id = newSkill.skill_id;
    } else {
      skill_id = skillData.skill_id;
    }
  }

  return skill_id;
}

function isValidHttpUrl(url) {
  const parsed = new URL(url);

  if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
    return;
  } else {
    throw new CustomError('URL informada inválida', 404);
  }
}

function capitalizeWords(text) {
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function parseBRDate(dateString) {
  if (dateString == undefined) return;
  if (!dateString) return;

  const [day, month, year] = dateString.split('/').map(Number);

  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new CustomError('Data inválida', 400);
  }

  return date;
}

export const authenticateUser = async (userId, action, func) => {
  const user_id = userId;

  const user = await prisma.user.findUnique({
    where: {
      user_id: user_id,
    },
  });

  if (!user) {
    throw new CustomError('Usuário não encontrado', 404);
  }

  if (user.user_status !== 'Active') {
    throw new CustomError('Usuário não autorizado a realizar esta ação: ' + action, 403);
  }

  if (typeof func === 'function') {
    return func(user);
  }

  return user;
};

export const getUsers = async (userToken, page = 1) => {
  const user_id = userToken.id;

  const limit = 40;
  const skip = (page - 1) * limit;

  return authenticateUser(user_id, actions.getUsers, async (user) => {
    const users = await prisma.user.findMany({
      take: limit,
      skip: skip,
      where: {
        user_status: 'Active',
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        user_id: true,
        name: true,
        courses: {
          select: {
            course_name: true,
            enrollmentYear: true,
          },
        },
        perfil_photo: true,
        user_type: true,
        workplace_history: {
          orderBy: [{ start_date: 'desc' }, { end_date: 'desc' }],
          select: {
            workplace_user_id: true,
            position: true,
            function: true,
            workplace: {
              select: {
                company: true,
              },
            },
            start_date: true,
            end_date: true,
          },
        },
      },
    });

    if (!users) {
      throw new CustomError('Nenhum usuário cadastrado', 404);
    }

    return users;
  });
};

export const getUserById = async (userToken, userId) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.getUsers, async (user) => {
    const userData = await prisma.user.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        user_id: true,
        perfil_photo: true,
        name: true,
        biography: true,
        user_type: true,
        courses: {
          select: {
            course_name: true,
            enrollmentYear: true,
          },
        },
        workplace_history: {
          orderBy: [{ start_date: 'desc' }, { end_date: 'desc' }],
          select: {
            workplace_user_id: true,
            position: true,
            function: true,
            workplace: {
              select: {
                company: true,
              },
            },
            start_date: true,
            end_date: true,
          },
        },
        social_media: {
          select: {
            type: true,
            url: true,
          },
        },
        skills: {
          select: {
            skill: {
              select: {
                name: true,
              },
            },
          },
        },
        events: {
          select: {
            title: true,
            event_id: true,
            status: true,
          },
        },
        jobs: {
          select: {
            job_id: true,
            title: true,
            status: true,
          },
        },
        posts: {
          select: {
            post_id: true,
            content: true,
            create_date: true,
            images: true,
            comments_count: true,
            comments: {
              where: {
                status: 'Active',
                author: {
                  user_status: 'Active',
                },
              },
              select: {
                content: true,
                comment_id: true,
                create_date: true,
                author: {
                  select: {
                    user_id: true,
                    name: true,
                    perfil_photo: true,
                    user_status: true,
                    courses: {
                      select: {
                        abbreviation: true,
                        enrollmentYear: true,
                      },
                    },
                  },
                },
              },
            },
            likes_count: true,
            likes: {
              where: {
                status: 'Active',
                author: {
                  user_status: 'Active',
                },
              },
              select: {
                like_id: true,
                create_date: true,
                author: {
                  select: {
                    user_id: true,
                    name: true,
                    perfil_photo: true,
                    user_status: true,
                    courses: {
                      select: {
                        abbreviation: true,
                        enrollmentYear: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        gender: true,
      },
    });

    if (!userData) {
      throw new CustomError('Usuário não econtrado!', 404);
    }

    return userData;
  });
};

export const getMyProfile = async (userToken) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.getMyProfile, async (user) => {
    const userData = await prisma.user.findUnique({
      where: {
        user_id: user.user_id,
      },
      select: {
        user_id: true,
        perfil_photo: true,
        name: true,
        biography: true,
        user_type: true,
        courses: {
          select: {
            course_name: true,
            enrollmentYear: true,
          },
        },
        workplace_history: {
          orderBy: [{ start_date: 'desc' }, { end_date: 'desc' }],
          select: {
            workplace_user_id: true,
            position: true,
            function: true,
            workplace: {
              select: {
                company: true,
              },
            },
            start_date: true,
            end_date: true,
          },
        },
        social_media: {
          select: {
            id: true,
            type: true,
            url: true,
          },
        },
        skills: {
          select: {
            skill: {
              select: {
                name: true,
              },
            },
          },
        },
        events: {
          select: {
            title: true,
            event_id: true,
            status: true,
          },
        },
        jobs: {
          select: {
            job_id: true,
            title: true,
            status: true,
          },
        },
        posts: {
          select: {
            post_id: true,
            content: true,
            create_date: true,
            images: true,
            comments_count: true,
            comments: {
              where: {
                status: 'Active',
                author: {
                  user_status: 'Active',
                },
              },
              select: {
                content: true,
                comment_id: true,
                create_date: true,
                author: {
                  select: {
                    user_id: true,
                    name: true,
                    perfil_photo: true,
                    user_status: true,
                    courses: {
                      select: {
                        abbreviation: true,
                        enrollmentYear: true,
                      },
                    },
                  },
                },
              },
            },
            likes_count: true,
            likes: {
              where: {
                status: 'Active',
                author: {
                  user_status: 'Active',
                },
              },
              select: {
                like_id: true,
                create_date: true,
                author: {
                  select: {
                    user_id: true,
                    name: true,
                    perfil_photo: true,
                    user_status: true,
                    courses: {
                      select: {
                        abbreviation: true,
                        enrollmentYear: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        gender: true,
        email: true,
        receive_notifications: true,
      },
    });

    if (!userData) {
      throw new CustomError('Usuário não econtrado!', 404);
    }

    return userData;
  });
};

export const updateProfilePhoto = async (userToken, image) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.updateProfilePhoto, async (user) => {
    if (!image) {
      throw new CustomError('Nenhum foto enviada', 400);
    }

    if (user.user_id !== user_id) {
      throw new CustomError('Usuário não autorizado a editar a foto deste perfil!', 403);
    }

    const urlPhoto = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: `${user.user_id}_${Date.now()}`,
          folder: 'images',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(image);
    });

    const result = await cloudinary.uploader.destroy(user.perfil_photo.public_id);

    await prisma.user.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        perfil_photo: { url: urlPhoto.secure_url, public_id: urlPhoto.public_id },
      },
    });
  });
};

export const updateMyProfile = async (userToken, data) => {
  const user_id = userToken.id;
  const { name, gender, biography, receive_notifications } = data;

  return authenticateUser(user_id, actions.updateProfile, async (user) => {
    if (user.user_id !== user_id) {
      throw new CustomError('Usuário não autorizado a editar este perfil!', 403);
    }
    if (!name) {
      throw new CustomError('Campo de nome é obrigatório', 400);
    }

    if (!Object.values(UserGender).includes(gender)) {
      throw new CustomError('Gênero de usuário inválido!', 422);
    }

    const updatedUser = await prisma.user.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        name: name,
        gender: gender,
        biography: biography,
        receive_notifications: receive_notifications,
        updated_at: new Date(),
      },
    });

    return { message: 'Perfil atualizado com sucesso!' };
  });
};

export const deleteMyProfile = async (userToken) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.deleteProfile, async (user) => {
    const deletedUser = await prisma.user.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        user_status: 'Suspended',
      },
    });

    return { message: 'Conta suspendida com sucesso!' };
  });
};

export const insertJob = async (userToken, data) => {
  const user_id = userToken.id;
  const { company_name, position, functions, start_date, end_date } = data;

  if (Object.entries(data).some(([key, value]) => key !== 'end_date' && !value)) {
    throw new CustomError('Todos os campos são obrigatórios!', 400);
  }

  return authenticateUser(user_id, actions.insertJob, async (user) => {
    const company = capitalizeWords(company_name.trim());

    const work_id = await findOrCreateWorkplace(company);

    const new_start_date = parseBRDate(start_date);
    const new_end_date = parseBRDate(end_date);

    await prisma.workplaceUser.create({
      data: {
        function: functions,
        position: position,
        start_date: new_start_date,
        end_date: new_end_date,
        user_id: user.user_id,
        workplace_id: work_id,
      },
    });

    return { message: 'Trabalho inserido com sucesso!' };
  });
};

export const editJob = async (userToken, jobData) => {
  const user_id = userToken.id;
  const { jobUserId, company_name, position, functions, start_date, end_date } = jobData;
  let companyData;
  let work_id;

  if (Object.entries(jobData).some(([key, value]) => key !== 'end_date' && !value)) {
    throw new CustomError('Todos os campos são obrigatórios!', 400);
  }

  return authenticateUser(user_id, actions.editJob, async (user) => {
    const updatedCompany = await prisma.workplaceUser.findUnique({
      where: {
        workplace_user_id: jobUserId,
      },
    });

    if (!updatedCompany) {
      throw new CustomError('Local de trabalho não encontrado!', 404);
    }

    if (user.user_id !== updatedCompany.user_id) {
      throw new CustomError('Usuário não autorizado a editar este trabalho', 403);
    }

    const company = capitalizeWords(company_name.trim());

    const work_id = await findOrCreateWorkplace(company);

    const new_start_date = parseBRDate(start_date);
    const new_end_date = parseBRDate(end_date);

    await prisma.workplaceUser.update({
      where: {
        workplace_user_id: jobUserId,
      },
      data: {
        position: position,
        function: functions,
        workplace_id: work_id,
        start_date: new_start_date,
        end_date: new_end_date,
        updated_at: new Date(),
      },
    });
  });
};

export const deleteJob = async (userToken, jobId) => {
  const user_id = userToken.id;
  const job_id = jobId;

  return authenticateUser(user_id, actions.deleteJob, async (user) => {
    const job = await prisma.workplaceUser.findUnique({
      where: {
        workplace_user_id: job_id,
      },
    });

    if (job.user_id !== user.user_id) {
      throw new CustomError('Usuário não autorizado a excluir este trabalho', 403);
    }

    if (!job) {
      throw new CustomError('Local de trabalho não encontrado!', 404);
    }

    await prisma.workplaceUser.delete({
      where: {
        workplace_user_id: job.workplace_user_id,
      },
    });

    return { message: 'Local de trabalho excluído com sucesso!' };
  });
};

export const insertUserSkill = async (userToken, skillData) => {
  const user_id = userToken.id;
  const skill_name = skillData.skill;

  return authenticateUser(user_id, actions.insertUserSkill, async (user) => {
    const skill = capitalizeWords(skill_name.trim());
    const slug = skill.toLowerCase().replace(' ', '-');

    const skill_id = await findOrCreateSkill(skill, slug);

    await prisma.userSkill.create({
      data: {
        skill_id: skill_id,
        user_id: user.user_id,
      },
    });

    return { message: 'Habilidade inserida com sucesso!' };
  });
};

export const deleteUserSkill = async (userToken, skillData) => {
  const user_id = userToken.id;
  const skill_id = skillData.user_skill_id;

  return authenticateUser(user_id, actions.deleteUserSkill, async (user) => {
    const skill = await prisma.userSkill.findUnique({
      where: {
        user_skill_id: skill_id,
      },
      select: {
        user_id: true,
        skill_id: true,
        user_skill_id: true,
      },
    });

    if (skill.user_id !== user.user_id) {
      throw new CustomError('Usuário não autorizado a excluir esta habilidade', 404);
    }

    await prisma.userSkill.delete({
      where: {
        user_skill_id: skill.user_skill_id,
      },
    });

    return { message: 'Habilidade excluída com sucesso!' };
  });
};

export const insertSocialMedia = async (userToken, socialData) => {
  const user_id = userToken.id;
  const { media, url } = socialData;

  if (Object.values(socialData).some((value) => !value)) {
    throw new CustomError('Todos os campos são obrigatórios', 400);
  }

  return authenticateUser(user_id, actions.insertSocialMedia, async (user) => {
    if (!Object.values(SocialMediaType).includes(media)) {
      throw new CustomError('Rede social inválida', 400);
    }

    isValidHttpUrl(url);

    await prisma.user.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        social_media: {
          push: {
            id: crypto.randomUUID(),
            type: media,
            url: url,
          },
        },
      },
    });

    return { message: 'Rede social inserida com sucesso!' };
  });
};

export const updatedSocialMedia = async (userToken, socialData) => {
  const user_id = userToken.id;
  const { media, url, socialMediaId } = socialData;

  if (Object.values(socialData).some((value) => !value)) {
    throw new CustomError('Todos os campos são obrigatórios', 400);
  }

  return authenticateUser(user_id, actions.updatedSocialMedia, async (user) => {
    if (!Object.values(SocialMediaType).includes(media)) {
      throw new CustomError('Rede social inválida', 400);
    }

    isValidHttpUrl(url);

    const updatedUser = await prisma.user.findUnique({
      where: {
        user_id: user.user_id,
      },
      select: {
        social_media: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
      },
    });

    const socialMedia = updatedUser.social_media.filter((sm) => sm.id === socialMediaId);

    if (socialMedia.length === 0) {
      throw new CustomError('Nenhuma rede social encontrada!', 404);
    }

    const updatedSocialMedia = updatedUser.social_media.map((sm) => {
      if (sm.id === socialMediaId) {
        return {
          ...sm,
          url: url,
        };
      }

      return sm;
    });

    await prisma.user.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        social_media: updatedSocialMedia,
      },
    });

    return { message: 'Rede social alterada com sucesso!' };
  });
};

export const deleteSocialMedia = async (userToken, socialData) => {
  const user_id = userToken.id;
  const { socialMediaId } = socialData;

  return authenticateUser(user_id, actions.deleteSocialMedia, async (user) => {
    const updatedUser = await prisma.user.findUnique({
      where: {
        user_id: user.user_id,
      },
      select: {
        social_media: {
          select: {
            id: true,
            url: true,
            type: true,
          },
        },
      },
    });

    const socialMedia = updatedUser.social_media.filter((sm) => sm.id === socialMediaId);

    if (socialMedia.length === 0) {
      throw new CustomError('Nenhuma rede social encontrada!', 404);
    }

    const updatedSocialMedia = updatedUser.social_media.filter((sm) => sm.id !== socialMediaId);

    await prisma.user.update({
      where: {
        user_id: user.user_id,
      },
      data: {
        social_media: updatedSocialMedia,
      },
    });

    return { message: 'Rede social excluída com sucesso!' };
  });
};
