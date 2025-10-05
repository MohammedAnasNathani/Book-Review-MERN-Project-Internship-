// backend/controllers/bookController.js
const Book = require('../models/Book');
const Review = require('../models/Review');
const User = require('../models/User');

// Helper to format book data consistently for the frontend
const formatBookData = async (book) => {
    const bookObject = book.toObject();
    
    // Calculate stats
    const reviews = await Review.find({ bookId: bookObject._id });
    const review_count = reviews.length;
    const average_rating = review_count > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / review_count
        : 0;

    // Get adder's name
    const addedByUser = await User.findById(bookObject.addedBy);

    // Assemble the final object in the format the frontend expects
    return {
        id: bookObject._id,
        title: bookObject.title,
        author: bookObject.author,
        description: bookObject.description,
        genre: bookObject.genre,
        year: bookObject.publishedYear,
        added_by: bookObject.addedBy,
        added_by_name: addedByUser ? addedByUser.name : 'Unknown',
        created_at: bookObject.createdAt,
        average_rating: average_rating, // FIX: Use snake_case
        review_count: review_count,       // FIX: Use snake_case
    };
};

exports.getBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.per_page) || 6;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { author: { $regex: req.query.search, $options: 'i' } },
            ];
        }
        if (req.query.genre) {
            query.genre = req.query.genre;
        }

        let sortOptions = { createdAt: -1 }; // Default to 'latest'
        if (req.query.sort_by === 'year_desc') sortOptions = { publishedYear: -1 };
        if (req.query.sort_by === 'year_asc') sortOptions = { publishedYear: 1 };

        const totalBooks = await Book.countDocuments(query);
        const books = await Book.find(query).sort(sortOptions).skip(skip).limit(limit);

        let formattedBooks = await Promise.all(books.map(book => formatBookData(book)));

        // Manual sort for rating after calculation
        if (req.query.sort_by === 'rating_desc') {
            formattedBooks.sort((a, b) => b.average_rating - a.average_rating);
        }

        res.json({
            books: formattedBooks,
            total: totalBooks,
            page,
            per_page: limit,
            total_pages: Math.ceil(totalBooks / limit) || 1,
        });
    } catch (err) {
        console.error("Error in getBooks:", err.message);
        res.status(500).send('Server Error');
    }
};

exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ msg: 'Book not found' });
        
        const formattedBook = await formatBookData(book);
        res.json(formattedBook);
    } catch (err) {
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Book not found' });
        console.error("Error in getBookById:", err.message);
        res.status(500).send('Server Error');
    }
};

exports.addBook = async (req, res) => {
    try {
        const newBook = new Book({
            ...req.body,
            publishedYear: req.body.year,
            addedBy: req.user.id,
        });
        await newBook.save();
        const formattedBook = await formatBookData(newBook);
        res.status(201).json(formattedBook);
    } catch (err) {
        console.error("Error in addBook:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ detail: 'Book not found' });
        if (book.addedBy.toString() !== req.user.id) {
            return res.status(403).json({ detail: 'You can only edit your own books' });
        }
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            { ...req.body, publishedYear: req.body.year },
            { new: true }
        );
        const formattedBook = await formatBookData(updatedBook);
        res.json(formattedBook);
    } catch (err) {
        console.error("Error in updateBook:", err.message);
        res.status(500).json({ detail: 'Server Error' });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ detail: 'Book not found' });
        if (book.addedBy.toString() !== req.user.id) {
            return res.status(403).json({ detail: 'You can only delete your own books' });
        }
        await Review.deleteMany({ bookId: req.params.id });
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        console.error("Error in deleteBook:", err.message);
        res.status(500).json({ detail: 'Server Error' });
    }
};

exports.getGenres = async (req, res) => {
    try {
        const genres = await Book.distinct('genre');
        res.json({ genres: genres.filter(g => g).sort() });
    } catch (err) {
        console.error("Error in getGenres:", err.message);
        res.status(500).send('Server Error');
    }
};