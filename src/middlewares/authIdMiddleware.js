import { ObjectId } from 'mongodb';
import CustomError from '../utils/CustomError.js';

const authId = (req, res, next) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }

  next();
};

export default authId;
