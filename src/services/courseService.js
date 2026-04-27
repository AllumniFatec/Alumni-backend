import prisma from '../config/prisma.js';

const actions = {
  getCourses: 'listar cursos',
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
