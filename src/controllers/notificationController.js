import * as notificationService from '../services/notificationService.js';
import CustomError from '../utils/CustomError.js';

export const getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.page || 1;

    const notifications = await notificationService.getNotifications(user, page);

    return res.status(200).json(notifications);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('notificationController(getNotifications) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const readNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const user = req.user;

    await notificationService.readNotification(user, notificationId);

    return res.status(200).json({ message: 'Notificação lida com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('notificationController(readNotification) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};
