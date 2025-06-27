// controllers/postController.js
const Post = require('../models/postModel');

exports.list = (req, res) => {
  const { page = 1 } = req.query;
  res.json(Post.findAll(+page));
};

exports.detail = (req, res) => {
  const post = Post.findBySlug(req.params.slug);
  if (!post) return res.status(404).json({ message: 'Not found' });
  res.json(post);
};

exports.create = (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Title & content required' });
  res.status(201).json(Post.create({ title, content }));
};
