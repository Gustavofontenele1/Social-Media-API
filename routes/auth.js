const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendVerificationEmail =
  require("../services/emailService").sendVerificationEmail;
const sendResetPasswordEmail =
  require("../services/emailService").sendResetPasswordEmail;
const crypto = require("crypto");
const saltRounds = 10;

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Já existe uma conta com esse e-mail." });
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return res.status(400).json({ message: "Nome de usuário já está em uso." });
  }

  try {
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      email,
      password: await bcrypt.hash(password, 10),
      username,
      verificationToken,
      verificationTokenExpiry: Date.now() + 3600000,
      isVerified: false,
      isEmailSent: true,
    });

    await newUser.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

    await sendVerificationEmail(email, verificationUrl);

    res.status(200).json({
      message: "Cadastro realizado! Verifique seu e-mail para o link de verificação.",
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao tentar se cadastrar. Tente novamente mais tarde." });
  }
});

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.isVerified) {
    return res
      .status(400)
      .json({ message: "Este e-mail já está verificado ou não existe." });
  }

  if (!user.isEmailSent) {
    return res
      .status(400)
      .json({ message: "O código de verificação ainda não foi enviado." });
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  user.verificationCode = verificationCode;
  await user.save();

  await sendVerificationEmail(user.email, verificationCode);
  res.status(200).json({ message: "Novo código de verificação enviado!" });
});

router.post("/verify", async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email, verificationCode });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Código de verificação inválido ou expirado." });
    }

    const verificationCodeExpiration = 60 * 60 * 1000;
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - new Date(user.createdAt).getTime();

    if (timeDifference > verificationCodeExpiration) {
      return res
        .status(400)
        .json({ error: "O código de verificação expirou. Solicite um novo." });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: "Usuário verificado com sucesso!" });
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    res
      .status(500)
      .json({ error: "Erro ao verificar código. Tente novamente." });
  }
});

router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ error: "Token inválido ou já utilizado." });
    }

    if (Date.now() > user.verificationTokenExpiry) {
      return res.status(400).json({ error: "Token expirado. Solicite um novo link." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    res.status(200).json({ message: "Conta verificada com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao verificar a conta." });
  }
});

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.isVerified) {
    return res.status(400).json({ message: "Este e-mail já está verificado ou não existe." });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = Date.now() + 3600000;

  await user.save();

  const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

  await sendVerificationEmail(user.email, verificationUrl);

  res.status(200).json({ message: "Novo link de verificação enviado!" });
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Email ou senha inválidos" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Email ou senha inválidos" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "O email é obrigatório" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiration = Date.now() + 3600000; // 1 hora

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiration;

    await user.save();

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendResetPasswordEmail(user.email, resetPasswordUrl);

    res
      .status(200)
      .json({ message: "E-mail de redefinição de senha enviado." });
  } catch (err) {
    console.error("Erro ao solicitar redefinição de senha:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token e nova senha são obrigatórios" });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Token inválido ou expirado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Senha redefinida com sucesso!" });
  } catch (err) {
    console.error("Erro ao redefinir a senha:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json({ message: "Usuário excluído com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
