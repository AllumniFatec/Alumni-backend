import * as authService from '../services/authService.js';
import CustomError from '../utils/CustomError.js';
import { env } from '../config/env.js';
import { redisClient } from '../config/redisClient.js';

export const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    return res.status(201).json(user);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('authController(register) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const login = async (req, res) => {
  try {
    const token = await authService.loginUser(req.body);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: !env.isDevelopment,
      sameSite: 'strict',
      maxAge: parseInt(env.maxAgeCookies), // 1 hora
    });

    res.status(200).json({
      message: 'Login realizado com sucesso',
    });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('authController(login) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const me = await authService.getMe(req.user.id);
    return res.status(200).json(me);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('authController(getMe) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies?.access_token;

  if (token) {
    await redisClient.set(`revoked-token:${token}`, 'true', 'EX', 60 * 60 * 24); // 1 dia
  }

  res.clearCookie('access_token', {
    httpOnly: true,
    secure: !env.isDevelopment,
    sameSite: 'strict',
  });

  return res.status(200).json({ message: 'Logout realizado com sucesso' });
};
