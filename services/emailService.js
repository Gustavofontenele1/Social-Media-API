const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Pode ser alterado para outro serviço de e-mail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Função genérica para envio de e-mails (verificação e redefinição de senha)
async function sendEmail({ to, subject, text, html }) {
  try {
    await transporter.sendMail({
      from: '"Sua Empresa" <no-reply@empresa.com>', // Remetente
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    console.log(`E-mail enviado para: ${to}`);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw new Error('Erro ao enviar e-mail');
  }
}

// Função para enviar o código de verificação de conta
async function sendVerificationEmail(email, code) {
  const subject = '🔒 Código de Verificação - Sua Empresa';
  const text = `Olá! 👋\n\nSeu código de verificação é: ${code}\n\nUse-o para completar o seu cadastro. 🚀`;
  const html = `
    <h2 style="color: #3b82f6;">Olá, Bem-vindo à Sua Empresa! 👋</h2>
    <p style="font-size: 18px;">Seu código de verificação é:</p>
    <h3 style="font-size: 24px; color: #22c55e;"><strong>${code}</strong></h3>
    <p style="font-size: 16px; color: #666;">Use este código para confirmar sua conta e começar sua jornada com a gente! 🚀</p>
    <hr style="border-top: 2px solid #e5e7eb;" />
    <p style="font-size: 14px; color: #888;">Se você não solicitou este código, por favor, ignore este e-mail.</p>
  `;
  return sendEmail({ to: email, subject, text, html });
}

// Função para enviar o e-mail de redefinição de senha
async function sendResetPasswordEmail(email, resetPasswordUrl) {
  const subject = '🔒 Redefinição de Senha';
  const text = `Olá! 👋\n\nVocê solicitou a redefinição de senha. Clique no link abaixo para redefinir sua senha:\n\n${resetPasswordUrl}\n\nSe você não solicitou essa redefinição, ignore este e-mail.`;
  const html = `
    <h2 style="color: #3b82f6;">Olá, tudo bem? 👋</h2>
    <p style="font-size: 18px;">Você solicitou a redefinição de sua senha. Clique no link abaixo para redefinir sua senha:</p>
    <p style="font-size: 20px; color: #22c55e;"><a href="${resetPasswordUrl}" style="color: #22c55e; text-decoration: none;">Redefinir Senha</a></p>
    <p style="font-size: 16px; color: #666;">Se você não solicitou essa redefinição, ignore este e-mail.</p>
    <hr style="border-top: 2px solid #e5e7eb;" />
    <p style="font-size: 14px; color: #888;">Se você tiver dúvidas, entre em contato com nosso suporte.</p>
  `;
  return sendEmail({ to: email, subject, text, html });
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
