// models/postModel.js
const db = require('./db');
const slugify = require('slugify');

exports.create = ({ title, content }) => {
  const slug = slugify(title, { lower: true });
  const stmt = db.prepare('INSERT INTO posts (title, slug, content) VALUES (?, ?, ?)');
  const info = stmt.run(title, slug, content);
  return { id: info.lastInsertRowid, title, slug, content };
};

exports.findAll = (page = 1, limit = 10) => {
  return db.prepare('SELECT * FROM posts ORDER BY id DESC LIMIT ? OFFSET ?')
           .all(limit, (page - 1) * limit);
};

exports.findBySlug = (slug) => {
  return db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
};
