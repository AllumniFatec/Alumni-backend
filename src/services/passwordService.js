import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { enqueueEmail } from '../queues/emailQueue.js';
import * as validations from '../utils/validations.js';
import { env } from '../config/env.js';
import CustomError from '../utils/CustomError.js';
import { messagePasswordRecovery } from '../utils/emailMessages.js';

export const sendRecovery = async (userInfo, req) => {
  validations.validateEmail(userInfo.email);

  //pegar usuario com base no email informado
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (!user) {
    throw new CustomError('Usuário não encontrado!', 404);
  }

  //gerar o token para resetar senha
  const resetToken = jwt.sign({ id: user.user_id }, env.jwtSecret, {
    expiresIn: '10m',
  });

  await prisma.user.update({
    where: { user_id: user.user_id },
    data: { token_password_reset: resetToken },
  });

  //enviar email
  const urlRecovery = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
  const message = messagePasswordRecovery(user.name, urlRecovery);

  // Mesmo padrão do admin: enfileira e não bloqueia o fluxo da rota.
  enqueueEmail({
    email: user.email,
    subject: 'Recuperação de Senha Alumni Fatec Sorocaba',
    message: message,
    jobKey: `password-recovery:${user.user_id}:${resetToken}`,
  });
};

export const resetPassword = async (userInfo) => {
  const token = userInfo.params.token;

  const password = userInfo.body.password;
  const confirmPassword = userInfo.body.confirmPassword;

  const user = await prisma.user.findFirst({
    where: { token_password_reset: token },
  });

  if (!user) {
    throw new CustomError('Erro inesperado, tente novamente mais tarde', 500);
  }

  validations.validatePassword(password);
  validations.validatePassword(confirmPassword);

  if (password !== confirmPassword) {
    throw new CustomError('Senhas não conferem!', 422);
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  await prisma.user.update({
    where: { user_id: user.user_id },
    data: {
      password: hashPassword,
      token_password_reset: null,
      updated_password: new Date(),
    },
  });
};
