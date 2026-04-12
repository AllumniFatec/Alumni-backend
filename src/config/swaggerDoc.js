export const swaggerDoc = {
  openapi: '3.0.0',
  info: {
    title: 'Alumni Backend API',
    version: '1.0.0',
    description:
      'Documentação de referência da API Alumni Backend. Os modelos abaixo refletem os JSONs retornados pelos endpoints; as chamadas reais continuam protegidas por autenticação no servidor.',
  },
  tags: [
    { name: 'Auth', description: 'Autenticação e sessão' },
    { name: 'User', description: 'Usuários e perfil' },
    { name: 'Admin', description: 'Rotas administrativas' },
    { name: 'Course', description: 'Cursos' },
    { name: 'Workplace', description: 'Vagas e locais de trabalho' },
    { name: 'Feed', description: 'Feed de posts' },
    { name: 'Post', description: 'Posts, comentários e likes' },
    { name: 'Event', description: 'Eventos' },
    { name: 'Job', description: 'Vagas de emprego' },
    { name: 'Notification', description: 'Notificações' },
    { name: 'Password', description: 'Recuperação de senha' },
    { name: 'Image', description: 'Upload de imagens' },
  ],
  components: {
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          status: { type: 'integer', example: 400 },
        },
      },
      GenericResponse: {
        oneOf: [
          { type: 'object', additionalProperties: true },
          { type: 'array', items: { type: 'object', additionalProperties: true } },
        ],
      },
      AuthRegister: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          confirmPassword: { type: 'string' },
        },
        required: ['name', 'email', 'password', 'confirmPassword'],
      },
      AuthLogin: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      AuthMeResponse: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          user_type: { type: 'string' },
          admin: { type: 'boolean' },
          perfil_photo: { type: 'string', nullable: true },
        },
      },
      ForgotPassword: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
        },
        required: ['email'],
      },
      ResetPassword: {
        type: 'object',
        properties: {
          password: { type: 'string' },
          confirmPassword: { type: 'string' },
        },
        required: ['password', 'confirmPassword'],
      },
      UserProfileUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          bio: { type: 'string' },
        },
      },
      WorkplaceInput: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          role: { type: 'string' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          description: { type: 'string' },
        },
      },
      SkillInput: {
        type: 'object',
        properties: {
          skill: { type: 'string' },
        },
        required: ['skill'],
      },
      SocialMediaInput: {
        type: 'object',
        properties: {
          platform: { type: 'string' },
          url: { type: 'string', format: 'uri' },
        },
      },
      PostInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
      CommentInput: {
        type: 'object',
        properties: {
          text: { type: 'string' },
        },
        required: ['text'],
      },
      EventInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          location: { type: 'string' },
        },
      },
      JobInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          company: { type: 'string' },
          description: { type: 'string' },
          location: { type: 'string' },
        },
      },
      CourseInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          institution: { type: 'string' },
          duration: { type: 'string' },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          totalItems: { type: 'integer', example: 42 },
          totalPages: { type: 'integer', example: 3 },
          hasNextPage: { type: 'boolean' },
          hasPreviousPage: { type: 'boolean' },
        },
      },
      JobListItem: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'ID da vaga (ObjectId)' },
          title: { type: 'string' },
          author_id: { type: 'string' },
          workplace: { type: 'string', description: 'Nome da empresa' },
          city: { type: 'string' },
          state: { type: 'string' },
          employment_type: {
            type: 'string',
            enum: [
              'Internship',
              'Trainee',
              'Apprentice',
              'CLT',
              'Contractor',
              'Freelancer',
              'SelfEmployed',
            ],
          },
          work_model: { type: 'string', enum: ['Remote', 'OnSite', 'Hybrid'] },
          status: { type: 'string', enum: ['Active', 'Inactive', 'Closed', 'Canceled', 'Deleted'] },
          create_date: { type: 'string', format: 'date-time' },
        },
      },
      JobsListResponse: {
        type: 'object',
        properties: {
          jobs: { type: 'array', items: { $ref: '#/components/schemas/JobListItem' } },
          pagination: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      JobDetail: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          author_id: { type: 'string' },
          author_name: { type: 'string' },
          author_perfil_photo: { type: 'string', nullable: true },
          author_workplace: { type: 'string', nullable: true },
          author_course_abbreviation: { type: 'string', nullable: true },
          author_course_enrollmentYear: { type: 'integer', nullable: true },
          workplace: { type: 'string', nullable: true },
          city: { type: 'string' },
          state: { type: 'string' },
          country: { type: 'string' },
          employment_type: { type: 'string' },
          work_model: { type: 'string' },
          status: { type: 'string' },
          create_date: { type: 'string', format: 'date-time' },
          url: { type: 'string', format: 'uri', nullable: true },
        },
      },
      CourseEntity: {
        type: 'object',
        properties: {
          course_id: { type: 'string' },
          name: { type: 'string' },
          abbreviation: { type: 'string' },
        },
      },
      WorkplaceEntity: {
        type: 'object',
        properties: {
          workplace_id: { type: 'string' },
          company: { type: 'string' },
        },
      },
      FeedPostComment: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          create_date: { type: 'string', format: 'date-time' },
          user_id: { type: 'string' },
          user_name: { type: 'string' },
          user_perfil_photo: { type: 'string', nullable: true },
          user_status: { type: 'string' },
          user_course_abbreviation: { type: 'string', nullable: true },
          user_course_enrollmentYear: { type: 'integer', nullable: true },
        },
      },
      FeedPostLike: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          create_date: { type: 'string', format: 'date-time' },
          user_id: { type: 'string' },
          user_name: { type: 'string' },
          user_perfil_photo: { type: 'string', nullable: true },
          user_status: { type: 'string' },
          user_course_abbreviation: { type: 'string', nullable: true },
          user_course_enrollmentYear: { type: 'integer', nullable: true },
        },
      },
      FeedPost: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          create_date: { type: 'string', format: 'date-time' },
          images: { type: 'array', items: { description: 'Imagem (string URL ou objeto)' } },
          user_id: { type: 'string' },
          user_name: { type: 'string' },
          user_perfil_photo: { type: 'string', nullable: true },
          user_status: { type: 'string' },
          user_course_abbreviation: { type: 'string', nullable: true },
          user_course_enrollmentYear: { type: 'integer', nullable: true },
          comments_count: { type: 'integer' },
          likes_count: { type: 'integer' },
          comments: { type: 'array', items: { $ref: '#/components/schemas/FeedPostComment' } },
          likes: { type: 'array', items: { $ref: '#/components/schemas/FeedPostLike' } },
        },
      },
      FeedLatestUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          perfil_photo: { type: 'string', nullable: true },
          course_name: { type: 'string' },
          enrollmentYear: { type: 'integer' },
        },
      },
      FeedLatestEvent: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          local: { type: 'string' },
          date_start: { type: 'string', format: 'date-time' },
        },
      },
      FeedLatestJob: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          company: { type: 'string', nullable: true },
          city: { type: 'string', nullable: true },
          state: { type: 'string', nullable: true },
          work_model: { type: 'string' },
        },
      },
      FeedResponse: {
        type: 'object',
        properties: {
          posts: { type: 'array', items: { $ref: '#/components/schemas/FeedPost' } },
          latestUsers: { type: 'array', items: { $ref: '#/components/schemas/FeedLatestUser' } },
          latestEvents: { type: 'array', items: { $ref: '#/components/schemas/FeedLatestEvent' } },
          latestJobs: { type: 'array', items: { $ref: '#/components/schemas/FeedLatestJob' } },
          pagination: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      EventPublic: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          author_id: { type: 'string', nullable: true },
          author_name: { type: 'string', nullable: true },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          local: { type: 'string' },
          date_start: { type: 'string', format: 'date-time', nullable: true },
          date_end: { type: 'string', format: 'date-time', nullable: true },
          status: { type: 'string', nullable: true },
          images: {
            type: 'array',
            nullable: true,
            items: { description: 'Imagem (string URL ou objeto)' },
          },
        },
      },
      EventsListResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/EventPublic' } },
          pagination: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      NotificationEntity: {
        type: 'object',
        properties: {
          notification_id: { type: 'string' },
          title: { type: 'string' },
          message: { type: 'string' },
          link: { type: 'string', nullable: true },
          is_read: { type: 'boolean' },
        },
      },
      NotificationsListResponse: {
        type: 'object',
        properties: {
          notifications: {
            type: 'array',
            items: { $ref: '#/components/schemas/NotificationEntity' },
          },
          pagination: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      MessageResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      PostMutationResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          post: { $ref: '#/components/schemas/FeedPost' },
        },
      },
      ApiErrorBody: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
      UserListCard: {
        type: 'object',
        description: 'Item de usuário em listagens paginadas',
        properties: {
          user_id: { type: 'string' },
          name: { type: 'string' },
          perfil_photo: { description: 'URL ou objeto Cloudinary' },
          user_type: { type: 'string' },
          courses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                course_name: { type: 'string' },
                enrollmentYear: { type: 'integer' },
                abbreviation: { type: 'string' },
              },
            },
          },
          skills: { type: 'array', items: { type: 'object' } },
          workplace_history: { type: 'array', items: { type: 'object' } },
        },
      },
      UsersPaginatedResponse: {
        type: 'object',
        properties: {
          users: { type: 'array', items: { $ref: '#/components/schemas/UserListCard' } },
          pagination: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      UserSocialLink: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          url: { type: 'string' },
        },
      },
      UserProfileResponse: {
        type: 'object',
        description: 'Perfil público ou próprio (GET /user/:id e GET /my-profile)',
        properties: {
          user_id: { type: 'string' },
          perfil_photo: { description: 'URL ou objeto Cloudinary' },
          name: { type: 'string' },
          biography: { type: 'string', nullable: true },
          user_type: { type: 'string' },
          gender: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email', description: 'Somente em /my-profile' },
          receive_notifications: {
            type: 'boolean',
            description: 'Somente em /my-profile',
          },
          courses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                course_name: { type: 'string' },
                enrollmentYear: { type: 'integer' },
                abbreviation: { type: 'string' },
              },
            },
          },
          workplace_history: { type: 'array', items: { type: 'object' } },
          social_media: { type: 'array', items: { $ref: '#/components/schemas/UserSocialLink' } },
          skills: { type: 'array', items: { type: 'object' } },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                event_id: { type: 'string' },
                title: { type: 'string' },
                status: { type: 'string' },
              },
            },
          },
          jobs: { type: 'array', items: { $ref: '#/components/schemas/JobListItem' } },
          posts: { type: 'array', items: { $ref: '#/components/schemas/FeedPost' } },
        },
      },
      AdminUserInAnalysisCard: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          student_id: { type: 'string', nullable: true },
          gender: { type: 'string' },
          user_type: { type: 'string' },
          courses: { type: 'array', items: { type: 'object' } },
        },
      },
      AdminDashboardResponse: {
        type: 'object',
        properties: {
          usersInAnalysis: {
            type: 'array',
            items: { $ref: '#/components/schemas/AdminUserInAnalysisCard' },
          },
          countUsersInAnalysis: { type: 'integer' },
          countUsersActive: { type: 'integer' },
          countJobsActive: { type: 'integer' },
        },
      },
      AdminUsersInAnalysisList: {
        type: 'array',
        description: 'Página de usuários em análise (sem objeto pagination na resposta)',
        items: { $ref: '#/components/schemas/AdminUserInAnalysisCard' },
      },
      JobClosedRecord: {
        type: 'object',
        description: 'Registro Job retornado após fechar vaga (PATCH)',
        properties: {
          job_id: { type: 'string' },
          title: { type: 'string' },
          status: { type: 'string', example: 'Closed' },
          author_id: { type: 'string' },
          workplace_id: { type: 'string' },
          create_date: { type: 'string', format: 'date-time' },
        },
      },
      UserSearchResult: {
        description:
          'Sem termo de busca retorna []. Com busca, lista de usuários ou objeto com users + pagination.',
        oneOf: [
          { type: 'array', items: { $ref: '#/components/schemas/UserListCard' } },
          { $ref: '#/components/schemas/UsersPaginatedResponse' },
        ],
      },
    },
    responses: {
      GenericResponse: {
        description: 'Resposta genérica',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/GenericResponse' },
          },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar novo usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRegister' },
            },
          },
        },
        responses: {
          201: { $ref: '#/components/responses/GenericResponse' },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Fazer login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthLogin' },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Credenciais inválidas' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Dados do usuário autenticado',
        responses: {
          200: {
            description: 'Usuário da sessão',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthMeResponse' },
              },
            },
          },
          401: { description: 'Não autorizado' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout do usuário',
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Não autorizado' },
        },
      },
    },
    '/password/forgot-password': {
      post: {
        tags: ['Password'],
        summary: 'Solicitar recuperação de senha',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForgotPassword' },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
        },
      },
    },
    '/password/reset-password/{token}': {
      patch: {
        tags: ['Password'],
        summary: 'Resetar senha usando token',
        parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPassword' },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
          400: { description: 'Token inválido ou expirado' },
        },
      },
    },
    '/user/search': {
      get: {
        tags: ['User'],
        summary: 'Buscar usuários',
        parameters: [
          { name: 'search', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: {
            description: 'Lista vazia, lista de usuários ou resultado paginado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserSearchResult' },
              },
            },
          },
          401: { description: 'Não autorizado' },
        },
      },
    },
    '/user': {
      get: {
        tags: ['User'],
        summary: 'Listar usuários',
        parameters: [
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: {
            description: 'Usuários ativos com paginação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UsersPaginatedResponse' },
              },
            },
          },
          401: { description: 'Não autorizado' },
        },
      },
    },
    '/user/{id}': {
      get: {
        tags: ['User'],
        summary: 'Buscar usuário por ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          {
            name: 'pageEvent',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 },
          },
          { name: 'pageJob', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
          {
            name: 'pagePost',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Perfil do usuário',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserProfileResponse' },
              },
            },
          },
          401: { description: 'Não autorizado' },
          404: { description: 'Usuário não encontrado' },
        },
      },
    },
    '/my-profile': {
      get: {
        tags: ['User'],
        summary: 'Buscar meu perfil',
        parameters: [
          {
            name: 'pageEvent',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 },
          },
          { name: 'pageJob', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
          {
            name: 'pagePost',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Perfil autenticado (inclui email e preferências)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserProfileResponse' },
              },
            },
          },
          401: { description: 'Não autorizado' },
        },
      },
      put: {
        tags: ['User'],
        summary: 'Atualizar meu perfil',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserProfileUpdate' },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Não autorizado' },
        },
      },
      delete: {
        tags: ['User'],
        summary: 'Deletar meu perfil',
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Não autorizado' },
        },
      },
    },
    '/my-profile/profile-photo': {
      patch: {
        tags: ['User'],
        summary: 'Atualizar foto de perfil',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Não autorizado' },
        },
      },
    },
    '/my-profile/workplace': {
      post: {
        tags: ['User'],
        summary: 'Adicionar experiência de trabalho',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WorkplaceInput' },
            },
          },
        },
        responses: {
          201: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Não autorizado' },
        },
      },
      put: {
        tags: ['User'],
        summary: 'Atualizar experiência de trabalho',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WorkplaceInput' },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Não autorizado' },
        },
      },
      delete: {
        tags: ['User'],
        summary: 'Remover experiência de trabalho',
        parameters: [{ name: 'id', in: 'query', required: false, schema: { type: 'string' } }],
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Não autorizado' },
        },
      },
    },
    '/my-profile/skill': {
      post: {
        tags: ['User'],
        summary: 'Adicionar habilidade ao perfil',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SkillInput' },
            },
          },
        },
        responses: {
          201: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Não autorizado' },
        },
      },
      delete: {
        tags: ['User'],
        summary: 'Remover habilidade do perfil',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SkillInput' },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Não autorizado' },
        },
      },
    },
    '/my-profile/social-media': {
      post: {
        tags: ['User'],
        summary: 'Adicionar rede social',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SocialMediaInput' },
            },
          },
        },
        responses: {
          201: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Não autorizado' },
        },
      },
      patch: {
        tags: ['User'],
        summary: 'Atualizar rede social',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SocialMediaInput' },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Não autorizado' },
        },
      },
      delete: {
        tags: ['User'],
        summary: 'Remover rede social',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SocialMediaInput' },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
          401: { description: 'Não autorizado' },
        },
      },
    },
    '/admin/dashboard': {
      get: {
        tags: ['Admin'],
        summary: 'Painel administrativo',
        responses: {
          200: {
            description: 'Resumo e amostra de usuários em análise',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminDashboardResponse' },
              },
            },
          },
          401: { description: 'Não autorizado' },
        },
      },
    },
    '/admin/usersInAnalysis': {
      get: {
        tags: ['Admin'],
        summary: 'Listar usuários em análise',
        parameters: [
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: {
            description: 'Lista paginada de usuários em análise',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AdminUsersInAnalysisList' },
              },
            },
          },
        },
      },
    },
    '/admin/approve/{userId}': {
      post: {
        tags: ['Admin'],
        summary: 'Aprovar usuário',
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
        },
      },
    },
    '/admin/refuse/{userId}': {
      post: {
        tags: ['Admin'],
        summary: 'Recusar usuário',
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Listar todos os usuários',
        parameters: [
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: {
            description: 'Todos os usuários (admin) com paginação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UsersPaginatedResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/users/search': {
      get: {
        tags: ['Admin'],
        summary: 'Buscar usuários (admin)',
        parameters: [
          { name: 'search', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: {
            description: 'Resultado da busca (formato conforme serviço admin)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UsersPaginatedResponse' },
              },
            },
          },
        },
      },
    },
    '/admin/users/changeType/{id}': {
      patch: {
        tags: ['Admin'],
        summary: 'Alterar tipo de usuário',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                },
                required: ['type'],
              },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
        },
      },
    },
    '/course': {
      post: {
        tags: ['Course'],
        summary: 'Criar curso',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CourseInput' },
            },
          },
        },
        responses: {
          201: { $ref: '#/components/responses/GenericResponse' },
        },
      },
      get: {
        tags: ['Course'],
        summary: 'Listar cursos',
        responses: {
          200: {
            description: 'Lista de cursos cadastrados',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CourseEntity' },
                },
              },
            },
          },
        },
      },
    },
    '/workplace': {
      get: {
        tags: ['Workplace'],
        summary: 'Listar workplaces',
        responses: {
          200: {
            description: 'Lista de empresas cadastradas',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/WorkplaceEntity' },
                },
              },
            },
          },
        },
      },
    },
    '/feed': {
      get: {
        tags: ['Feed'],
        summary: 'Carregar feed',
        parameters: [
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: {
            description: 'Posts, destaques laterais e paginação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FeedResponse' },
              },
            },
          },
        },
      },
    },
    '/post': {
      post: {
        tags: ['Post'],
        summary: 'Criar post',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PostInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Post criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PostMutationResponse' },
              },
            },
          },
        },
      },
    },
    '/post/{id}': {
      patch: {
        tags: ['Post'],
        summary: 'Atualizar post',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PostInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Post atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PostMutationResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Post'],
        summary: 'Deletar post',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Confirmação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
        },
      },
    },
    '/post/comment/{id}': {
      post: {
        tags: ['Post'],
        summary: 'Criar comentário',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CommentInput' },
            },
          },
        },
        responses: {
          201: { $ref: '#/components/responses/GenericResponse' },
        },
      },
      patch: {
        tags: ['Post'],
        summary: 'Atualizar comentário',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CommentInput' },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
        },
      },
      delete: {
        tags: ['Post'],
        summary: 'Deletar comentário',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
        },
      },
    },
    '/post/like/{id}': {
      post: {
        tags: ['Post'],
        summary: 'Curtir ou descurtir post',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
        },
      },
    },
    '/event': {
      post: {
        tags: ['Event'],
        summary: 'Criar evento',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EventInput' },
            },
          },
        },
        responses: {
          201: { $ref: '#/components/responses/GenericResponse' },
        },
      },
      get: {
        tags: ['Event'],
        summary: 'Listar eventos',
        parameters: [
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: {
            description: 'Eventos ativos com paginação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EventsListResponse' },
              },
            },
          },
        },
      },
    },
    '/event/{id}': {
      get: {
        tags: ['Event'],
        summary: 'Buscar evento por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Detalhe do evento',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/EventPublic' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Event'],
        summary: 'Atualizar evento',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EventInput' },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
        },
      },
      delete: {
        tags: ['Event'],
        summary: 'Deletar evento',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
        },
      },
      patch: {
        tags: ['Event'],
        summary: 'Encerrar evento',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
        },
      },
    },
    '/job': {
      post: {
        tags: ['Job'],
        summary: 'Criar vaga',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JobInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'Vaga criada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Job'],
        summary: 'Listar vagas',
        parameters: [
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: {
            description: 'Vagas ativas com paginação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/JobsListResponse' },
              },
            },
          },
        },
      },
    },
    '/job/{id}': {
      get: {
        tags: ['Job'],
        summary: 'Buscar vaga por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Detalhe da vaga',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/JobDetail' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Job'],
        summary: 'Atualizar vaga',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/JobInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Confirmação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Job'],
        summary: 'Deletar vaga',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Confirmação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Job'],
        summary: 'Fechar vaga',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Vaga atualizada (registro Job)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/JobClosedRecord' },
              },
            },
          },
        },
      },
    },
    '/notification': {
      get: {
        tags: ['Notification'],
        summary: 'Listar notificações',
        parameters: [
          { name: 'page', in: 'query', required: false, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: {
            description: 'Notificações do usuário com paginação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotificationsListResponse' },
              },
            },
          },
        },
      },
    },
    '/notification/{id}': {
      patch: {
        tags: ['Notification'],
        summary: 'Marcar notificação como lida',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Confirmação',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
        },
      },
    },
    '/image-test': {
      post: {
        tags: ['Image'],
        summary: 'Upload de imagem',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  images: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { $ref: '#/components/responses/GenericResponse' },
        },
      },
    },
  },
};
