const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});




async function sendVerificationEmail(email, verificationToken) {
  try {
    let frontendUrl = process.env.FRONTEND_URL || "";

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL não está definida nas variáveis de ambiente.");
    }

    if (frontendUrl.endsWith("/")) {
      frontendUrl = frontendUrl.slice(0, -1);
    }

    const tokenOnly = verificationToken.replace(frontendUrl, "").replace("/verify/", "");

    const verificationUrl = `${frontendUrl}/verify/${tokenOnly}`;

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

async function sendResetPasswordEmail(email, resetCode) {
  try {
    await transporter.sendMail({
      from: '"StreamHub" <no-reply@streamhub.com>',
      to: email,
      subject: "🔒 Código de Redefinição de Senha - StreamHub",
      text: `Olá, tudo bem? 👋\n\nVocê solicitou a redefinição de sua senha.\n\nSeu código de verificação é: ${resetCode}\n\nSe você não solicitou essa redefinição, ignore este e-mail.`,
      html: `
        <h2 style="color: #3b82f6;">Olá, tudo bem? 👋</h2>
        <p style="font-size: 18px;">Você solicitou a redefinição de sua senha.</p>
        <p style="font-size: 18px; font-weight: bold; color: #22c55e;">Seu código de verificação: ${resetCode}</p>
        <p style="font-size: 16px; color: #666;">Se você não solicitou essa redefinição, ignore este e-mail.</p>
        <hr style="border-top: 2px solid #e5e7eb;" />
        <p style="font-size: 14px; color: #888;">Este código é válido por um tempo limitado.</p>
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
