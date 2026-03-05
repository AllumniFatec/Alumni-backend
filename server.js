import express from 'express';
import authRoutes from './src/routes/authRoutes.js';
import passwordRoutes from './src/routes/passwordRoutes.js';
import couseRoutes from './src/routes/courseRoutes.js';
import feedRoutes from './src/routes/feedRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());

var corsOptions;

if (process.env.NODE_ENV === 'development') {
  corsOptions = {
    origin: '*',
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

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}!`);
});
