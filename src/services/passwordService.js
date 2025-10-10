import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import enviarEmail from '../utils/email.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export const enviarRecuperacao = async (userInfo, req) => {
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

  await prisma.usuario.update({
    where: { id: user.id },
    data: { tokenResetarSenha: resetToken },
  });

  //enviar email
  const urlRecuperacao = `${req.protocol}://${req.get(
    'host',
  )}/resetPassword/${resetToken}`;
  const mensagem = `<h3>Olá, ${user.nome}</h3>
                    <p>Você solicitou a redefinição de sua senha. Clique no link abaixo para criar uma nova senha</p>
                    <span>
                    <a href="${urlRecuperacao}" style="background-color: #4CAF50;
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
    await enviarEmail({
      email: user.email,
      subject: 'Recuperação de senha Alumni Fatec Sorocaba',
      message: mensagem,
    });
  } catch (err) {
    await prisma.usuario.update({
      where: { id: user.id },
      data: { tokenResetarSenha: undefined },
    });
    throw new CustomError(
      'Algo de errado aconteceu. Por favor, tente novamente mais tarde',
      500,
    );
  }
};

export const resetarSenha = async userInfo => {
  const token = userInfo.params.token;

  jwt.verify(token, JWT_SECRET);

  const user = await prisma.usuario.findFirst({
    where: { tokenResetarSenha: token },
  });

  if (!user) {
    throw new CustomError('Erro inesperado, tente novamente mais tarde', 500);
  }

  if (userInfo.body.password == null || userInfo.body.password == '') {
    throw new CustomError('Senha inválida', 401);
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(userInfo.body.password, salt);

  await prisma.usuario.update({
    where: { id: user.id },
    data: {
      senha: hashPassword,
      tokenResetarSenha: undefined,
      senhaAlteradaEm: new Date(),
    },
  });
};
