const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, verificationToken) {
  let frontendUrl = process.env.FRONTEND_URL;

  if (frontendUrl.endsWith("/")) {
    frontendUrl = frontendUrl.slice(0, -1);
  }

  const verificationUrl = `${frontendUrl}/verify/${verificationToken}`;

  try {
    await transporter.sendMail({
      from: '"StreamHub" <no-reply@streamhub.com>',
      to: email,
      subject: "🔒 Ativação de Conta - StreamHub",
      text: `Olá! 👋\n\nPara concluir seu cadastro, clique no link de ativação abaixo:\n\n${verificationUrl}\n\nO link expira em 1 hora.`,
      html: `
        <h2 style="color: #3b82f6;">Olá, Bem-vindo ao StreamHub! 👋</h2>
        <p style="font-size: 18px;">Para concluir seu cadastro, clique no link de ativação abaixo:</p>
        <a href="${verificationUrl}" style="font-size: 18px; color: #22c55e; text-decoration: none; font-weight: bold;">Ativar Conta</a>
        <p style="font-size: 16px; color: #666;">Este link expira em 1 hora. Se você não solicitou a ativação, por favor, ignore este e-mail.</p>
      `,
    });
    console.log("E-mail enviado para:", email);
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw new Error("Erro ao enviar e-mail");
  }
}

async function sendResetPasswordEmail(email, resetPasswordUrl) {
  try {
    // Gerar código de redefinição de 6 dígitos
    const resetCode = Math.floor(100000 + Math.random() * 900000);

    await transporter.sendMail({
      from: '"StreamHub" <no-reply@streamhub.com>',
      to: email,
      subject: "🔒 Redefinição de Senha - StreamHub",
      text: `Olá, tudo bem? 👋\n\nVocê solicitou a redefinição de sua senha. Clique no link abaixo para redefinir sua senha:\n\n${resetPasswordUrl}\n\nSe você não solicitou essa redefinição, ignore este e-mail.`,
      html: `
        <h2 style="color: #3b82f6;">Olá, tudo bem? 👋</h2>
        <p style="font-size: 18px;">Você solicitou a redefinição de sua senha. Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetPasswordUrl}" style="font-size: 18px; color: #22c55e; text-decoration: none; font-weight: bold;">Redefinir Senha</a>
        <p style="font-size: 16px; color: #666;">Se você não solicitou essa redefinição, ignore este e-mail.</p>
        <hr style="border-top: 2px solid #e5e7eb;" />
        <p style="font-size: 14px; color: #888;">Se você não solicitou essa redefinição de senha, por favor, ignore este e-mail.</p>
      `,
    });

    console.log("E-mail de redefinição de senha enviado para:", email);
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw new Error("Erro ao enviar e-mail");
  }
}

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
};
