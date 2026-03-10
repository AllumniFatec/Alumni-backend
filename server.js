import 'dotenv/config';
import express from 'express';
import authRoutes from './src/routes/authRoutes.js';
import passwordRoutes from './src/routes/passwordRoutes.js';
import couseRoutes from './src/routes/courseRoutes.js';
import feedRoutes from './src/routes/feedRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './src/config/env.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

var corsOptions;

if (env.isDevelopment) {
  corsOptions = {
    origin: 'http://localhost:5500',
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

app.listen(env.port, () => {
  console.log(`Servidor rodando na porta ${env.port}!`);
});
