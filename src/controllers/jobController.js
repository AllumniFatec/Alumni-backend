import * as jobService from '../services/jobService.js';
import CustomError from '../utils/CustomError.js';
import { logUserAction } from '../modules/auditLog/auditLog.helper.js';
import { JOB_CREATED, JOB_UPDATED, JOB_DELETED } from '../common/enums/auditActions.js';

export const createJob = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const job = await jobService.createJob(data, user);

    await logUserAction(req, {
      action: JOB_CREATED,
      entity: 'JOB',
      description: 'Vaga criada',
      metadata: {
        title: data?.title,
        workplace_name: data?.workplace_name,
      },
    });

    return res.status(201).json({ message: 'Vaga criada com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const user = req.user;

    const jobs = await jobService.getJobs(user, page);

    return res.status(200).json(jobs);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const user = req.user;

    const job = await jobService.getJobById(user, jobId);

    return res.status(200).json(job);
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const data = req.body;
    const user = req.user;

    const updatedJob = await jobService.updateJob(jobId, data, user);

    await logUserAction(req, {
      action: JOB_UPDATED,
      entity: 'JOB',
      entityId: jobId,
      description: 'Vaga atualizada',
      metadata: { updated_fields: Object.keys(data || {}) },
    });

    return res.status(200).json({ message: 'Vaga atualizada com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const user = req.user;

    const deletedJob = await jobService.deleteJob(jobId, user);

    await logUserAction(req, {
      action: JOB_DELETED,
      entity: 'JOB',
      entityId: jobId,
      description: 'Vaga excluída',
      metadata: undefined,
    });

    return res.status(200).json({ message: 'Vaga excluída com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
