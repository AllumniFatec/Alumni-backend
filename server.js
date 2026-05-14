import 'dotenv/config';
import express from 'express';
import authRoutes from './src/routes/authRoutes.js';
import passwordRoutes from './src/routes/passwordRoutes.js';
import couseRoutes from './src/routes/courseRoutes.js';
import workplaceRoutes from './src/routes/workplaceRoutes.js';
import feedRoutes from './src/routes/feedRoutes.js';
import postRoutes from './src/routes/postRoutes.js';
import imageRoutes from './src/routes/imageRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import eventRoutes from './src/routes/eventRouter.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import skillRoutes from './src/routes/skillRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './src/config/env.js';
import http from 'http';
import { initSocket } from './src/config/socket.js';
import './src/workers/emailWorker.js';
import './src/workers/notificationDispatcher.worker.js';
import './src/workers/notificationDelivery.worker.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/config/swagger.js';
import helmet from 'helmet';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

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
    origin: ['https://alumnifatecso.com.br', 'https://www.alumnifatecso.com.br'], // origin of your frontend (no trailing slash)
    credentials: true, // permite cookies / auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'], // ajuste conforme necessário
  };
}

const server = http.createServer(app);
initSocket(server, corsOptions);

app.use(cors(corsOptions));

app.use('/', authRoutes);
app.use('/', passwordRoutes);
app.use('/', couseRoutes);
app.use('/', workplaceRoutes);
app.use('/', feedRoutes);
app.use('/', postRoutes);
app.use('/', jobRoutes);
app.use('/', imageRoutes);
app.use('/', userRoutes);
app.use('/', adminRoutes);
app.use('/', eventRoutes);
app.use('/', notificationRoutes);
app.use('/', chatRoutes);
app.use('/', skillRoutes);
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: false,
      docExpansion: 'list',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
  })
);

server.listen(env.port, () => {
  console.log(`Servidor rodando na porta ${env.port}!`);
});
