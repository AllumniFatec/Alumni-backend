import * as adminService from '../services/adminService.js';
import CustomError from '../utils/CustomError.js';
import { logUserAction } from '../modules/auditLog/auditLog.helper.js';
import { USER_APPROVED, USER_REJECTED } from '../common/enums/auditActions.js';

export const dashboard = async (req, res) => {
  try {
    const user = req.user;

    const dashboard = await adminService.getDashboard(user);

    return res.status(200).json(dashboard);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const listAllUsersInAnalysis = async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.page;

    const usersInAnalysis = await adminService.listAllUsersInAnalysis(user, page);

    return res.status(200).json(usersInAnalysis);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const approveUser = async (req, res) => {
  try {
    const user = req.user;
    const alumniId = req.params.id;

    await adminService.approveUser(user, alumniId, req.protocol, req.get('host'));

    await logUserAction(req, {
      action: USER_APPROVED,
      entity: 'USER',
      entityId: alumniId,
      description: 'Usuário aprovado pelo administrador',
      metadata: { approved_user_id: alumniId },
    });

    return res.status(200).json({ message: 'Usuário aprovado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const refuseUser = async (req, res) => {
  try {
    const user = req.user;
    const alumniId = req.params.id;

    await adminService.refuseUser(user, alumniId, req.protocol, req.get('host'));

    await logUserAction(req, {
      action: USER_REJECTED,
      entity: 'USER',
      entityId: alumniId,
      description: 'Usuário recusado pelo administrador',
      metadata: { rejected_user_id: alumniId },
    });

    return res.status(200).json({ message: 'Usuário recusado com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
