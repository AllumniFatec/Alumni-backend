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
    return res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = req.user;
    const userId = req.params.id;

    const userData = await userService.getUserById(user, userId);

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

    const userData = await userService.getMyProfile(user);

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

    const updatedProfile = userService.updateMyProfile(user, data);

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

    const deletedProfile = userService.deleteMyProfile(user);

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

    const userJob = await userService.editJob(user, data);

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
    const jobId = req.body.jobUserId;

    const deletedJob = await userService.deleteJob(user, jobId);

    return res.status(200).json({ message: 'Trabalho excluído com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
