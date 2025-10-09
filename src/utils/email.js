import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const enviarEmail = async user => {
  //criando o transporter, serviço de envio de emails
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailOptions = {
    from: `Alumni Fatec Sorocaba <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: user.subject,
    html: user.message,
  };

  transport.sendMail(emailOptions);
};

export default enviarEmail;
