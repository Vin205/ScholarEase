const express = require('express');
const { signup, login } = require('../controllers/facultyController');

const router = express.Router();

// Faculty Signup route
router.post('/signup', signup);

// Faculty Login route
router.post('/login', login);

module.exports = router;
