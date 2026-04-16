import * as userService from '../services/userService.js';
import CustomError from '../utils/CustomError.js';

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
    console.error('userController(getUsers) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
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
    console.error('userController(getUserById) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
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
    console.error('userController(getMyProfile) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const insertWorkplace = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const userJob = await userService.insertWorkplace(user, data);

    return res.status(201).json({ message: 'Trabalho inserido com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('userController(insertWorkplace) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
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
    console.error('userController(updateProfilePhoto) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
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
    console.error('userController(updateMyProfile) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
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
    console.error('userController(deleteMyProfile) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const updateWorkplace = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const userJob = await userService.updateWorkplace(user, data);

    return res.status(200).json({ message: 'Trabalho atualizado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('userController(updateWorkplace) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const deleteWorkplace = async (req, res) => {
  try {
    const user = req.user;
    const userJobId = req.body.jobUserId;

    const deletedJob = await userService.deleteWorkplace(user, userJobId);

    return res.status(200).json({ message: 'Trabalho excluído com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('userController(deleteWorkplace) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
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
    console.error('userController(insertSkill) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const user = req.user;
    const skill = req.body;

    const deletedSkill = await userService.deleteUserSkill(user, skill);

    return res.status(200).json({ message: 'Habilidade excluída com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('userController(deleteSkill) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
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
    console.error('userController(insertSocialMedia) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
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
    console.error('userController(updateSocialMedia) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
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
    console.error('userController(deleteSocialMedia) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const searchUser = async (req, res) => {
  try {
    const user = req.user;
    const { search, page } = req.query;

    const result = await userService.searchUsers(user, search, page);

    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('userController(searchUser) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};
