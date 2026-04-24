import * as eventService from '../services/eventService.js';
import CustomError from '../utils/CustomError.js';

export const createEvent = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const createdEvent = await eventService.createEvent(user, data);

    return res.status(201).json(createdEvent);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('eventController(createEvent) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
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
    console.error('eventController(getEvents) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
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
    console.error('eventController(getEventById) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;
    const data = req.body;

    const updatedEvent = await eventService.updateEvent(user, eventId, data);

    return res.status(200).json(updatedEvent);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('eventController(updateEvent) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;

    const deletedEvent = await eventService.deleteEvent(user, eventId);

    return res.status(200).json(deletedEvent);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('eventController(deleteEvent) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const closeEvent = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;

    const closedEvent = await eventService.closeEvent(user, eventId);

    return res.status(200).json(closedEvent);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('eventController(closeEvent) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const getEventsByUser = async (req, res) => {
  try {
    const user = req.user;
    const userId = req.params.id;
    const page = req.query.page || 1;

    const events = await eventService.getEventsByUser(user, userId, page);

    return res.status(200).json(events);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('eventController(getEventsByUser) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};
