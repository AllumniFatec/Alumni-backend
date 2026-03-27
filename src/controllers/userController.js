import * as userService from '../services/userService.js';
import CustomError from '../utils/CustomError.js';
import { isValidObjectId } from '../utils/validations.js';

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
    const pageEvent = req.query.pageEvent || 1;
    const pageJob = req.query.pageJob || 1;
    const pagePost = req.query.pagePost || 1;

    if (!isValidObjectId(userId)) {
      throw new CustomError('Id inválido', 400);
    }

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
    const pageEvent = req.query.pageEvent || 1;
    const pageJob = req.query.pageJob || 1;
    const pagePost = req.query.pagePost || 1;

    const userData = await userService.getMyProfile(user, pageEvent, pageJob, pagePost);

    return res.status(200).json(userData);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const insertJob = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const userJob = await userService.insertJob(user, data);

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

    return res.status(200).json({ message: 'Perfil excluído com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    if (!isValidObjectId(data.jobUserId)) {
      throw new CustomError('Id inválido', 400);
    }

    const userJob = await userService.updateJob(user, data);

    return res.status(200).json({ message: 'Trabalho atualizado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const user = req.user;
    const userJobId = req.body.jobUserId;

    if (!isValidObjectId(userJobId)) {
      throw new CustomError('Id inválido', 400);
    }

    const deletedJob = await userService.deleteJob(user, userJobId);

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

    if (!isValidObjectId(skill.user_skill_id)) {
      throw new CustomError('Id inválido', 400);
    }

    const deletedSkill = await userService.deleteUserSkill(user, skill);

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

    if (!isValidObjectId(socialMedia.socialMediaId)) {
      throw new CustomError('Id inválido', 400);
    }

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

    if (!isValidObjectId(socialMedia.socialMediaId)) {
      throw new CustomError('Id inválido', 400);
    }

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
