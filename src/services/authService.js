import { PrismaClient } from '../generated/prisma/index.js';
import { UserType } from '../generated/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CustomError from '../utils/CustomError.js';
import * as validations from '../utils/validations.js';
import { env } from '../config/env.js';

const prisma = new PrismaClient();

//Cadastro
export const registerUser = async (userInfo) => {
  validations.validateEmail(userInfo.email);

  const isExist = await prisma.user.findUnique({
    where: { email: userInfo.email },
  });

  if (isExist) {
    throw new CustomError('Usuário já cadastrado!', 409);
  }

  if (!Object.values(UserType).includes(userInfo.userType)) {
    throw new CustomError('Tipo de usuário inválido!', 422);
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

  await prisma.user.create({
    data: {
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
            abbreviation: course.abbreviation,
            enrollmentYear: Number(userInfo.enrollmentYear),
          },
        ],
      },
    },
  });

  return { message: 'Usuário cadastrado com sucesso!' };
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

  if (user.user_status == 'InAnalysis') {
    throw new CustomError('Usuário pendente de aprovação!', 401);
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
