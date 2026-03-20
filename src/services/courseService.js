import { PrismaClient } from '../generated/prisma/index.js';
import CustomError from '../utils/CustomError.js';
import { normalizeText } from '../utils/validations.js';

const prisma = new PrismaClient();

//Cadastro
export const createCourse = async (courseInfo) => {
  const isExist = await prisma.course.findUnique({
    where: { name: courseInfo.courseName },
  });

  if (isExist) {
    throw new CustomError('Curso já cadastrado!', 409);
  }

  const normlize_name = normalizeText(courseInfo.courseName);

  await prisma.course.create({
    data: {
      name: courseInfo.courseName,
      normalize_name: normlize_name,
      abbreviation: courseInfo.courseAbbreviation,
    },
  });

  return { message: 'Curso cadastrado com sucesso!' };
};
