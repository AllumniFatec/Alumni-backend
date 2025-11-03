import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import CustomError from "../utils/CustomError.js";
import * as validations from "../utils/validations.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

//Cadastro
export const registerUser = async (userInfo) => {
  validations.validateEmail(userInfo.email);

  const isExist = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (isExist) {
    throw new CustomError("Usuário já cadastrado!", 409);
  }

  const userType = await prisma.userType.findUnique({
    where: { userType: userInfo.userType },
  });

  if (!userType) {
    throw new CustomError("Tipo de usuário inválido!", 422);
  }

  validations.validatePassword(userInfo.password);

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(userInfo.password, salt);

  const user = await prisma.user.create({
    data: {
      name: userInfo.name,
      email: userInfo.email,
      password: hashPassword,
      enrollmentYear: parseInt(userInfo.enrollmentYear),
      idUserType: userType.id.toString(),
      gender: userInfo.gender,
    },
  });

  const courseId = await prisma.course.findUnique({
    where: { name: userInfo.course },
  });

  await prisma.userCourse.create({
    data: {
      userId: user.id,
      courseId: courseId.id,
    },
  });

  return { message: "Usuário cadastrado com sucesso!" };
};

//Login
export const loginUser = async (userInfo) => {
  validations.validateEmail(userInfo.email);

  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
    include: { userType: true },
  });

  if (!user) {
    throw new CustomError("Usuário não encontrado!", 404);
  }

  validations.validatePassword(userInfo.password);

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

  return { token: token };
};

//Listar
export const listUsers = async () => {
  var listUsers = [];

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      enrollmentYear: true,
      gender: true,
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
      createDate: true,
    },
  });

  users.forEach((user) => {
    listUsers.push({
      id: user.id,
      name: user.name,
      email: user.email,
      enrollmentYear: user.enrollmentYear,
      gender: user.gender,
      userType: user.userType.userType,
      //courses: user.coursesRelation.map((c) => c.course.name),
      course: user.coursesRelation[0].course.name,
      createDate: user.createDate,
    });
  });

  return listUsers;
};
