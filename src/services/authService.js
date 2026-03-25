import { PrismaClient, UserType, UserGender } from '../generated/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CustomError from '../utils/CustomError.js';
import * as validations from '../utils/validations.js';
import { env } from '../config/env.js';

const prisma = new PrismaClient();

const prepareUserData = async (userInfo) => {
  validations.validateEmail(userInfo.email);

  if (!Object.values(UserType).includes(userInfo.userType)) {
    throw new CustomError('Tipo de usuário inválido!', 422);
  }

  if (!Object.values(UserGender).includes(userInfo.gender)) {
    throw new CustomError('Gênero de usuário inválido!', 422);
  }

  const course = await prisma.course.findUnique({
    where: { name: userInfo.course },
  });

  if (!course) {
    throw new CustomError('Curso informado inválido!', 422);
  }

  validations.validatePassword(userInfo.password);

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(userInfo.password, salt);

  return {
    name: userInfo.name,
    email: userInfo.email,
    password: hashPassword,
    gender: userInfo.gender,
    user_type: userInfo.userType,
    courses: {
      set: [
        {
          course_id: course.course_id,
          course_name: course.name,
          course_search: course.normalize_name,
          abbreviation: course.abbreviation,
          enrollmentYear: Number(userInfo.enrollmentYear),
        },
      ],
    },
  };
};

//Cadastro
export const registerUser = async (userInfo) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  const userData = await prepareUserData(userInfo);

  if (existingUser?.user_status === 'Refused') {
    await prisma.user.update({
      where: { user_id: existingUser.user_id },
      data: {
        ...userData,
        user_status: 'InAnalysis',
      },
    });

    return { message: 'Usuário recadastrado com sucesso!' };
  }

  if (existingUser) {
    throw new CustomError('Usuário já cadastrado!', 409);
  }

  await prisma.user.create({
    data: userData,
  });

  return { message: 'Usuário cadastrado com sucesso!' };
};

//Login
export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      name: true,
      email: true,
      user_type: true,
      perfil_photo: true,
    },
  });

  if (!user) {
    throw new CustomError('Usuário não encontrado', 404);
  }

  return {
    id: user.user_id,
    name: user.name,
    email: user.email,
    admin: user.user_type === 'Admin',
    perfil_photo: user.perfil_photo ?? null,
  };
};

//Login
export const loginUser = async (userInfo) => {
  validations.validateEmail(userInfo.email);

  const user = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (!user) {
    throw new CustomError('Usuário não encontrado!', 404);
  }

  if (user.user_status !== 'Active') {
    throw new CustomError('Usuário não autorizado!', 403);
  }

  validations.validatePassword(userInfo.password);
  const isMatch = await bcrypt.compare(userInfo.password, user.password);

  if (!isMatch) {
    throw new CustomError('Senha incorreta!', 401);
  }

  const isAdmin = user.user_type == 'Admin';

  const token = jwt.sign(
    {
      id: user.user_id,
      admin: isAdmin,
    },
    env.jwtSecret,
    { expiresIn: '5d' }
  );
  return token;
};
