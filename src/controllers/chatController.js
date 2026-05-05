import * as chatService from '../services/chatService.js';
import CustomError from '../utils/CustomError.js';

export const startChat = async (req, res) => {
  try {
    const user = req.user;
    const targetUserId = req.params.id;

    const chat = await chatService.startChat(user, targetUserId);

    return res.status(201).json(chat);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('chatController(startChat) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const getChats = async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.page || 1;

    const chats = await chatService.getChats(user, page);

    return res.status(200).json(chats);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('chatController(getChats) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const user = req.user;
    const chatId = req.params.id;
    const cursor = req.query.cursor || null;
    const limit = req.query.limit;

    const messages = await chatService.getChatMessages(user, chatId, cursor, limit);

    return res.status(200).json(messages);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('chatController(getChatMessages) erro inesperado: ', err);
    return res
      .status(500)
      .json({ error: 'Erro inesperado. Por favor, tente novamente mais tarde.' });
  }
};
