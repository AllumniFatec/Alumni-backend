// ===== CENTRAL ENVIRONMENT CONFIGURATION =====
// Single access point for all backend environment variables.
// Every part of the application must import from here — never read process.env directly.

const REQUIRED_VARS = [
  'JWT_SECRET',
  'DATABASE_URL',
  'CLOUDINARY_NAME',
  'CLOUDINARY_KEY',
  'CLOUDINARY_SECRET',
];

for (const key of REQUIRED_VARS) {
  if (!process.env[key]) {
    throw new Error(`Required environment variable is not defined: ${key}`);
  }
}

export const env = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,
  isDevelopment: process.env.NODE_ENV === 'development',

  // Auth
  jwtSecret: process.env.JWT_SECRET,
  maxAgeCookies: Number(process.env.MAX_AGE_COOKIES) || 3600000, // 1 hour

  // Email
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },

  // Cloudinary
  cloudinary: {
    name: process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_KEY,
    apiSecret: process.env.CLOUDINARY_SECRET,
  },
};

export default env;
