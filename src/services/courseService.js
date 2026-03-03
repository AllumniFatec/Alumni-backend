import { PrismaClient } from '../generated/prisma/index.js';
import CustomError from '../utils/CustomError.js';

const prisma = new PrismaClient();

//Cadastro
export const createCourse = async (courseInfo) => {
  const isExist = await prisma.course.findUnique({
    where: { name: courseInfo.courseName },
  });

  if (isExist) {
    throw new CustomError('Curso já cadastrado!', 409);
  }

  await prisma.course.create({
    data: {
      name: courseInfo.courseName,
      abbreviation: courseInfo.courseAbbreviation,
    },
  });

  return { message: 'Curso cadastrado com sucesso!' };
};
