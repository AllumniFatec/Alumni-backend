import { UserType, UserGender } from '../generated/prisma/index.js';
import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CustomError from '../utils/CustomError.js';
import * as validations from '../utils/validations.js';
import { env } from '../config/env.js';

const prepareUserData = async (userData) => {
  const requiredFields = [
    'name',
    'email',
    'password',
    'gender',
    'userType',
    'course',
    'enrollmentYear',
  ];

  requiredFields.forEach((field) => {
    if (!userData[field] || String(userData[field]).trim() === '') {
      throw new CustomError(`Campo ${field} é obrigatório`, 400);
    }
  });

  const name = String(userData.name).trim();
  const email = String(userData.email).trim();
  const password = String(userData.password).trim();
  const gender = String(userData.gender).trim();
  const userType = String(userData.userType).trim();
  const course = String(userData.course).trim();
  const enrollmentYear = Number(userData.enrollmentYear);
  const studentId = String(userData.studentId).trim();

  validations.validateEmail(email);

  if (enrollmentYear < 1900 || enrollmentYear > new Date().getFullYear()) {
    throw new CustomError('Ano de ingresso inválido!', 422);
  }

  if (name.length < 3 || name.length > 150) {
    throw new CustomError('Nome deve ter entre 3 e 150 caracteres', 400);
  }

  if (!Object.values(UserType).includes(userType)) {
    throw new CustomError('Tipo de usuário inválido!', 422);
  }

  if (!Object.values(UserGender).includes(gender)) {
    throw new CustomError('Gênero de usuário inválido!', 422);
  }

  const createdCourse = await prisma.course.findUnique({
    where: { name: userData.course },
  });

  if (!createdCourse) {
    throw new CustomError('Curso informado inválido!', 422);
  }

  validations.validatePassword(password);

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(userData.password, salt);

  return {
    name: name,
    email: email,
    password: hashPassword,
    gender: gender,
    user_type: userType,
    student_id: studentId,
    courses: {
      set: [
        {
          course_id: createdCourse.course_id,
          course_name: createdCourse.name,
          course_search: createdCourse.normalize_name,
          abbreviation: createdCourse.abbreviation,
          enrollmentYear: enrollmentYear,
        },
      ],
    },
  };
};

//Cadastro
export const registerUser = async (data) => {
  const userData = await prepareUserData(data);

  const email = data.email;

  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

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
    user_type: user.user_type,
    admin: user.user_type === 'Admin',
    perfil_photo: user.perfil_photo ?? null,
  };
};

//Login
export const loginUser = async (userData) => {
  validations.validateEmail(userData.email);
  validations.validatePassword(userData.password);

  const user = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (!user) {
    throw new CustomError('Usuário não encontrado!', 404);
  }

  if (user.user_status !== 'Active') {
    throw new CustomError('Usuário não autorizado!', 403);
  }

  const isMatch = await bcrypt.compare(userData.password, user.password);

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
    { expiresIn: '1d' }
  );
  return token;
};
