import { cadastrarUsuario } from "../services/userService.js";

export const cadastrar = async (req, res) => {
  try {
    const user = await cadastrarUsuario(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
