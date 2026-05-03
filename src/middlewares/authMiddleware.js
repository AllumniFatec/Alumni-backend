import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { redisClient } from '../config/redisClient.js';

const auth = async (req, res, next) => {
  const token = req.cookies?.access_token ?? req.cookies?.reactivate_token;

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado!' });
  }

  const isRevoked = await redisClient.get(`revoked-token:${token}`);

  if (isRevoked) {
    return res.status(401).json({ message: 'Sessão expirada!' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export default auth;
