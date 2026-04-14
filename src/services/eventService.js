import { PrismaClient } from '../generated/prisma/index.js';
import CustomError from '../utils/CustomError.js';
import { authenticateUser } from './userService.js';
import { capitalizeWords, getPageNumber } from '../utils/validations.js';
import { parse } from 'date-fns';
import { enqueueNotificationForAudience } from './notificationService.js';
import { notificationTypes } from '../utils/notificationTypes.js';

const prisma = new PrismaClient();

const actions = {
  createEvent: 'criar eventos',
  getEvents: 'listar eventos',
  getEventById: 'acessar evento',
  updateEvent: 'editar evento',
  deleteEvent: 'excluir evento',
  closeEvent: 'encerrar evento',
};

const removeNullFields = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined)
  );

export const formattedEvent = (event) =>
  removeNullFields({
    id: event.event_id,
    author_id: event.author_id ?? null,
    author_name: event.author?.name ?? null,
    title: event.title,
    description: event.description ?? null,
    local: event.local,
    date_start: event.date_start?.toISOString(),
    date_end: event.date_end?.toISOString() ?? null,
    status: event.status ?? null,
    images: event.images ?? null,
  });

function validateEventData(eventData) {
  const requiredFields = [
    'title',
    'description',
    'local',
    'date_start',
    'time_start',
    'date_end',
    'time_end',
  ];

  requiredFields.forEach((field) => {
    if (!eventData[field] || String(eventData[field]).trim() === '') {
      throw new CustomError(`Campo ${field} é obrigatório`, 400);
    }
  });

  const title = String(eventData.title).trim();
  const description = String(eventData.description).trim();
  const local = String(eventData.local).trim();

  if (title.length < 3 || title.length > 150) {
    throw new CustomError('Título deve ter entre 3 e 150 caracteres', 400);
  }

  if (local.length < 3 || local.length > 150) {
    throw new CustomError('Local deve ter entre 3 e 150 caracteres', 400);
  }

  if (description.length < 10 || description.length > 3000) {
    throw new CustomError('Descrição deve ter entre 10 e 3000 caracteres', 400);
  }

  const startDate = parse(
    `${eventData.date_start} ${eventData.time_start}`,
    'dd/MM/yyyy HH:mm',
    new Date()
  );
  const endDate = parse(
    `${eventData.date_end} ${eventData.time_end}`,
    'dd/MM/yyyy HH:mm',
    new Date()
  );

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new CustomError('Data ou hora inválidos', 400);
  }

  if (endDate.getTime() < startDate.getTime()) {
    throw new CustomError('Data de fim deve ser posterior a Data de início', 400);
  }

  return { title, description, local, startDate, endDate };
}

export const createEvent = async (userToken, eventData, host) => {
  const user_id = userToken.id;

  const { title, description, local, startDate, endDate } = validateEventData(eventData);

  return authenticateUser(user_id, actions.createEvent, async (user) => {
    if (user.user_type === 'Student' || user.user_type === 'Alumni') {
      throw new CustomError('Apenas usuários autorizados podem criar eventos', 403);
    }

    const formattedTitle = capitalizeWords(title);
    const formattedLocal = capitalizeWords(local);

    const newEvent = await prisma.event.create({
      data: {
        title: formattedTitle,
        description,
        local: formattedLocal,
        date_start: startDate,
        date_end: endDate,
        author_id: user.user_id,
      },
    });

    if (newEvent) {
      await enqueueNotificationForAudience({
        type: notificationTypes.EVENT_CREATED,
        title: 'Novo evento criado',
        message: `Evento de ${newEvent.title} foi publicado por ${user.name}`,
        link: `${host}events/${newEvent.event_id}`,
        authorId: user.user_id,
        eventId: newEvent.event_id,
      });
    }

    return { message: 'Evento criado com sucesso!' };
  });
};

export const getEvents = async (userToken, page = 1) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.getEvents, async (user) => {
    const limit = 10;
    const currentPageNumber = getPageNumber(page);
    const skip = (currentPageNumber - 1) * limit;

    // Lista apenas Active. Não filtrar por `date_start >= now` aqui: isso
    // escondia eventos recém-criados quando o horário já tinha passado ou
    // por diferença de interpretação de data/hora. Quem quiser só “próximos”
    // pode filtrar no cliente (ou adicionar query param depois).
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip: skip,
        take: limit,
        where: {
          status: 'Active',
        },
        orderBy: {
          date_start: 'asc',
        },
        select: {
          event_id: true,
          title: true,
          local: true,
          date_start: true,
        },
      }),

      prisma.event.count({
        where: {
          status: 'Active',
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: events.map((event) => formattedEvent(event)),
      pagination: {
        page: currentPageNumber,
        limit,
        totalItems: total,
        totalPages,
        hasNextPage: currentPageNumber < totalPages,
        hasPreviousPage: currentPageNumber > 1,
      },
    };
  });
};

export const getEventById = async (userToken, eventId) => {
  const user_id = userToken.id;
  const event_id = eventId;

  return authenticateUser(user_id, actions.getEventById, async (user) => {
    const event = await prisma.event.findUnique({
      where: {
        event_id: event_id,
      },
      select: {
        event_id: true,
        author_id: true,
        author: {
          select: {
            name: true,
            user_type: true,
          },
        },
        title: true,
        description: true,
        local: true,
        date_start: true,
        date_end: true,
        status: true,
        images: true,
      },
    });

    if (!event) {
      throw new CustomError('Evento não encontrado!', 404);
    }

    if (event.status === 'Deleted') {
      throw new CustomError('Evento excluído!', 404);
    }
    if (event.status === 'Closed') {
      throw new CustomError('Evento finalizado!', 404);
    }

    return formattedEvent(event);
  });
};

export const updateEvent = async (userToken, eventId, eventData) => {
  const user_id = userToken.id;
  const event_id = eventId;

  const { title, description, local, startDate, endDate } = validateEventData(eventData);

  return authenticateUser(user_id, actions.updateEvent, async (user) => {
    if (user.user_type === 'Student' || user.user_type === 'Alumni') {
      throw new CustomError('Apenas usuários autorizados podem editar eventos', 403);
    }

    const formattedTitle = capitalizeWords(title);
    const formattedLocal = capitalizeWords(local);

    await prisma.event.update({
      where: {
        event_id: event_id,
      },
      data: {
        title: formattedTitle,
        description,
        local: formattedLocal,
        date_start: startDate,
        date_end: endDate,
        updated_at: new Date(),
      },
    });

    return { message: 'Evento editado com sucesso!' };
  });
};

export const deleteEvent = async (userToken, eventId) => {
  const user_id = userToken.id;
  const event_id = eventId;

  return authenticateUser(user_id, actions.deleteEvent, async (user) => {
    if (user.user_type === 'Student' || user.user_type === 'Alumni') {
      throw new CustomError('Apenas usuários autorizados podem excluir eventos', 403);
    }

    const targetEvent = await prisma.event.findUnique({
      where: {
        event_id: event_id,
      },
    });

    if (!targetEvent) {
      throw new CustomError('Evento não encontrado!', 404);
    }

    if (targetEvent.status !== 'Active') {
      throw new CustomError('Evento já encerrado ou excluído', 409);
    }

    await prisma.event.update({
      where: {
        event_id: event_id,
      },
      data: {
        status: 'Deleted',
        deleted_date: new Date(),
      },
    });

    return { message: 'Evento excluído com sucesso!' };
  });
};

export const closeEvent = async (userToken, eventId, host) => {
  const user_id = userToken.id;
  const event_id = eventId;

  return authenticateUser(user_id, actions.closeEvent, async (user) => {
    if (user.user_type === 'Student' || user.user_type === 'Alumni') {
      throw new CustomError('Apenas usuários autorizados podem encerrar eventos', 403);
    }

    const targetEvent = await prisma.event.findUnique({
      where: {
        event_id: event_id,
      },
    });

    if (!targetEvent) {
      throw new CustomError('Evento não encontrado!', 404);
    }

    if (targetEvent.status !== 'Active') {
      throw new CustomError('Evento já encerrado ou excluído', 409);
    }

    const closedEvent = await prisma.event.update({
      where: {
        event_id: event_id,
      },
      data: {
        status: 'Closed',
        updated_at: new Date(),
      },
    });

    if (closedEvent) {
      await enqueueNotificationForAudience({
        type: notificationTypes.EVENT_CLOSED,
        title: 'Evento encerrado',
        message: `Evento de ${closedEvent.title} foi encerrado por ${user.name}`,
        link: `${host}events/${closedEvent.event_id}`,
        authorId: user.user_id,
        eventId: closedEvent.event_id,
      });
    }

    return { message: 'Evento encerrado com sucesso!' };
  });
};
