// backend/controllers/profileController.js
const Book = require('../models/Book');
const Review = require('../models/Review');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const userBooks = await Book.find({ addedBy: userId }).sort({ createdAt: -1 });
        const formattedBooks = await Promise.all(userBooks.map(async (book) => {
            const reviews = await Review.find({ bookId: book._id });
            const review_count = reviews.length;
            const average_rating = review_count > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / review_count : 0;
            
            return {
                id: book._id,
                title: book.title,
                author: book.author,
                description: book.description,
                genre: book.genre,
                year: book.publishedYear,
                added_by: book.addedBy,
                added_by_name: user.name,
                created_at: book.createdAt,
                average_rating: average_rating, // FIX: Use snake_case
                review_count: review_count,       // FIX: Use snake_case
            };
        }));

        const userReviews = await Review.find({ userId: userId }).populate('bookId', 'title author').sort({ createdAt: -1 });
        const formattedReviews = userReviews.map(review => ({
            id: review._id,
            book_id: review.bookId._id,
            book_title: review.bookId.title,
            book_author: review.bookId.author,
            rating: review.rating,
            review_text: review.reviewText,
            created_at: review.createdAt,
        }));

        res.json({
            user: { id: user._id, name: user.name, email: user.email },
            books: formattedBooks,
            reviews: formattedReviews
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};