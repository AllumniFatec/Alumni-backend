import prisma from '../config/prisma.js';
import { authenticateUser } from './userService.js';
import { formatPost, normalizePhoto, postSelectForApi } from '../utils/postApiFormatter.js';
import { getPageNumber } from '../utils/validations.js';

const actions = {
  loadFeed: 'carregar feed',
};

export const loadFeed = async (page = 1, userToken) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.loadFeed, async (user) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const limit = 20;

    const currentPageNumber = getPageNumber(page);

    const skip = (currentPageNumber - 1) * limit;

    const [posts, totalPosts, users, events, jobs] = await Promise.all([
      prisma.post.findMany({
        skip: skip,
        take: limit,
        where: {
          status: 'Active',
          author: {
            user_status: 'Active',
          },
        },
        orderBy: {
          create_date: 'desc',
        },
        select: postSelectForApi,
      }),

      prisma.post.count({
        where: {
          status: 'Active',
          author: {
            user_status: 'Active',
          },
        },
      }),

      prisma.user.findMany({
        where: {
          user_status: 'Active',
        },
        orderBy: {
          create_date: 'desc',
        },
        take: 5,
        select: {
          user_id: true,
          name: true,
          perfil_photo: true,
          courses: {
            select: {
              course_name: true,
              enrollmentYear: true,
            },
          },
        },
      }),

      prisma.event.findMany({
        where: {
          date_start: {
            gte: today,
          },
          status: 'Active',
        },
        orderBy: {
          date_start: 'asc',
        },
        take: 5,
        select: {
          event_id: true,
          title: true,
          local: true,
          date_start: true,
        },
      }),

      prisma.job.findMany({
        where: {
          status: 'Active',
        },
        orderBy: {
          create_date: 'desc',
        },
        take: 5,
        select: {
          job_id: true,
          title: true,
          workplace: {
            select: {
              company: true,
            },
          },
          location: {
            select: {
              city: true,
              state: true,
            },
          },
          work_model: true,
        },
      }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.user_id,
      name: u.name,
      perfil_photo: normalizePhoto(u.perfil_photo),
      course_name: u.courses[0].course_name,
      enrollmentYear: u.courses[0].enrollmentYear,
    }));

    const formattedPosts = posts.map((post) => formatPost(post));

    const totalPages = Math.ceil(totalPosts / limit);

    const formattedEvents = events.map((event) => ({
      id: event.event_id,
      title: event.title,
      local: event.local,
      date_start: event.date_start,
    }));

    const formattedJobs = jobs.map((job) => ({
      id: job.job_id,
      title: job.title,
      company: job.workplace?.company,
      city: job.location?.city,
      state: job.location?.state,
      work_model: job.work_model,
    }));

    return {
      posts: formattedPosts,
      latestUsers: formattedUsers,
      latestEvents: formattedEvents,
      latestJobs: formattedJobs,
      pagination: {
        page: currentPageNumber,
        limit: limit,
        totalItems: totalPosts,
        totalPages: totalPages,
        hasNextPage: currentPageNumber < totalPages,
        hasPreviousPage: currentPageNumber > 1,
      },
    };
  });
};
