import * as jobService from '../services/jobService.js';
import CustomError from '../utils/CustomError.js';

export const createJob = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;

    const job = await jobService.createJob(data, user);

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

    return res.status(200).json({ message: 'Vaga excluída com sucesso!' });
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};
