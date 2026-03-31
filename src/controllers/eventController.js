import * as eventService from '../services/eventService.js';
import CustomError from '../utils/CustomError.js';
import { logUserAction } from '../modules/auditLog/auditLog.helper.js';
import {
  EVENT_CREATED,
  EVENT_UPDATED,
  EVENT_DELETED,
  EVENT_CLOSED,
} from '../common/enums/auditActions.js';

export const createEvent = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const createdEvent = await eventService.createEvent(user, data);

    await logUserAction(req, {
      action: EVENT_CREATED,
      entity: 'EVENT',
      entityId: createdEvent?.id ?? createdEvent?.event_id,
      description: 'Evento criado',
      metadata: { title: data?.title },
    });

    return res.status(201).json(createdEvent);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.page || 1;

    const events = await eventService.getEvents(user, page);

    return res.status(200).json(events);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;

    const event = await eventService.getEventById(user, eventId);

    return res.status(200).json(event);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;
    const data = req.body;

    const updatedEvent = await eventService.updateEvent(user, eventId, data);

    await logUserAction(req, {
      action: EVENT_UPDATED,
      entity: 'EVENT',
      entityId: eventId,
      description: 'Evento atualizado',
      metadata: { updated_fields: Object.keys(data || {}) },
    });

    return res.status(200).json(updatedEvent);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;

    const deletedEvent = await eventService.deleteEvent(user, eventId);

    await logUserAction(req, {
      action: EVENT_DELETED,
      entity: 'EVENT',
      entityId: eventId,
      description: 'Evento excluído',
      metadata: undefined,
    });

    return res.status(200).json(deletedEvent);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const closeEvent = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;

    const closedEvent = await eventService.closeEvent(user, eventId);

    await logUserAction(req, {
      action: EVENT_CLOSED,
      entity: 'EVENT',
      entityId: eventId,
      description: 'Evento encerrado',
      metadata: undefined,
    });

    return res.status(200).json(closedEvent);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
