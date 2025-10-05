// backend/controllers/profileController.js
const Book = require('../models/Book');
const Review = require('../models/Review');

// @desc    Get user profile data (books and reviews)
// @route   GET /api/profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get User's Books
        const myBooksRaw = await Book.find({ addedBy: userId }).lean();
        // Calculate stats for them
        const myBooks = [];
        for(let book of myBooksRaw) {
            const reviews = await Review.find({ bookId: book._id });
            book.id = book._id;
            book.reviewCount = reviews.length;
            book.averageRating = reviews.length > 0 ? (reviews.reduce((a,b)=>a+b.rating,0)/reviews.length) : 0;
            book.year = book.publishedYear;
            // Need added_by_name for card
            book.added_by_name = req.user.name; // The logged in user added it
            myBooks.push(book);
        }

        // Get User's Reviews
        const myReviewsRaw = await Review.find({ userId: userId })
            .populate('bookId', 'title author')
            .sort({ createdAt: -1 })
            .lean();
        
        const myReviews = myReviewsRaw.map(r => ({
            id: r._id,
            book_id: r.bookId._id,
            book_title: r.bookId.title,
            book_author: r.bookId.author,
            rating: r.rating,
            review_text: r.reviewText,
            created_at: r.createdAt
        }));

        res.json({
            user: req.user,
            books: myBooks,
            reviews: myReviews
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};