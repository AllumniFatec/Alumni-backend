import 'dotenv/config';
import express from 'express';
import authRoutes from './src/routes/authRoutes.js';
import passwordRoutes from './src/routes/passwordRoutes.js';
import couseRoutes from './src/routes/courseRoutes.js';
import feedRoutes from './src/routes/feedRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import imageRoutes from './src/routes/imageRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './src/config/env.js';
import './src/queues/emailWorker.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

var corsOptions;

if (env.isDevelopment) {
  corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
} else {
  corsOptions = {
    origin: 'http://localhost:5500', // origin of your frontend (no trailing slash)
    credentials: true, // permite cookies / auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'], // ajuste conforme necessário
  };
}

app.use(cors(corsOptions));

app.use('/', authRoutes);
app.use('/', passwordRoutes);
app.use('/', couseRoutes);
app.use('/', feedRoutes);
app.use('/', postRoutes);
app.use('/', jobRoutes);
app.use('/', imageRoutes);
app.use('/', userRoutes);
app.use('/', adminRoutes);

app.listen(env.port, () => {
  console.log(`Servidor rodando na porta ${env.port}!`);
});
