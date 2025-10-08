import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

//Cadastro
export const cadastrarUsuario = async (user) => {
  const isExist = await prisma.usuario.findUnique({
    where: { email: user.email },
  });

  if (isExist) {
    throw new Error("Usuário já cadastrado!");
  }

  const tipoUsuario = await prisma.tipoUsuario.findUnique({
    where: { tipoUsuario: user.type },
  });

  if (!tipoUsuario) {
    throw new Error("Tipo de usuário inválido!");
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(user.password, salt);

  const usuario = await prisma.usuario.create({
    data: {
      nome: user.name,
      email: user.email,
      senha: hashPassword,
      anoIngressoFaculdade: parseInt(user.yearJoin),
      idTipoUsuario: tipoUsuario.id,
    },
  });

  return { message: "Usuário cadastrado com sucesso!" };
};

//Login
export const loginUsuario = async (userInfo) => {
  const user = await prisma.usuario.findUnique({
    where: { email: userInfo.email },
    include: { tipoUsuario: true },
  });

  if (!user) {
    throw new Error("Usuário não encontrado!");
  }

  const isMatch = await bcrypt.compare(userInfo.password, user.senha);

  if (!isMatch) {
    throw new Error("Senha incorreta!");
  }

  const isAdmin = user.tipoUsuario.tipoUsuario == "Admin";

  const token = jwt.sign(
    {
      id: user.id,
      admin: isAdmin,
    },
    JWT_SECRET,
    { expiresIn: "10d" }
  );

  return token;
};

//Listar
export const listarUsuarios = async () => {
  const users = await prisma.usuario.findMany({
    select: {
      nome: true,
      email: true,
      anoIngressoFaculdade: true,
      tipoUsuario: {
        select: { tipoUsuario: true },
      },
    },
  });

  if (users.length === 0) {
    throw new Error("Nenhum usuario cadastrado!");
  }

  return users;
};
