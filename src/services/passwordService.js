import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/email.js';
import * as validations from '../utils/validations.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

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
  const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: '10m',
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { tokenPasswordReset: resetToken },
  });

  //enviar email
  const urlRecovery = `${req.protocol}://${req.get(
    'host',
  )}/resetPassword/${resetToken}`;
  const message = `<h3>Olá, ${user.name}</h3>
                    <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha</p>
                    <span>
                    <a href="${urlRecovery}" style="background-color: #4CAF50;
                                                        color: white;
                                                        padding: 12px 24px;
                                                        text-decoration: none;
                                                        border-radius: 8px;
                                                        display: inline-block;
                                                        font-weight: bold;">
                    REDEFINIR SENHA
                    </a>
                    <p>Este link irá expirar em 10 minutos.</p>
                    <span>
                    <span>
                    <p>Se não reconhece esta solicitação, apenas ignore.</p>`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Recuperação de senha Alumni Fatec Sorocaba',
      message: message,
    });
  } catch (err) {
    await prisma.user.update({
      where: { id: user.id },
      data: { tokenPasswordReset: undefined },
    });
    throw new CustomError(
      'Algo de errado aconteceu. Por favor, tente novamente mais tarde',
      500,
    );
  }
};

export const resetPassword = async userInfo => {
  const token = userInfo.params.token;

  const user = await prisma.user.findFirst({
    where: { tokenPasswordReset: token },
  });

  if (!user) {
    throw new CustomError('Erro inesperado, tente novamente mais tarde', 500);
  }

  validations.validatePassword(userInfo.body.password);

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(userInfo.body.password, salt);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashPassword,
      tokenPasswordReset: null,
      updatedPassword: new Date(),
    },
  });
};
