import * as passwordService from '../services/passwordService.js';

export const forgotPassword = async (req, res, next) => {
  try {
    const resetToken = await passwordService.enviarRecuperacao(req.body, req);
    res.status(200).send('Email de recuperação enviado com sucesso.');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const user = await passwordService.resetarSenha(req);
    res.status(200).send('Senha alterada com sucesso!');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
