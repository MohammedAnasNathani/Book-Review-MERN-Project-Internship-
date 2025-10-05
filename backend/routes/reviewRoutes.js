// backend/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { updateReview, deleteReview } = require('../controllers/reviewController');

// Routes for specific reviews (edit/delete)
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;