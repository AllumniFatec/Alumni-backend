import * as userService from "../services/userService.js";

export const cadastrar = async (req, res) => {
  try {
    const user = await userService.cadastrarUsuario(req.body);
    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const logar = async (req, res) => {
  try {
    const token = await userService.loginUsuario(req.body);
    res.status(200).json(token);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listar = async (req, res) => {
  try {
    const users = await userService.listarUsuarios();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
