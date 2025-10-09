import express from 'express';
import userRoutes from './src/routes/userRoutes.js';
import passwordRoutes from './src/routes/passwordRoutes.js';

const app = express();

app.use(express.json());

app.use('/', userRoutes);
app.use('/', passwordRoutes);

app.listen(3000, () => {
  console.log('servidor rodando!');
});
