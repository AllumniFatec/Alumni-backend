import * as userService from '../services/userService.js';
import CustomError from '../utils/CustomError.js';
import { logUserAction } from '../modules/auditLog/auditLog.helper.js';
import {
  PROFILE_UPDATED,
  PROFILE_DELETED,
  WORKPLACE_CREATED,
} from '../common/enums/auditActions.js';

export const getUsers = async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.page || 1;

    const users = await userService.getUsers(user, page);

    return res.status(200).json(users);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = req.user;
    const userId = req.params.id;
    const { pageEvent, pageJob, pagePost } = req.query;

    const userData = await userService.getUserById(user, userId, pageEvent, pageJob, pagePost);

    return res.status(200).json(userData);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = req.user;
    const { pageEvent, pageJob, pagePost } = req.query;

    const userData = await userService.getMyProfile(user, pageEvent, pageJob, pagePost);

    return res.status(200).json(userData);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const insertWorkplace = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const userJob = await userService.insertWorkplace(user, data);

    await logUserAction(req, {
      action: WORKPLACE_CREATED,
      entity: 'WORKPLACE',
      description: 'Workplace adicionado ao histórico profissional',
      metadata: {
        company: data?.company ?? data?.workplace_name ?? undefined,
        position: data?.position,
        start_date: data?.start_date,
        end_date: data?.end_date,
      },
    });

    return res.status(201).json({ message: 'Trabalho inserido com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const updateProfilePhoto = async (req, res) => {
  try {
    const user = req.user;
    const image = req.file.buffer;

    const upload = await userService.updateProfilePhoto(user, image);

    await logUserAction(req, {
      action: PROFILE_UPDATED,
      entity: 'PROFILE',
      entityId: user?.id,
      description: 'Foto de perfil atualizada',
      metadata: undefined,
    });

    return res.status(200).json({ message: 'Foto de perfil atualizada com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const updatedProfile = await userService.updateMyProfile(user, data);

    await logUserAction(req, {
      action: PROFILE_UPDATED,
      entity: 'PROFILE',
      entityId: user?.id,
      description: 'Perfil atualizado',
      metadata: {
        updated_fields: Object.keys(data || {}),
      },
    });

    return res.status(200).json({ message: 'Perfil atualizado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const deleteMyProfile = async (req, res) => {
  try {
    const user = req.user;

    const deletedProfile = await userService.deleteMyProfile(user);

    await logUserAction(req, {
      action: PROFILE_DELETED,
      entity: 'PROFILE',
      entityId: user?.id,
      description: 'Perfil excluído',
      metadata: undefined,
    });

    return res.status(200).json({ message: 'Perfil excluído com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const updateWorkplace = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const userJob = await userService.updateWorkplace(user, data);

    await logUserAction(req, {
      action: PROFILE_UPDATED,
      entity: 'PROFILE',
      entityId: user?.id,
      description: 'Histórico profissional atualizado',
      metadata: { updated_fields: Object.keys(data || {}) },
    });

    return res.status(200).json({ message: 'Trabalho atualizado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const deleteWorkplace = async (req, res) => {
  try {
    const user = req.user;
    const userJobId = req.body.jobUserId;

    const deletedJob = await userService.deleteWorkplace(user, userJobId);

    await logUserAction(req, {
      action: PROFILE_UPDATED,
      entity: 'PROFILE',
      entityId: user?.id,
      description: 'Histórico profissional removido',
      metadata: { workplace_user_id: userJobId },
    });

    return res.status(200).json({ message: 'Trabalho excluído com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const insertSkill = async (req, res) => {
  try {
    const user = req.user;
    const skill = req.body;

    const insertSkill = await userService.insertUserSkill(user, skill);

    await logUserAction(req, {
      action: PROFILE_UPDATED,
      entity: 'PROFILE',
      entityId: user?.id,
      description: 'Skill adicionada ao perfil',
      metadata: { skill },
    });

    return res.status(201).json({ message: 'Habilidade inserida com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const user = req.user;
    const skill = req.body;

    const deletedSkill = await userService.deleteUserSkill(user, skill);

    await logUserAction(req, {
      action: PROFILE_UPDATED,
      entity: 'PROFILE',
      entityId: user?.id,
      description: 'Skill removida do perfil',
      metadata: { skill },
    });

    return res.status(200).json({ message: 'Habilidade excluída com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const insertSocialMedia = async (req, res) => {
  try {
    const user = req.user;
    const socialMedia = req.body;

    const insertedSocialMedia = await userService.insertSocialMedia(user, socialMedia);

    return res.status(201).json({ message: 'Rede social inserida com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const updateSocialMedia = async (req, res) => {
  try {
    const user = req.user;
    const socialMedia = req.body;

    const updatedSocialMedia = await userService.updateSocialMedia(user, socialMedia);

    return res.status(200).json({ message: 'Rede social alterada com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const deleteSocialMedia = async (req, res) => {
  try {
    const user = req.user;
    const socialMedia = req.body;

    const deletedSocialMedia = await userService.deleteSocialMedia(user, socialMedia);

    return res.status(200).json({ message: 'Rede social excluída com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const searchUser = async (req, res) => {
  try {
    const user = req.user;
    const search = req.query.search;

    const users = await userService.searchUsers(user, search);

    return res.status(200).json(users);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
