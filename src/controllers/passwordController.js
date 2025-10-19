import * as passwordService from "../services/passwordService.js";
import CustomError from "../utils/CustomError.js";

export const forgotPassword = async (req, res) => {
  try {
    console.log(req);
    const resetToken = await passwordService.sendRecovery(req.body, req);
    res.status(200).send("Email de recuperação enviado com sucesso.");
  } catch (err) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({ error: err.message });
    }
  }
};

export const resetPassword = async (req, res) => {
  try {
    const user = await passwordService.resetPassword(req);
    res.status(200).send("Senha alterada com sucesso!");
  } catch (err) {
    if (err instanceof CustomError) {
      res.status(err.statusCode).json({ error: err.message });
    }
  }
};
