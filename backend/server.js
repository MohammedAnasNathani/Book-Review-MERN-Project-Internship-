// backend/server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');

// Add these lines to handle Mongoose strictQuery warning
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// Add schemas to avoid missing schema errors
require('./models/User');
require('./models/Book');
require('./models/Review');

dotenv.config();
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/profile', require('./routes/profileRoutes')); // NEW

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));