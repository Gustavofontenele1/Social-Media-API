// routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Criar um post
router.post('/', async (req, res) => {
  const { userId, content } = req.body;
  try {
    const newPost = new Post({ userId, content });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter todos os posts do usuário
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await Post.find({ userId });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
