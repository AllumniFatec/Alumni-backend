import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import CustomError from "../utils/CustomError.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

//Cadastro
export const registerUser = async (userInfo) => {
  const isExist = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (isExist) {
    throw new CustomError("Usuário já cadastrado!", 409);
  }

  const userType = await prisma.userType.findUnique({
    where: { userType: userInfo.type },
  });

  if (!userType) {
    throw new CustomError("Tipo de usuário inválido!", 422);
  }

  if (userInfo.password == null || userInfo.password == "") {
    throw new CustomError("Senha inválida", 401);
  }

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(userInfo.password, salt);

  const user = await prisma.user.create({
    data: {
      name: userInfo.name,
      email: userInfo.email,
      password: hashPassword,
      enrollmentYear: parseInt(userInfo.yearJoin),
      idUserType: userType.id,
    },
  });

  const courseId = await prisma.course.findUnique({
    where: { name: userInfo.course },
  });

  const relacoesCursos = await prisma.userCourse.create({
    data: {
      userId: user.id,
      courseId: courseId.id,
    },
  });

  return { message: "Usuário cadastrado com sucesso!" };
};

//Login
export const loginUser = async (userInfo) => {
  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
    include: { userType: true },
  });

  if (!user) {
    throw new CustomError("Usuário não encontrado!", 404);
  }

  const isMatch = await bcrypt.compare(userInfo.password, user.password);

  if (!isMatch) {
    throw new CustomError("Senha incorreta!", 401);
  }

  const isAdmin = user.userType.userType == "Admin";

  const token = jwt.sign(
    {
      id: user.id,
      admin: isAdmin,
    },
    JWT_SECRET,
    { expiresIn: "5d" }
  );

  return token;
};

//Listar
export const listUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      name: true,
      email: true,
      enrollmentYear: true,
      userType: {
        select: { userType: true },
      },
      coursesRelation: {
        select: {
          course: {
            select: { name: true },
          },
        },
      },
    },
  });

  return users;
};
