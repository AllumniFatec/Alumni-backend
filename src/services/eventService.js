import { PrismaClient } from '../generated/prisma/index.js';
import CustomError from '../utils/CustomError.js';
import { authenticateUser } from './userService.js';
import { capitalizeWords } from '../utils/validations.js';

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
    date_start: event.date_start?.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
    }),
    date_end:
      event.date_end?.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }) ?? null,
    status: event.status ?? null,
    images: event.images ?? null,
  });

const DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function parseDateTimeUTC(date, time) {
  if (!date || typeof date !== 'string' || !DATE_REGEX.test(date)) {
    throw new CustomError('Data de início ou Data de fim inválido, use DD/MM/YYYY', 400);
  }

  if (!time || typeof time !== 'string' || !TIME_REGEX.test(time)) {
    throw new CustomError('Hora de início ou hora de fim inválido, use HH:MM', 400);
  }

  const [, dayStr, monthStr, yearStr] = date.match(DATE_REGEX);
  const [, hourStr, minuteStr] = time.match(TIME_REGEX);

  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  const dateUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  if (
    dateUtc.getUTCFullYear() !== year ||
    dateUtc.getUTCMonth() !== month - 1 ||
    dateUtc.getUTCDate() !== day ||
    dateUtc.getUTCHours() !== hour ||
    dateUtc.getUTCMinutes() !== minute
  ) {
    throw new CustomError('Data ou hora inválida', 400);
  }

  return dateUtc;
}

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

  const startDate = parseDateTimeUTC(eventData.date_start, eventData.time_start);
  const endDate = parseDateTimeUTC(eventData.date_end, eventData.time_end);

  if (endDate.getTime() < startDate.getTime()) {
    throw new CustomError('Data de fim deve ser posterior a Data de início', 400);
  }

  return { title, description, local, startDate, endDate };
}

export const createEvent = async (userToken, eventData) => {
  const user_id = userToken.id;

  const { title, description, local, startDate, endDate } = validateEventData(eventData);

  return authenticateUser(user_id, actions.createEvent, async (user) => {
    if (user.user_type === 'Student' || user.user_type === 'Alumni') {
      throw new CustomError('Apenas usuários autorizados podem criar eventos', 401);
    }

    const formattedTitle = capitalizeWords(title);
    const formattedLocal = capitalizeWords(local);

    await prisma.event.create({
      data: {
        title: formattedTitle,
        description,
        local: formattedLocal,
        date_start: startDate,
        date_end: endDate,
        author_id: user.user_id,
      },
    });

    return { message: 'Evento criado com sucesso!' };
  });
};

export const getEvents = async (userToken, page = 1) => {
  const user_id = userToken.id;

  return authenticateUser(user_id, actions.getEvents, async (user) => {
    const limit = 20;
    const pageNumber = Math.max(1, Number(page) || 1);
    const skip = (pageNumber - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip: skip,
        take: limit,
        where: {
          status: 'Active',
          date_start: {
            gte: new Date(),
          },
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
          date_start: {
            gte: new Date(),
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: events.map((event) => formattedEvent(event)),
      pagination: {
        page: pageNumber,
        limit,
        totalItems: total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
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

    if (event.status !== 'Active') {
      throw new CustomError('Evento finalizado!', 401);
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
      throw new CustomError('Apenas usuários autorizados podem editar eventos', 401);
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
      throw new CustomError('Apenas usuários autorizados podem excluir eventos', 401);
    }

    const targetEvent = await prisma.event.findUnique({
      where: {
        event_id: event_id,
      },
    });

    if (targetEvent.status !== 'Active') {
      throw new CustomError('Evento já encerrado ou excluído', 401);
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

export const closeEvent = async (userToken, eventId) => {
  const user_id = userToken.id;
  const event_id = eventId;

  return authenticateUser(user_id, actions.closeEvent, async (user) => {
    if (user.user_type === 'Student' || user.user_type === 'Alumni') {
      throw new CustomError('Apenas usuários autorizados podem encerrar eventos', 401);
    }

    const targetEvent = await prisma.event.findUnique({
      where: {
        event_id: event_id,
      },
    });

    if (targetEvent.status !== 'Active') {
      throw new CustomError('Evento já encerrado ou excluído', 401);
    }

    await prisma.event.update({
      where: {
        event_id: event_id,
      },
      data: {
        status: 'Closed',
        updated_at: new Date(),
      },
    });

    return { message: 'Evento encerrado com sucesso!' };
  });
};
