import * as passwordService from '../services/passwordService.js';
import CustomError from '../utils/CustomError.js';

export const forgotPassword = async (req, res) => {
  try {
    const resetToken = await passwordService.sendRecovery(req.body, req);
    return res.status(200).send('Email de recuperação enviado com sucesso.');
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const user = await passwordService.resetPassword(req);
    return res.status(200).send('Senha alterada com sucesso!');
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err });
  }
};
