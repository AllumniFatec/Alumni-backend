import express from 'express';
import authRoutes from './src/routes/authRoutes.js';
import passwordRoutes from './src/routes/passwordRoutes.js';
import couseRoutes from './src/routes/courseRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV == 'development') {
  app.use(cors({ origin: '*' }));
} else {
  app.use(cors({ origin: '*' })); //colocar a URL do frontend correto
}

app.use('/', authRoutes);
app.use('/', passwordRoutes);
app.use('/', couseRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}!`);
});
