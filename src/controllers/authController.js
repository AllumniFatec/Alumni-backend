import * as authService from '../services/authService.js';
import CustomError from '../utils/CustomError.js';
import { env } from '../config/env.js';

export const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    return res.status(201).json(user);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
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
    return res.status(500).json({ error: err.message });
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
    return res.status(500).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: !env.isDevelopment,
    sameSite: 'strict',
  });
  return res.status(200).json({ message: 'Logout realizado com sucesso' });
};
