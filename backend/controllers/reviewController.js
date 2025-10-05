// backend/controllers/reviewController.js
const Review = require('../models/Review');
const Book = require('../models/Book');

// @desc    Get reviews for a book
// @route   GET /api/books/:bookId/reviews
exports.getReviewsForBook = async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .lean();

    // Format for frontend
    const formatted = reviews.map(review => ({
        id: review._id,
        user_id: review.userId._id,
        user_name: review.userId.name,
        rating: review.rating,
        review_text: review.reviewText,
        created_at: review.createdAt
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get rating distribution for charts
// @route   GET /api/books/:bookId/rating-distribution
exports.getRatingDistribution = async (req, res) => {
    try {
        const reviews = await Review.find({ bookId: req.params.bookId });
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            distribution[r.rating] += 1;
        });
        res.json({ distribution });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add a review
// @route   POST /api/books/:bookId/reviews
exports.addReview = async (req, res) => {
  // Frontend sends rating and review_text
  const { rating, review_text } = req.body; 

  try {
    // Check for existing review
    const existing = await Review.findOne({ bookId: req.params.bookId, userId: req.user.id });
    if(existing) {
        return res.status(400).json({ detail: 'You have already reviewed this book' });
    }

    const newReview = new Review({
      rating,
      reviewText: review_text,
      bookId: req.params.bookId,
      userId: req.user.id,
    });

    await newReview.save();
    // Return success (frontend re-fetches)
    res.json({ message: "Review added" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
    const { rating, review_text } = req.body;
    try {
        let review = await Review.findById(req.params.id);
        if(!review) return res.status(404).json({detail: 'Review not found'});
        
        if(review.userId.toString() !== req.user.id) {
            return res.status(403).json({detail: 'Not authorized'});
        }

        review.rating = rating;
        review.reviewText = review_text;
        await review.save();
        res.json({ message: "Review updated" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);
        if(!review) return res.status(404).json({detail: 'Review not found'});
        
        if(review.userId.toString() !== req.user.id) {
            return res.status(403).json({detail: 'Not authorized'});
        }

        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: "Review deleted" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};