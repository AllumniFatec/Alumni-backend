import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

//Cadastro
export const loadFeed = async (page = 1) => {
  const limit = 20;

  const skip = (page - 1) * limit;

  const [posts, users, events, jobs] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      where: {
        status: 'Active',
      },
      orderBy: {
        create_date: 'desc',
      },
      select: {
        post_id: true,
        content: true,
        create_date: true,
        comments: {
          where: {
            status: 'Active',
          },
          select: {
            comment_id: true,
            content: true,
            create_date: true,
            user: {
              select: {
                user_id: true,
                name: true,
                perfil_photo: true,
                user_status: true,
                courses: {
                  select: {
                    abbreviation: true,
                    enrollmentYear: true,
                  },
                },
              },
            },
          },
        },
        comments_count: true,
        likes: {
          select: {
            like_id: true,
            create_date: true,
            user: {
              select: {
                user_id: true,
                name: true,
                perfil_photo: true,
                user_status: true,
                courses: {
                  select: {
                    abbreviation: true,
                    enrollmentYear: true,
                  },
                },
              },
            },
          },
        },
        likes_count: true,
        author: {
          select: {
            user_id: true,
            name: true,
            perfil_photo: true,
            user_status: true,
            courses: {
              select: {
                abbreviation: true,
                enrollmentYear: true,
              },
            },
          },
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
      orderBy: {
        create_date: 'desc',
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
      orderBy: {
        create_date: 'desc',
      },
      take: 5,
      select: {
        job_id: true,
        title: true,
        company: true,
        localtion: {
          select: {
            city: true,
            state: true,
          },
        },
        work_model: true,
      },
    }),
  ]);

  const formattedUsers = users.map((user) => ({
    id: user.user_id,
    name: user.name,
    perfil_photo: user.perfil_photo,
    course_name: user.courses[0].course_name,
    enrollmentYear: user.courses[0].enrollmentYear,
  }));

  const formattedPosts = posts.map((post) => ({
    id: post.post_id,
    content: post.content,
    create_date: post.create_date,
    user_id: post.author.user_id,
    user_name: post.author.name,
    user_perfil_photo: post.author.perfil_photo,
    user_status: post.author.user_status,
    user_course_abbreviation: post.author.courses[0]?.abbreviation,
    user_course_enrollmentYear: post.author.courses[0]?.enrollmentYear,
    comments_count: post.comments_count,
    likes_count: post.likes_count,
    comments: post.comments.map((comment) => ({
      id: comment.comment_id,
      content: comment.content,
      create_date: comment.create_date,
      user_id: comment.user.user_id,
      user_name: comment.user.name,
      user_perfil_photo: comment.user.perfil_photo,
      user_status: comment.user.user_status,
      user_course_abbreviation: comment.user.courses[0]?.abbreviation,
      user_course_enrollmentYear: comment.user.courses[0]?.enrollmentYear,
    })),
    likes: post.likes.map((like) => ({
      id: like.like_id,
      create_date: like.create_date,
      user_id: like.user.user_id,
      user_name: like.user.name,
      user_perfil_photo: like.user.perfil_photo,
      user_status: like.user.user_status,
      user_course_abbreviation: like.user.courses[0]?.abbreviation,
      user_course_enrollmentYear: like.user.courses[0]?.enrollmentYear,
    })),
  }));

  const formattedEvents = events.map((event) => ({
    id: event.event_id,
    title: event.title,
    local: event.local,
    date_start: event.date_start,
  }));

  const formattedJobs = jobs.map((job) => ({
    id: job.job_id,
    title: job.title,
    company: job.company,
    city: job.localtion?.city,
    state: job.localtion?.state,
    work_model: job.work_model,
  }));

  return {
    posts: formattedPosts,
    latestUsers: formattedUsers,
    latestEvents: formattedEvents,
    latestJobs: formattedJobs,
  };
};
