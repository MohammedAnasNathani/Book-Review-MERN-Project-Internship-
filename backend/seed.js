// backend/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Book = require('./models/Book');
const Review = require('./models/Review');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const seedData = {
    users: [
        { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123' },
        { name: 'Bob Williams', email: 'bob@example.com', password: 'password123' },
        { name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123' },
    ],
    books: [
        {
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            publishedYear: 1960,
            genre: 'Classic',
            description: 'A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice, it views a world of great beauty and savage inequities through the eyes of a young girl, as her father—a crusading local lawyer—risks everything to defend a black man unjustly accused of a terrible crime.',
        },
        {
            title: '1984',
            author: 'George Orwell',
            publishedYear: 1949,
            genre: 'Dystopian',
            description: 'The story of Winston Smith, a lowly party member living in a London ruled by the Party, who is frustrated by the omnipresent eyes of the party, and its ominous ruler Big Brother. The book follows his journey as he begins to question the very system he lives in.',
        },
        {
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            publishedYear: 1925,
            genre: 'Fiction',
            description: 'The story of the fabulously wealthy Jay Gatsby and his new neighbor, Nick Carraway, who recounts his interactions with Gatsby at the height of the Roaring Twenties on Long Island. It is a cautionary tale of the American Dream.',
        },
        {
            title: 'Pride and Prejudice',
            author: 'Jane Austen',
            publishedYear: 1813,
            genre: 'Romance',
            description: 'A romantic novel of manners that follows the emotional development of the protagonist, Elizabeth Bennet, who learns the error of making hasty judgments and comes to appreciate the difference between the superficial and the essential.',
        },
        {
            title: 'The Hobbit',
            author: 'J.R.R. Tolkien',
            publishedYear: 1937,
            genre: 'Fantasy',
            description: 'A fantasy novel and children\'s book about the adventures of a hobbit named Bilbo Baggins, who is swept into an epic quest to reclaim the lost Dwarf Kingdom of Erebor from the fearsome dragon Smaug.',
        },
        {
            title: 'The Catcher in the Rye',
            author: 'J.D. Salinger',
            publishedYear: 1951,
            genre: 'Literary Fiction',
            description: 'The novel details two days in the life of 16-year-old Holden Caulfield after he has been expelled from prep school. Confused and disillusioned, Holden searches for truth and rails against the "phoniness" of the adult world.',
        },
    ]
};

const importData = async () => {
    try {
        // Clear existing data
        await Review.deleteMany();
        await Book.deleteMany();
        await User.deleteMany();

        console.log('Data Cleared!');

        // Create users
        const createdUsers = await User.insertMany(seedData.users);
        console.log(`${createdUsers.length} users created.`);

        // Assign books to users and create them
        const booksWithUsers = seedData.books.map((book, index) => {
            return { ...book, addedBy: createdUsers[index % createdUsers.length]._id };
        });
        const createdBooks = await Book.insertMany(booksWithUsers);
        console.log(`${createdBooks.length} books created.`);

        // Create reviews
        const reviews = [
            { bookTitle: '1984', userName: 'Alice Johnson', rating: 5, text: "A masterpiece that is more relevant today than ever. Chilling and thought-provoking." },
            { bookTitle: '1984', userName: 'Bob Williams', rating: 4, text: "A truly terrifying vision of the future. A must-read for everyone." },
            { bookTitle: 'The Great Gatsby', userName: 'Charlie Brown', rating: 5, text: "Fitzgerald's prose is simply beautiful. A timeless classic about dreams and disillusionment." },
            { bookTitle: 'The Hobbit', userName: 'Alice Johnson', rating: 5, text: "The perfect adventure story. Tolkien's world-building is second to none." },
            { bookTitle: 'Pride and Prejudice', userName: 'Bob Williams', rating: 4, text: "A witty and charming classic. The characters are unforgettable." },
            { bookTitle: 'To Kill a Mockingbird', userName: 'Charlie Brown', rating: 5, text: "An incredibly powerful and important book. Atticus Finch is an icon." },
            { bookTitle: 'The Great Gatsby', userName: 'Alice Johnson', rating: 4, text: "Captures the Jazz Age perfectly. The ending is haunting." },
        ];

        const reviewsToCreate = reviews.map(review => {
            const user = createdUsers.find(u => u.name === review.userName);
            const book = createdBooks.find(b => b.title === review.bookTitle);
            return {
                userId: user._id,
                bookId: book._id,
                rating: review.rating,
                reviewText: review.text,
            };
        });
        
        await Review.insertMany(reviewsToCreate);
        console.log(`${reviewsToCreate.length} reviews created.`);
        
        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Review.deleteMany();
        await Book.deleteMany();
        await User.deleteMany();
        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}