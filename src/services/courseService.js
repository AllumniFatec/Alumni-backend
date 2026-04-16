import prisma from '../config/prisma.js';
import CustomError from '../utils/CustomError.js';
import { normalizeText } from '../utils/validations.js';
import { authenticateUser } from './userService.js';

const actions = {
  getCourses: 'listar cursos',
  createCourse: 'criar curso',
};

//Cadastro
export const createCourse = async (userToken, courseInfo) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.createCourse, async (user) => {
    if (user.user_type !== 'Admin') {
      throw new CustomError('Apenas usuários autorizados podem adicionar cursos', 403);
    }

    const isExist = await prisma.course.findUnique({
      where: { name: courseInfo.courseName },
    });

    if (isExist) {
      throw new CustomError('Curso já cadastrado!', 409);
    }

    const normalize_name = normalizeText(courseInfo.courseName);

    await prisma.course.create({
      data: {
        name: courseInfo.courseName,
        normalize_name: normalize_name,
        abbreviation: courseInfo.courseAbbreviation,
      },
    });

    return { message: 'Curso cadastrado com sucesso!' };
  });
};

export const getCourses = async () => {
  const courses = await prisma.course.findMany({
    orderBy: {
      name: 'asc',
    },
    select: {
      course_id: true,
      name: true,
      abbreviation: true,
    },
  });

  return courses;
};
