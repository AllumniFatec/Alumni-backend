import * as userService from "../services/userService.js";
import CustomError from "../utils/CustomError.js";

export const register = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({ error: err.message });
    }
    console.log(err);
    return res.status(500).json({ error: err });
  }
};

export const login = async (req, res) => {
  try {
    const token = await userService.loginUser(req.body);
    res.status(200).json(token);
  } catch (err) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({ error: err.message });
    }
  }
};

export const list = async (req, res) => {
  try {
    const users = await userService.listUsers();
    res.status(200).json(users);
  } catch (err) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({ error: err.message });
    }
  }
};
