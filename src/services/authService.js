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
      id: user.id,
      admin: isAdmin,
    },
    env.jwtSecret,
    { expiresIn: '5d' }
  );
  return token;
};

//Listar
export const listUsers = async () => {
  var listUsers = [];

  const users = await prisma.user.findMany({
    orderBy: {
      create_date: 'desc',
    },
    select: {
      user_id: true,
      name: true,
      email: true,
      gender: true,
      user_type: true,
      courses: true,
      create_date: true,
    },
  });

  users.forEach((user) => {
    listUsers.push({
      id: user.user_id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      user_type: user.user_type,
      course: user.courses[0].course_name,
      enrollmentYear: user.courses[0].enrollmentYear,
      create_date: user.create_date,
    });
  });

  /*
  users.forEach((user) => {
    listUsers.push({
      id: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      userType: user.userType,
      courses: user.courses.map((course) => ({
        courseName: course.courseName,
        enrollmentYear: course.enrollmentYear,
      })),
      createDate: user.createDate,
    });
  });
  */

  return listUsers;
};
