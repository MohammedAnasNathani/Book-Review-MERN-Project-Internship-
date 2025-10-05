// backend/routes/bookRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getBooks, getBookById, addBook, updateBook, deleteBook, getGenres } = require('../controllers/bookController');
const { getReviewsForBook, addReview, getRatingDistribution } = require('../controllers/reviewController');

// Global routes
router.get('/', getBooks);
router.get('/genres', getGenres); // New for filter
router.get('/:id', getBookById);

// Protected Book Routes
router.post('/', auth, addBook);
router.put('/:id', auth, updateBook);
router.delete('/:id', auth, deleteBook);

// Review routes nested under books (matching new frontend)
router.get('/:bookId/reviews', getReviewsForBook);
router.get('/:bookId/rating-distribution', getRatingDistribution); // For charts
router.post('/:bookId/reviews', auth, addReview);

module.exports = router;