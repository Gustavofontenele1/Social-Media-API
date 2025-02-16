const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendVerificationEmail = require("../models/emailService");
const crypto = require("crypto");

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "E-mail já cadastrado!" });
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const user = new User({
      username,
      email,
      password,
      verificationCode,
      verified: false,
    });
    await user.save();
    const emailSent = await sendVerificationEmail(email, verificationCode);
    if (!emailSent)
      return res.status(500).json({ message: "Erro ao enviar e-mail" });

    res.status(200).json({ message: "Código enviado para o e-mail!" });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ message: "Erro ao cadastrar usuário" });
  }
});

router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "Usuário não encontrado" });
    if (user.verified)
      return res.status(400).json({ message: "Usuário já verificado" });

    if (user.verificationCode === code) {
      user.verified = true;
      await user.save();
      res.status(200).json({ message: "Conta verificada com sucesso!" });
    } else {
      res.status(400).json({ message: "Código inválido" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erro ao verificar código" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
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
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
