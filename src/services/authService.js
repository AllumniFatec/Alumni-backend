import { PrismaClient, UserType, UserGender } from '../generated/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import CustomError from '../utils/CustomError.js';
import * as validations from '../utils/validations.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

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

  await prisma.user.create({
    data: {
      name: userInfo.name,
      email: userInfo.email,
      password: hashPassword,
      gender: userInfo.gender,
      userType: userInfo.userType,

      courses: {
        set: [
          {
            courseId: course.id,
            courseName: course.name,
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

  validations.validatePassword(userInfo.password);

  const isMatch = await bcrypt.compare(userInfo.password, user.password);

  if (!isMatch) {
    throw new CustomError('Senha incorreta!', 401);
  }

  const isAdmin = user.userType == 'Admin';

  const token = jwt.sign(
    {
      id: user.id,
      admin: isAdmin,
    },
    JWT_SECRET,
    { expiresIn: '5d' }
  );

  return token;
};

//Listar
export const listUsers = async (page = 1, limit = 20) => {
  var listUsers = [];

  /*
   
  const users = await prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      gender: true,
      userType: true,
      courses: {
        select: {
          courseName: true,
          enrollmentYear: true,
        },
      },
      createDate: true,
    },
  });
  */

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      //skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createDate: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        userType: true,
        courses: {
          select: {
            courseName: true,
            enrollmentYear: true,
          },
        },
        createDate: true,
      },
    }),
    prisma.user.count(),
  ]);

  /*
  users.forEach((user) => {
    listUsers.push({
      id: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      userType: user.userType,
      course: user.courses?.[0].courseName ?? null,
      enrollmentYear: user.courses?.[0].enrollmentYear ?? null,
      createDate: user.createDate,
    });
  });

  
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

  listUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    gender: user.gender,
    userType: user.userType,
    course: user.courses?.[0]?.courseName ?? null,
    enrollmentYear: user.courses?.[0]?.enrollmentYear ?? null,
    createDate: user.createDate,
  }));

  return {
    data: listUsers,
    page,
    limit,
    total,
    totalPage: Math.ceil(total / limit),
  };
};
