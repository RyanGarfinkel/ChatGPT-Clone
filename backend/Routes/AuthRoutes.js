const express = require('express');
const router = express.Router();

const { signup, login, token } = require('../Controllers/AuthController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/token', token);

module.exports = router;