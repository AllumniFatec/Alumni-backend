import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const auth = (req, res, next) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado!' });
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
