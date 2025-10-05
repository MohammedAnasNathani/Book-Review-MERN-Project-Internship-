// backend/controllers/profileController.js
const Book = require('../models/Book');
const Review = require('../models/Review');
const User = require('../models/User');

const formatBookData = async (book) => { 
    const bookObject = book.toObject();
    const reviews = await Review.find({ bookId: bookObject._id });
    const review_count = reviews.length;
    const average_rating = review_count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / review_count : 0;
    const addedByUser = await User.findById(bookObject.addedBy);
    return {
        id: bookObject._id.toString(),
        title: bookObject.title, author: bookObject.author, description: bookObject.description, genre: bookObject.genre, year: bookObject.publishedYear,
        added_by: bookObject.addedBy.toString(), added_by_name: addedByUser ? addedByUser.name : 'Unknown', created_at: bookObject.createdAt,
        average_rating, review_count,
    };
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const userBooks = await Book.find({ addedBy: req.user.id }).sort({ createdAt: -1 });
        const formattedBooks = await Promise.all(userBooks.map(book => formatBookData(book)));

        const userReviews = await Review.find({ userId: req.user.id }).populate('bookId', 'title author').sort({ createdAt: -1 });
        const formattedReviews = userReviews.map(review => ({
            id: review._id, book_id: review.bookId._id, book_title: review.bookId.title, book_author: review.bookId.author,
            rating: review.rating, review_text: review.reviewText, created_at: review.createdAt,
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