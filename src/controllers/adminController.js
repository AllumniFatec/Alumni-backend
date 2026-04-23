import * as adminService from '../services/adminService.js';
import CustomError from '../utils/CustomError.js';

export const dashboard = async (req, res) => {
  try {
    const user = req.user;

    const dashboard = await adminService.getDashboard(user);

    return res.status(200).json(dashboard);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('adminController(dashboard) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const listAllUsersInAnalysis = async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.page;

    const usersInAnalysis = await adminService.listAllUsersInAnalysis(user, page);

    return res.status(200).json(usersInAnalysis);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('adminController(listAllUsersInAnalysis) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const approveUser = async (req, res) => {
  try {
    const user = req.user;
    const alumniId = req.params.id;

    await adminService.approveUser(user, alumniId);

    return res.status(200).json({ message: 'Usuário aprovado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('adminController(approveUser) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const refuseUser = async (req, res) => {
  try {
    const user = req.user;
    const alumniId = req.params.id;

    await adminService.refuseUser(user, alumniId);

    return res.status(200).json({ message: 'Usuário recusado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('adminController(refuseUser) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.page || 1;

    const users = await adminService.getUsers(user, page);

    return res.status(200).json(users);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('adminController(getUsers) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const user = req.user;
    const { search, page } = req.query;

    const users = await adminService.searchUsers(user, search, page);

    return res.status(200).json(users);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('adminController(searchUsers) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const changeUserType = async (req, res) => {
  try {
    const user = req.user;
    const userId = req.params.id;
    const type = req.body.type;

    const updatedUser = await adminService.changeUserType(user, userId, type);

    return res.status(200).json(updatedUser);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('adminController(changeUserType) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const banUser = async (req, res) => {
  try {
    const user = req.user;
    const userId = req.params.id;
    const banData = req.body;

    const bannedUser = await adminService.banUser(user, userId, banData);

    return res.status(200).json(bannedUser);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('adminController(banUser) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};
