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
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios." });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: "Este e-mail já está registrado." });
    }

    if (existingUser && !existingUser.isVerified) {
      const currentTime = Date.now();
      if (currentTime > existingUser.verificationTokenExpiry) {
        await User.deleteOne({ email });
      } else {
        return res.status(400).json({
          error: "E-mail já cadastrado. Verifique sua caixa de entrada.",
        });
      }
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = Date.now() + 3600000;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpiry,
      isEmailSent: false,
    });

    await newUser.save();

    let frontendUrl = process.env.FRONTEND_URL;

    const verificationUrl = `${frontendUrl}/verify/${verificationToken}`;

    await sendVerificationEmail(email, verificationUrl);

    newUser.isEmailSent = true;
    await newUser.save();

    console.log("Usuário registrado, aguardando verificação do e-mail.");
    res.status(200).json({
      message: "Cadastro realizado com sucesso! Verifique seu e-mail.",
    });

    setTimeout(async () => {
      const user = await User.findOne({ email });
      if (user && !user.isVerified) {
        await User.deleteOne({ email });
        console.log(`Usuário ${email} removido por falta de verificação.`);
      }
    }, 3600000);
  } catch (error) {
    console.error("Erro ao registrar o usuário:", error);
    res.status(500).json({ error: "Erro ao cadastrar usuário." });
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

  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.verificationToken = verificationToken;
  user.verificationTokenExpiry = Date.now() + 3600000;

  await user.save();

  const baseUrl = process.env.FRONTEND_URL.endsWith("/")
    ? process.env.FRONTEND_URL
    : `${process.env.FRONTEND_URL}/`;

  const verificationUrl = `${baseUrl}verify/${user.verificationToken}`;

  await sendVerificationEmail(user.email, verificationUrl);

  res.status(200).json({ message: "Novo link de verificação enviado!" });
});

router.post("/verify", async (req, res) => {
  const { token } = req.body;
  console.log("Token recebido para verificação:", token);

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      console.log("Token inválido ou expirado, usuário não encontrado.");
      return res.status(400).json({ message: "Token inválido ou expirado." });
    }
    console.log("Usuário encontrado:", user);

    const currentTime = Date.now();
    if (currentTime > user.verificationTokenExpiry) {
      console.log("Token expirado.");
      return res.status(400).json({ message: "O link de ativação expirou." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();
    console.log("Conta ativada com sucesso!");

    res.status(200).json({ message: "Conta ativada com sucesso!" });
  } catch (err) {
    console.error("Erro ao verificar o token:", err);
    res
      .status(500)
      .json({ message: "Erro ao ativar a conta. Tente novamente." });
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
      return res
        .status(400)
        .json({ error: "Token expirado. Solicite um novo link." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    res.status(200).json({
      message: "Conta verificada com sucesso! Agora você pode fazer login.",
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao verificar a conta." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Conta não verificada. Verifique seu e-mail." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro interno. Tente novamente." });
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
    const resetTokenExpiration = Date.now() + 3600000;

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
