import * as authService from '../services/authService.js';
import CustomError from '../utils/CustomError.js';
import { env } from '../config/env.js';

export const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err });
  }
};

export const login = async (req, res) => {
  try {
    const token = await authService.loginUser(req.body);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: !env.isDevelopment,
      sameSite: 'strict',
      maxAge: env.maxAgeCookies, // 1 hora
    });

    res.status(200).json({
      message: 'Login realizado com sucesso',
    });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err });
  }
};

export const list = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const users = await authService.listUsers(page, limit);
    return res.status(200).json(users);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
