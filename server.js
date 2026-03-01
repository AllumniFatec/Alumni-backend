import express from 'express';
import authRoutes from './src/routes/authRoutes.js';
import passwordRoutes from './src/routes/passwordRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: '*' }));

app.use('/', authRoutes);
app.use('/', passwordRoutes);

app.listen(3000, () => {
  console.log('servidor rodando!');
});
