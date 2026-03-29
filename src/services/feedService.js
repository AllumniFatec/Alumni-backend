import { PrismaClient } from '../generated/prisma/index.js';
import { authenticateUser } from './userService.js';
import { formatPost, normalizePhoto, postSelectForApi } from './postApiFormatter.js';

const prisma = new PrismaClient();

const actions = {
  loadFeed: 'carregar feed',
};

export const loadFeed = async (page = 1, userToken) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.loadFeed, async (user) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const limit = 20;

    const skip = (page - 1) * limit;

    const [posts, users, events, jobs] = await Promise.all([
      prisma.post.findMany({
        skip,
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
    };
  });
};
