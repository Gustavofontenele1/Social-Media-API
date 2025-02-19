const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendVerificationEmail = require("../services/emailService");
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

  if (!email || !password || !username) {
    return res.status(400).json({ error: "Email, senha e nome de usuário são obrigatórios" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Este email já está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const verificationCode = crypto.randomBytes(3).toString("hex");

    const newUser = new User({
      email,
      password: hashedPassword,
      verificationCode,
      username,
    });

    await newUser.save();
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message:
        "Usuário criado com sucesso. Verifique seu e-mail para o código de verificação.",
    });
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/verify", async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const user = await User.findOne({ email, verificationCode });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Código de verificação inválido ou expirado" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: "Usuário verificado com sucesso!" });
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    res.status(500).json({ error: "Erro ao verificar código" });
  }
});

router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Usuário já verificado" });
    }

    if (user.verificationCode === code) {
      user.isVerified = true;
      user.verificationCode = null;
      await user.save();
      res.status(200).json({ message: "Conta verificada com sucesso!" });
    } else {
      res.status(400).json({ error: "Código inválido" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao verificar código" });
  }
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
