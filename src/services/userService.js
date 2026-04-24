import { UserGender, SocialMediaType } from '../generated/prisma/index.js';
import prisma from '../config/prisma.js';
import { findOrCreateWorkplace, formatJobListItem, getJobsByUser } from './jobService.js';
import { formatPost, postSelectForApi } from '../utils/postApiFormatter.js';
import {
  normalizeText,
  capitalizeWords,
  isValidHttpUrl,
  getPageNumber,
} from '../utils/validations.js';
import CustomError from '../utils/CustomError.js';
import levenshtein from 'fast-levenshtein';
import cloudinary from '../config/cloudinary.js';
import crypto from 'crypto';
import { getEventsByUser } from './eventService.js';
import { getPostsByUser } from './postService.js';

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
  searchUser: 'pesquisar usuários',
};

const STOPWORDS = new Set(['e', 'de', 'da', 'do', 'das', 'dos', 'a', 'o', 'em', 'para', 'com']);

async function findOrCreateSkill(skillName, slugName) {
  const normalizedSkillName = skillName.trim().toLowerCase();
  const hasTechSymbols = /[#+.]/.test(normalizedSkillName);
  const isShortSkill = normalizedSkillName.length < 4;

  const exactSkill = await prisma.skill.findFirst({
    where: {
      name: {
        equals: skillName.trim(),
        mode: 'insensitive',
      },
    },
    select: {
      skill_id: true,
    },
  });

  if (exactSkill) {
    return exactSkill.skill_id;
  }

  let skillData;
  const shouldUseFuzzyMatch = !isShortSkill && !hasTechSymbols;

  if (shouldUseFuzzyMatch) {
    const firstChar = normalizedSkillName[0];
    const skills = await prisma.skill.findMany({
      where: {
        name: {
          startsWith: firstChar,
          mode: 'insensitive',
        },
      },
      take: 200,
      select: {
        skill_id: true,
        name: true,
      },
    });

    skillData = skills.find((s) => {
      const normalizedExistingName = s.name.trim().toLowerCase();
      const existingHasTechSymbols = /[#+.]/.test(normalizedExistingName);

      if (normalizedExistingName.length < 4 || existingHasTechSymbols) {
        return false;
      }

      if (Math.abs(normalizedExistingName.length - normalizedSkillName.length) > 1) {
        return false;
      }

      return levenshtein.get(normalizedExistingName, normalizedSkillName) <= 1;
    });
  }

  if (skillData) {
    return skillData.skill_id;
  }

  const newSkill = await prisma.skill.create({
    data: {
      name: skillName.trim(),
      slug: slugName,
    },
  });

  return newSkill.skill_id;
}

export function tokenize(text) {
  return normalizeText(text)
    .split(' ')
    .filter((word) => word && !STOPWORDS.has(word));
}

const fuzzyMatch = (search, target, tolerance = 2) => {
  const normalizedSearch = normalizeText(search);
  const normalizedTarget = normalizeText(target);

  if (
    levenshtein.get(normalizedSearch.replace(/\s/g, ''), normalizedTarget.replace(/\s/g, '')) <=
    tolerance
  ) {
    return true;
  }

  const searchTokens = tokenize(normalizedSearch);
  const targetTokens = tokenize(normalizedTarget);

  return searchTokens.every((searchWord) =>
    targetTokens.some((targetWord) => {
      if (searchWord.length < 4) return targetWord.includes(searchWord);

      if (Math.abs(searchWord.length - targetWord.length) > tolerance) return false;

      return levenshtein.get(searchWord, targetWord) <= tolerance;
    })
  );
};

function parseEnrollmentYearCandidate(value) {
  if (value === null || value === undefined) return null;

  const str = String(value).trim();
  if (!/^\d{4}$/.test(str)) return null;

  const year = Number(str);
  // faixa conservadora para evitar ruído (ex: ids, telefones etc)
  if (year < 1900 || year > 2100) return null;

  return year;
}

function scoreUser(user, tokens, fullSearch) {
  let score = 0;

  const name = normalizeText(user.name);

  const courses = user.courses.map((c) => normalizeText(c.course_search || c.course_name));
  const enrollmentYears = user.courses
    .map((c) => c.enrollmentYear)
    .filter((y) => Number.isInteger(y));

  const workplaces =
    user.workplace_history?.map((wh) => normalizeText(wh.workplace?.company || '')) || [];

  const skills = user.skills.map((s) => normalizeText(s.skill.name));

  const fullSearchYear = parseEnrollmentYearCandidate(fullSearch);

  // =========================
  // ⭐ MATCH COMPLETO (BOOST)
  // =========================

  if (name.includes(fullSearch)) score += 50;
  else if (fuzzyMatch(fullSearch, name)) score += 35;

  courses.forEach((course) => {
    if (course.includes(fullSearch)) score += 45;
    else if (fuzzyMatch(fullSearch, course)) score += 30;
  });

  if (fullSearchYear !== null && enrollmentYears.includes(fullSearchYear)) {
    score += 60;
  }

  workplaces.forEach((work) => {
    if (work.includes(fullSearch)) score += 35;
    else if (fuzzyMatch(fullSearch, work)) score += 20;
  });

  skills.forEach((skill) => {
    if (skill.includes(fullSearch)) score += 25;
    else if (fuzzyMatch(fullSearch, skill)) score += 15;
  });

  // =========================
  // 🔎 MATCH POR TOKEN
  // =========================

  tokens.forEach((token) => {
    const tokenYear = parseEnrollmentYearCandidate(token);

    // ---- NAME ----
    if (name.includes(token)) score += 15;
    else if (fuzzyMatch(token, name)) score += 8;

    // ---- COURSES ----
    courses.forEach((course) => {
      if (course.includes(token)) score += 10;
      else if (fuzzyMatch(token, course)) score += 6;
    });

    if (tokenYear !== null && enrollmentYears.includes(tokenYear)) {
      score += 25;
    }

    // ---- WORKPLACE ----
    workplaces.forEach((work) => {
      if (work.includes(token)) score += 8;
      else if (fuzzyMatch(token, work)) score += 5;
    });

    // ---- SKILLS ----
    skills.forEach((skill) => {
      if (skill.includes(token)) score += 6;
      else if (fuzzyMatch(token, skill)) score += 3;
    });
  });

  return score;
}

function parseBRDate(dateString) {
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

  const currentPageNumber = getPageNumber(page);
  const limit = 30;
  const skip = (currentPageNumber - 1) * limit;

  return authenticateUser(user_id, actions.getUsers, async (user) => {
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
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
              abbreviation: true,
            },
          },
          perfil_photo: true,
          user_type: true,
          skills: {
            select: {
              user_skill_id: true,
              skill: {
                select: {
                  name: true,
                },
              },
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
        },
      }),

      prisma.user.count({
        where: {
          user_status: 'Active',
        },
      }),
    ]);

    if (!users) {
      throw new CustomError('Nenhum usuário cadastrado', 404);
    }

    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users: users,
      pagination: {
        page: currentPageNumber,
        limit: limit,
        totalItems: totalUsers,
        totalPages: totalPages,
        hasNextPage: currentPageNumber < totalPages,
        hasPreviousPage: currentPageNumber > 1,
      },
    };
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
            abbreviation: true,
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
            user_skill_id: true,
            skill: {
              select: {
                name: true,
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

    const jobs = await getJobsByUser(userToken, user_id, 1);
    const events = await getEventsByUser(userToken, user_id, 1);
    const posts = await getPostsByUser(userToken, user_id, 1);

    return { ...userData, jobs: jobs, events: events, posts: posts };
  });
};

export const getMyProfile = async (userToken) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.getMyProfile, async (user) => {
    const userData = await prisma.user.findUnique({
      where: {
        user_id: user_id,
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
            abbreviation: true,
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
            user_skill_id: true,
            skill: {
              select: {
                name: true,
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

    const jobs = await getJobsByUser(userToken, user_id, 1);
    const events = await getEventsByUser(userToken, user_id, 1);
    const posts = await getPostsByUser(userToken, user_id, 1);

    return { ...userData, jobs: jobs, events: events, posts: posts };
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

    if (user.perfil_photo?.public_id) {
      await cloudinary.uploader.destroy(user.perfil_photo.public_id);
    }

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

function validateProfileData(profileData) {
  const requiredFields = ['name', 'gender', 'receive_notifications'];

  requiredFields.forEach((field) => {
    const value = profileData[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      throw new CustomError(`Campo ${field} é obrigatório`, 400);
    }
  });

  const name = String(profileData.name).trim();
  const gender = String(profileData.gender).trim();
  const biography = String(profileData.biography)?.trim();
  const receive_notifications = Boolean(profileData.receive_notifications);

  if (name.length < 3 || name.length > 80) {
    throw new CustomError('Nome deve ter entre 3 e 80 caracteres', 400);
  }

  if (!Object.values(UserGender).includes(gender)) {
    throw new CustomError('Gênero de usuário inválido!', 422);
  }

  if (receive_notifications !== true && receive_notifications !== false) {
    throw new CustomError('Notificações devem ser true ou false', 400);
  }

  if (biography && biography.length > 1000) {
    throw new CustomError('Biografia deve ter no máximo 1000 caracteres', 400);
  }

  return {
    name,
    gender,
    biography,
    receive_notifications,
  };
}

export const updateMyProfile = async (userToken, data) => {
  const user_id = userToken.id;
  const { name, gender, biography, receive_notifications } = validateProfileData(data);

  return authenticateUser(user_id, actions.updateProfile, async (user) => {
    if (user.user_id !== user_id) {
      throw new CustomError('Usuário não autorizado a editar este perfil!', 403);
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
        deleted_at: new Date(),
      },
    });

    return { message: 'Conta suspendida com sucesso!' };
  });
};

function validateWorkplaceData(workplaceData) {
  const requiredFields = ['company_name', 'position', 'functions', 'start_date'];

  requiredFields.forEach((field) => {
    if (!workplaceData[field] || String(workplaceData[field]).trim() === '') {
      throw new CustomError(`Campo ${field} é obrigatório`, 400);
    }
  });

  const company_name = String(workplaceData.company_name).trim();
  const position = String(workplaceData.position).trim();
  const functions = String(workplaceData.functions).trim();
  const start_date = parseBRDate(workplaceData.start_date);
  const end_date = workplaceData.end_date ? parseBRDate(workplaceData.end_date) : null;

  if (company_name.length < 3 || company_name.length > 100) {
    throw new CustomError('Nome da empresa deve ter entre 3 e 100 caracteres', 400);
  }

  if (position.length < 3 || position.length > 150) {
    throw new CustomError('Cargo deve ter entre 3 e 150 caracteres', 400);
  }

  if (functions.length < 3 || functions.length > 300) {
    throw new CustomError('Funções devem ter entre 3 e 300 caracteres', 400);
  }

  return {
    company_name,
    position,
    functions,
    start_date,
    end_date,
  };
}

export const insertWorkplace = async (userToken, data) => {
  const user_id = userToken.id;
  const { company_name, position, functions, start_date, end_date } = validateWorkplaceData(data);

  if (Object.entries(data).some(([key, value]) => key !== 'end_date' && !value)) {
    throw new CustomError('Todos os campos são obrigatórios!', 400);
  }

  return authenticateUser(user_id, actions.insertJob, async (user) => {
    const company = capitalizeWords(company_name.trim());

    const work_id = await findOrCreateWorkplace(company);

    await prisma.workplaceUser.create({
      data: {
        function: functions,
        position: position,
        start_date: start_date,
        end_date: end_date,
        user_id: user.user_id,
        workplace_id: work_id,
      },
    });

    return { message: 'Trabalho inserido com sucesso!' };
  });
};

export const updateWorkplace = async (userToken, jobData) => {
  const user_id = userToken.id;
  const jobUserId = jobData.jobUserId;
  const { company_name, position, functions, start_date, end_date } =
    validateWorkplaceData(jobData);

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

    await prisma.workplaceUser.update({
      where: {
        workplace_user_id: jobUserId,
      },
      data: {
        position: position,
        function: functions,
        workplace_id: work_id,
        start_date: start_date,
        end_date: end_date,
        updated_at: new Date(),
      },
    });
  });
};

export const deleteWorkplace = async (userToken, userJobId) => {
  const user_id = userToken.id;
  const user_job_id = userJobId;

  return authenticateUser(user_id, actions.deleteJob, async (user) => {
    const job = await prisma.workplaceUser.findUnique({
      where: {
        workplace_user_id: user_job_id,
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

    if (skill.length < 1 || skill.length > 60) {
      throw new CustomError('Habilidade deve ter entre 1 e 60 caracteres', 400);
    }

    const skill_id = await findOrCreateSkill(skill, slug);

    const targetUserSkill = await prisma.userSkill.findUnique({
      where: {
        user_id_skill_id: {
          user_id: user.user_id,
          skill_id: skill_id,
        },
      },
    });

    if (targetUserSkill) {
      throw new CustomError('Habilidade já inserida', 409);
    }

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

    if (!skill) {
      throw new CustomError('Habilidade não encontrada para esse usuário', 404);
    }

    if (skill.user_id !== user.user_id) {
      throw new CustomError('Usuário não autorizado a excluir esta habilidade', 403);
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

    if (url.length > 200) {
      throw new CustomError('URL deve ter no máximo 200 caracteres', 400);
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

export const updateSocialMedia = async (userToken, socialData) => {
  const user_id = userToken.id;
  const { media, url, socialMediaId } = socialData;

  if (Object.values(socialData).some((value) => !value)) {
    throw new CustomError('Todos os campos são obrigatórios', 400);
  }

  return authenticateUser(user_id, actions.updatedSocialMedia, async (user) => {
    if (!Object.values(SocialMediaType).includes(media)) {
      throw new CustomError('Rede social inválida', 400);
    }

    if (url.length > 200) {
      throw new CustomError('URL deve ter no máximo 200 caracteres', 400);
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
        updated_at: new Date(),
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

export const searchUsers = async (userToken, search, page = 1) => {
  const user_id = userToken.id;

  const currentPageNumber = getPageNumber(page);
  const limit = 15;
  const skip = (currentPageNumber - 1) * limit;

  return authenticateUser(user_id, actions.searchUser, async () => {
    const rawSearch = Array.isArray(search) ? search[0] : search;

    if (!rawSearch || typeof rawSearch !== 'string') {
      return [];
    }

    const normalizedSearch = normalizeText(rawSearch.replace('%', ' '));
    const tokens = tokenize(normalizedSearch);
    const enrollmentYearCandidate =
      parseEnrollmentYearCandidate(normalizedSearch) ??
      tokens.map(parseEnrollmentYearCandidate).find((y) => y !== null) ??
      null;

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: {
          AND: [
            // ✅ apenas usuários ativos
            {
              user_status: 'Active',
            },

            // ✅ lógica de busca
            {
              OR: [
                {
                  name: {
                    contains: normalizedSearch,
                    mode: 'insensitive',
                  },
                },

                {
                  courses: {
                    some: {
                      course_search: {
                        contains: normalizedSearch,
                        mode: 'insensitive',
                      },
                    },
                  },
                },

                ...(enrollmentYearCandidate !== null
                  ? [
                      {
                        courses: {
                          some: {
                            enrollmentYear: enrollmentYearCandidate,
                          },
                        },
                      },
                    ]
                  : []),

                ...tokens.flatMap((token) => [
                  {
                    name: {
                      contains: token,
                      mode: 'insensitive',
                    },
                  },
                  {
                    workplace_history: {
                      some: {
                        workplace: {
                          company: {
                            contains: token,
                            mode: 'insensitive',
                          },
                        },
                      },
                    },
                  },
                  {
                    courses: {
                      some: {
                        course_search: {
                          contains: token,
                          mode: 'insensitive',
                        },
                      },
                    },
                  },
                  {
                    skills: {
                      some: {
                        skill: {
                          name: {
                            contains: token,
                            mode: 'insensitive',
                          },
                        },
                      },
                    },
                  },
                ]),
              ],
            },
          ],
        },

        select: {
          user_id: true,
          name: true,
          courses: {
            select: {
              course_name: true,
              enrollmentYear: true,
              abbreviation: true,
            },
          },
          social_media: {
            select: {
              type: true,
              url: true,
            },
          },
          gender: true,
          perfil_photo: true,
          user_type: true,
          workplace_history: {
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
          skills: {
            select: {
              user_skill_id: true,
              skill: {
                select: {
                  name: true,
                },
              },
            },
          },
        },

        take: limit,
        skip: skip,
      }),

      prisma.user.count({
        where: {
          AND: [
            // ✅ apenas usuários ativos
            {
              user_status: 'Active',
            },

            // ✅ lógica de busca
            {
              OR: [
                {
                  name: {
                    contains: normalizedSearch,
                    mode: 'insensitive',
                  },
                },

                {
                  courses: {
                    some: {
                      course_search: {
                        contains: normalizedSearch,
                        mode: 'insensitive',
                      },
                    },
                  },
                },

                ...(enrollmentYearCandidate !== null
                  ? [
                      {
                        courses: {
                          some: {
                            enrollmentYear: enrollmentYearCandidate,
                          },
                        },
                      },
                    ]
                  : []),

                ...tokens.flatMap((token) => [
                  {
                    name: {
                      contains: token,
                      mode: 'insensitive',
                    },
                  },
                  {
                    workplace_history: {
                      some: {
                        workplace: {
                          company: {
                            contains: token,
                            mode: 'insensitive',
                          },
                        },
                      },
                    },
                  },
                  {
                    courses: {
                      some: {
                        course_search: {
                          contains: token,
                          mode: 'insensitive',
                        },
                      },
                    },
                  },
                  {
                    skills: {
                      some: {
                        skill: {
                          name: {
                            contains: token,
                            mode: 'insensitive',
                          },
                        },
                      },
                    },
                  },
                ]),
              ],
            },
          ],
        },
      }),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    const rankedUsers = users
      .map((user) => ({
        user,
        score: scoreUser(user, tokens, normalizedSearch),
      }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.user);

    if (rankedUsers.length === 0) {
      // Fallback: quando o `contains` do Prisma não encontra por causa de normalização/acentos,
      // ranqueamos em cima de um conjunto maior de candidatos.
      const fallbackUsers = await prisma.user.findMany({
        where: {
          AND: [{ user_status: 'Active' }, { user_type: { not: 'Admin' } }],
        },
        take: 200,
        select: {
          user_id: true,
          name: true,
          courses: {
            select: {
              course_name: true,
              enrollmentYear: true,
              abbreviation: true,
            },
          },
          social_media: {
            select: {
              type: true,
              url: true,
            },
          },
          gender: true,
          perfil_photo: true,
          user_type: true,
          workplace_history: {
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
          skills: {
            select: {
              user_skill_id: true,
              skill: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const rankedFallbackUsers = fallbackUsers
        .map((user) => ({
          user,
          score: scoreUser(user, tokens, normalizedSearch),
        }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.user);

      return rankedFallbackUsers.slice(0, 30);
    }

    return {
      users: rankedUsers,
      pagination: {
        page: currentPageNumber,
        limit: limit,
        totalItems: totalUsers,
        totalPages: totalPages,
        hasNextPage: currentPageNumber < totalPages,
        hasPreviousPage: currentPageNumber > 1,
      },
    };
  });
};

export const getUsersNotifications = async (requestedUserIds = []) => {
  if (!Array.isArray(requestedUserIds) || requestedUserIds.length === 0) {
    return [];
  }

  const eligibleUsers = await prisma.user.findMany({
    where: {
      user_id: {
        in: requestedUserIds,
      },
      receive_notifications: true,
      user_status: 'Active',
    },
    select: {
      user_id: true,
    },
  });

  const userIds = eligibleUsers.map((user) => user.user_id);

  return userIds;
};
