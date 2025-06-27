// routes/posts.js
const express = require('express');
const ctrl = require('../controllers/postController');
const router = express.Router();

router.get('/', ctrl.list);
router.get('/:slug', ctrl.detail);
router.post('/', ctrl.create);

module.exports = router;
