import * as authService from '../services/authService.js';
import CustomError from '../utils/CustomError.js';
import { env } from '../config/env.js';
import { logAction } from '../modules/auditLog/auditLog.service.js';
import { AUTH_LOGIN, AUTH_LOGIN_FAILED, AUTH_LOGOUT } from '../common/enums/auditActions.js';

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
    const { token, userId } = await authService.loginUserWithUserId(req.body);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: !env.isDevelopment,
      sameSite: 'strict',
      maxAge: parseInt(env.maxAgeCookies), // 1 hora
    });

    await logAction({
      userId,
      action: AUTH_LOGIN,
      entity: 'AUTH',
      entityId: userId,
      description: 'Login realizado com sucesso',
      metadata: undefined,
      req,
    });

    res.status(200).json({
      message: 'Login realizado com sucesso',
    });
  } catch (err) {
    // Audit: tentativa de login falhou (sem logar senha/JWT/etc)
    await logAction({
      userId: null,
      action: AUTH_LOGIN_FAILED,
      entity: 'AUTH',
      entityId: undefined,
      description: 'Falha ao realizar login',
      metadata: {
        email: req.body?.email,
        reason: err?.message,
      },
      req,
    });

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
  // Audit: logout (req.user existe porque a rota é protegida)
  logAction({
    userId: req.user?.id,
    action: AUTH_LOGOUT,
    entity: 'AUTH',
    entityId: req.user?.id,
    description: 'Logout realizado',
    metadata: undefined,
    req,
  });
  return res.status(200).json({ message: 'Logout realizado com sucesso' });
};
