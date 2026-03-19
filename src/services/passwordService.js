import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/email.js';
import * as validations from '../utils/validations.js';
import { env } from '../config/env.js';
import CustomError from '../utils/CustomError.js';

const prisma = new PrismaClient();

export const sendRecovery = async (userInfo, req) => {
  validations.validateEmail(userInfo.email);

  //pegar usuario com base no email informado
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (!user) {
    throw new CustomError('Email não cadastrado!', 404);
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
  const message = `<div style="width: 100%; text-align: center; font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px 0;">
  <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <tr>
      <td align="center" style="color: #333333; font-size: 18px;">
        <h3 style="margin-top: 0;">Olá, ${user.name}</h3>
        <p style="margin: 10px 0 20px 0;">Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:</p>

        <a href="${urlRecovery}" 
           style="background-color: #AE0C0D;
                  color: white;
                  padding: 12px 30px;
                  text-decoration: none;
                  border-radius: 8px;
                  display: inline-block;
                  font-weight: bold;
                  margin: 20px 0;">
          REDEFINIR SENHA
        </a>

        <p style="margin-top: 20px; color: #555555;">Este link irá expirar em 10 minutos.</p>
        <p style="margin-top: 10px; color: #777777; font-size: 14px;">Se você não reconhece esta solicitação, apenas ignore este e-mail.</p>
      </td>
    </tr>
  </table>
</div>`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Recuperação de Senha Alumni Fatec Sorocaba',
      message: message,
    });
  } catch (err) {
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { token_password_reset: undefined },
    });
    throw new CustomError('Algo de errado aconteceu. Por favor, tente novamente mais tarde', 500);
  }
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
    throw new CustomError('Senhas não conferem!', 404);
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
