/**
 * Formato único de post na API (feed, perfil, create/update).
 * Campos alinhados ao contrato consumido pelo frontend.
 */

export const normalizePhoto = (photo) => {
  if (!photo) return undefined;
  if (typeof photo === 'string') return photo;
  if (typeof photo === 'object') return photo.secure_url || photo.url || undefined;
  return undefined;
};

const formatComment = (comment) => {
  if (comment.author.user_status !== 'Active') {
    return {
      id: comment.comment_id,
      content: comment.content,
      create_date: comment.create_date,
      user_id: comment.author.user_id,
      user_name: 'Usuário excluído',
      user_perfil_photo: undefined,
      user_status: comment.author.user_status,
      user_course_abbreviation: undefined,
      user_course_enrollmentYear: undefined,
    };
  }

  return {
    id: comment.comment_id,
    content: comment.content,
    create_date: comment.create_date,
    user_id: comment.author.user_id,
    user_name: comment.author.name,
    user_perfil_photo: normalizePhoto(comment.author.perfil_photo),
    user_status: comment.author.user_status,
    user_course_abbreviation: comment.author.courses[0]?.abbreviation,
    user_course_enrollmentYear: comment.author.courses[0]?.enrollmentYear,
  };
};

const formatLike = (like) => ({
  id: like.like_id,
  create_date: like.create_date,
  user_id: like.author.user_id,
  user_name: like.author.name,
  user_perfil_photo: normalizePhoto(like.author.perfil_photo),
  user_status: like.author.user_status,
  user_course_abbreviation: like.author.courses[0]?.abbreviation,
  user_course_enrollmentYear: like.author.courses[0]?.enrollmentYear,
});

/**
 * Select Prisma reutilizável para carregar um post com autor, comentários e curtidas
 * (mesma árvore que o feed).
 */
export const postSelectForApi = {
  post_id: true,
  content: true,
  create_date: true,
  images: true,
  comments: {
    where: {
      status: 'Active',
    },
    orderBy: {
      create_date: 'asc',
    },
    select: {
      comment_id: true,
      content: true,
      create_date: true,
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
  },
  comments_count: true,
  likes: {
    where: {
      status: 'Active',
      author: {
        user_status: 'Active',
      },
    },
    select: {
      like_id: true,
      create_date: true,
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
};

export function formatPost(post) {
  return {
    id: post.post_id,
    content: post.content,
    create_date: post.create_date,
    images: post.images ?? [],
    user_id: post.author.user_id,
    user_name: post.author.name,
    user_perfil_photo: normalizePhoto(post.author.perfil_photo),
    user_status: post.author.user_status,
    user_course_abbreviation: post.author.courses[0]?.abbreviation,
    user_course_enrollmentYear: post.author.courses[0]?.enrollmentYear,
    comments_count: post.comments_count,
    likes_count: post.likes_count,
    comments: post.comments.map(formatComment),
    likes: post.likes.map(formatLike),
  };
}
