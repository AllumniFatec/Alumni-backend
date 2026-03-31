import * as passwordService from '../services/passwordService.js';
import CustomError from '../utils/CustomError.js';
import { logAction } from '../modules/auditLog/auditLog.service.js';
import { PASSWORD_RESET_REQUEST, PASSWORD_RESET_SUCCESS } from '../common/enums/auditActions.js';

export const forgotPassword = async (req, res) => {
  try {
    await passwordService.sendRecovery(req.body, req);

    // Audit: solicitação de reset (não logar token)
    await logAction({
      userId: null,
      action: PASSWORD_RESET_REQUEST,
      entity: 'PASSWORD',
      entityId: undefined,
      description: 'Solicitação de recuperação de senha',
      metadata: { email: req.body?.email },
      req,
    });

    return res.status(200).json({ message: 'Email de recuperação enviado com sucesso.' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    await passwordService.resetPassword(req);

    // Audit: reset concluído (não logar token)
    await logAction({
      userId: null,
      action: PASSWORD_RESET_SUCCESS,
      entity: 'PASSWORD',
      entityId: undefined,
      description: 'Senha alterada com sucesso',
      metadata: undefined,
      req,
    });

    return res.status(200).json({ message: 'Senha alterada com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
