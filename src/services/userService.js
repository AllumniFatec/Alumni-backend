import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

//Cadastro
export const cadastrarUsuario = async (user) => {
  const isExist = await prisma.usuario.findUnique({
    where: { email: user.email },
  });

  if (isExist) {
    return console.log("Usuário ja cadastrado!");
  }

  const tipoUsuario = await prisma.tipoUsuario.findUnique({
    where: { tipoUsuario: user.type },
  });

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(user.password, salt);

  const usuario = await prisma.usuario.create({
    data: {
      nome: user.name,
      email: user.email,
      senha: hashPassword,
      anoIngressoFaculdade: user.yearJoin,
      idTipoUsuario: tipoUsuario.id,
    },
  });

  return usuario;
};
