import * as adminService from '../services/adminService.js';
import CustomError from '../utils/CustomError.js';

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

export const approveUser = async (req, res) => {
  try {
    const user = req.user;
    const alumniData = req.body;

    const approvedUser = await adminService.approveUser(
      user,
      alumniData,
      req.protocol,
      req.get('host')
    );
  } catch (error) {}
};
