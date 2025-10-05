// backend/controllers/bookController.js
const Book = require('../models/Book');
const Review = require('../models/Review');

// @desc    Get all books with pagination, search, filter, and sort
// @route   GET /api/books
exports.getBooks = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.per_page) || 5; // Use per_page to match new frontend
  const skip = (page - 1) * limit;

  const search = req.query.search || '';
  const genre = req.query.genre || '';
  const sortBy = req.query.sort_by || 'latest';

  try {
    // Build Query
    let query = {};
    
    // Search (Title or Author)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by Genre
    if (genre && genre !== 'all') {
      query.genre = genre;
    }

    // Determine Sorting
    let sortOptions = {};
    switch (sortBy) {
        case 'year_desc': sortOptions = { publishedYear: -1 }; break;
        case 'year_asc': sortOptions = { publishedYear: 1 }; break;
        case 'rating_desc': sortOptions = { averageRating: -1 }; break; // We need to calculate this
        default: sortOptions = { createdAt: -1 }; // 'latest'
    }

    // If sorting by rating, we need a more complex aggregation, 
    // for now, let's stick to basic sorts to keep it stable, or calculate on fly.
    // Simplified approach for MERN assignment:
    
    let booksQuery = Book.find(query)
        .populate('addedBy', 'name')
        .sort(sortOptions);

    // Execute query with pagination
    const books = await booksQuery.skip(skip).limit(limit).lean();

    // Calculate ratings for these books (needed for display & sorting)
    for (let book of books) {
        const reviews = await Review.find({ bookId: book._id });
        book.reviewCount = reviews.length;
        book.averageRating = reviews.length > 0 
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
            : 0;
        // Map _id to id for frontend consistency
        book.id = book._id; 
        book.added_by_name = book.addedBy.name;
        book.year = book.publishedYear; // map for frontend
    }

    // Manual sort if rating_desc was requested (since it's calculated)
    if (sortBy === 'rating_desc') {
        books.sort((a, b) => b.averageRating - a.averageRating);
    }

    const totalBooks = await Book.countDocuments(query);

    res.json({
        books,
        total: totalBooks,
        page,
        per_page: limit,
        total_pages: Math.ceil(totalBooks / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get a single book by ID
// @route   GET /api/books/:id
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name').lean();
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    // Get stats
    const reviews = await Review.find({ bookId: book._id });
    book.reviewCount = reviews.length;
    book.averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
        : 0;
    
    // Format for frontend
    book.id = book._id;
    book.added_by = book.addedBy._id;
    book.added_by_name = book.addedBy.name;
    book.year = book.publishedYear;

    res.json(book);
  } catch (err) {
    console.error(err.message);
    if(err.kind === 'ObjectId') return res.status(404).json({ msg: 'Book not found' });
    res.status(500).send('Server Error');
  }
};

// @desc    Add a new book
// @route   POST /api/books
exports.addBook = async (req, res) => {
  const { title, author, description, genre, year } = req.body; // frontend sends 'year'
  
  try {
    const newBook = new Book({
      title,
      author,
      description,
      genre,
      publishedYear: year, // map to schema
      addedBy: req.user.id,
    });
    const book = await newBook.save();
    //Return formatted
    const populated = await Book.findById(book._id).populate('addedBy', 'name').lean();
    populated.id = populated._id;
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
exports.updateBook = async (req, res) => {
    const { title, author, description, genre, year } = req.body;

    try {
        let book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ msg: 'Book not found' });

        if (book.addedBy.toString() !== req.user.id) {
            return res.status(403).json({ detail: 'You can only edit your own books' }); // Use 'detail' for sonner
        }

        book = await Book.findByIdAndUpdate(
            req.params.id, 
            { $set: { title, author, description, genre, publishedYear: year } }, 
            { new: true }
        );
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
    try {
        let book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ msg: 'Book not found' });

        if (book.addedBy.toString() !== req.user.id) {
            return res.status(403).json({ detail: 'You can only delete your own books' });
        }

        await Book.findByIdAndDelete(req.params.id);
        // Delete associated reviews
        await Review.deleteMany({ bookId: req.params.id });
        
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all unique genres
// @route   GET /api/genres
exports.getGenres = async (req, res) => {
    try {
        const genres = await Book.distinct('genre');
        res.json({ genres: genres.sort() });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};