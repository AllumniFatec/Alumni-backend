import * as authService from "../services/authService.js";
import CustomError from "../utils/CustomError.js";

export const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    return res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err });
  }
};

export const login = async (req, res) => {
  try {
    const token = await authService.loginUser(req.body);
    res.status(200).json(token);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err });
  }
};

export const list = async (req, res) => {
  try {
    const users = await authService.listUsers();
    return res.status(200).json(users);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err });
  }
};
