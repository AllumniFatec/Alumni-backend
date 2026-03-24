import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const sendEmail = async (user) => {
  //criando o transporter, serviço de envio de emails
  const transport = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: false,
    auth: {
      user: env.email.user,
      pass: env.email.password,
    },
  });

  const emailOptions = {
    from: `Alumni Fatec Sorocaba <${env.email.user}>`,
    to: user.email,
    subject: user.subject,
    html: user.message,
  };

  // Retorna/propaga a Promise para permitir que o caller trate erro (ex: worker da fila).
  return transport.sendMail(emailOptions);
};

export default sendEmail;
