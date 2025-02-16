const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, code) {
  try {
    await transporter.sendMail({
      from: '"StreamHub" <no-reply@streamhub.com>',
      to: email,
      subject: 'Seu Código de Verificação',
      text: `Seu código de verificação é: ${code}`,
      html: `<h2>Seu código de verificação:</h2><p style="font-size:20px;"><strong>${code}</strong></p>`,
    });
    console.log('E-mail enviado para:', email);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new Error('Erro ao enviar e-mail');
  }
}

module.exports = sendVerificationEmail;
