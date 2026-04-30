import * as authService from '../services/authService.js';
import CustomError from '../utils/CustomError.js';
import { env } from '../config/env.js';
import { redisClient } from '../config/redisClient.js';
import jwt from 'jsonwebtoken';

export const cookieOptions = {
  httpOnly: true,
  secure: !env.isDevelopment,
  sameSite: env.isDevelopment ? 'lax' : 'none',
  domain: env.isDevelopment ? undefined : '.alumnifatecso.com.br',
};

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
    const loginResult = await authService.loginUser(req.body);

    if (loginResult?.requiresReactivation) {
      res.clearCookie('access_token', cookieOptions);

      res.cookie('reactivate_token', loginResult.reactivateToken, {
        ...cookieOptions,
        maxAge: 5 * 60 * 1000,
      });

      return res.status(409).json({
        name: loginResult.name,
        deleted_at: loginResult.deleted_at,
        message: loginResult.message,
      });
    }

    res.cookie('access_token', loginResult, {
      ...cookieOptions,
      maxAge: parseInt(env.maxAgeCookies),
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
    const decoded = jwt.verify(token, env.jwtSecret);
    const now = Math.floor(Date.now() / 1000);
    const exp = decoded.exp;
    const ttl = exp - now;

    await redisClient.set(`revoked-token:${token}`, 'true', 'EX', ttl); // resto de tempo do token
  }

  res.clearCookie('access_token', cookieOptions);

  return res.status(200).json({ message: 'Logout realizado com sucesso' });
};

export const reactivate = async (req, res) => {
  try {
    const reactivateToken = req.user;
    const token = req.cookies?.reactivate_token;

    const reactivatedUser = await authService.reactivateUser(reactivateToken);

    if (token) {
      const now = Math.floor(Date.now() / 1000);
      const ttl = reactivateToken.exp - now;

      if (ttl > 0) {
        await redisClient.set(`revoked-token:${token}`, 'true', 'EX', ttl);
      }
    }

    res.clearCookie('reactivate_token', cookieOptions);

    return res.status(200).json(reactivatedUser);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('authController(reactivate) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};
