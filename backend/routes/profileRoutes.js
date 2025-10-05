// backend/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getProfile } = require('../controllers/profileController');

router.get('/', auth, getProfile);

module.exports = router;