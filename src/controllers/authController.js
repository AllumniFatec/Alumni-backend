import * as authService from '../services/authService.js';
import CustomError from '../utils/CustomError.js';

export const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
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
      secure: process.env.NODE_ENV != 'development',
      sameSite: 'strict',
      maxAge: parseInt(process.env.MAX_AGE_COOKIES), // 1 hora
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
