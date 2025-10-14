import CustomError from './CustomError.js';

export function validatePassword(password) {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (password == null || password == '') {
    throw new CustomError('Senha inválida', 401);
  }

  if (!regex.test(password)) {
    throw new CustomError('Senha não atende os requisitos mínimos', 401);
  }
  return true;
}

export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(email) || email == null || email == '') {
    throw new CustomError('Email inválido', 401);
  }
  return true;
}
