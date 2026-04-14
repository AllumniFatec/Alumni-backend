import { env } from './env.js';
import { swaggerDoc } from './swaggerDoc.js';

export const swaggerSpec = {
  ...swaggerDoc,
  servers: [
    {
      url: `http://localhost:${env.port}`,
    },
  ],
};
