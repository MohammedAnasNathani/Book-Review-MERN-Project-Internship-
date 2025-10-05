# BookWorm - A Full-Stack Book Review Platform

BookWorm is a modern, feature-rich web application built with the MERN stack (MongoDB, Express, React, Node.js). It provides a platform for users to discover, add, and review books, engage with a community of readers, and track their literary journey.

### [https://book-review-mern-project-inte-git-a7e9e5-anas-projects-3c84ac6e.vercel.app/]

---

## Features

This project fulfills all core assignment requirements and implements a full suite of impressive bonus features.

### Core Features
*   **Full User Authentication:** Secure signup and login system using JWT and password hashing.
*   **Complete Book Management (CRUD):** Users can create, read, update, and delete books.
*   **Robust Review System (CRUD):** Authenticated users can add, edit, and delete their own reviews for any book.
*   **Ownership Protection:** Users can only edit or delete books and reviews that they have personally created.
*   **Dynamic Pagination:** The main book list is paginated to handle a large number of entries efficiently.
*   **Calculated Ratings:** Average book ratings are calculated and displayed dynamically across the application.

### ⭐ Impressive Bonus Features
*   **Advanced Search, Filter & Sort:**
    *   Search for books by title or author.
    *   Filter the book list by genre.
    *   Sort books by latest, publication year (newest/oldest), or highest rating.
*   **Data Visualization:** A bar chart on the Book Details page visualizes the distribution of ratings for each book.
*   **Dark/Light Mode:** A beautiful, persistent dark mode toggle for comfortable night reading.
*   **User Profile Page:** A dedicated profile page where users can view a collection of all the books they've added and all the reviews they've written.

## Tech Stack

**Backend:**
*   **Node.js & Express:** For the RESTful API server.
*   **MongoDB (with Mongoose):** NoSQL database for storing all application data.
*   **JSON Web Tokens (JWT):** For securing API endpoints.
*   **Bcrypt.js:** For hashing user passwords.
*   **dotenv:** For managing environment variables.

**Frontend:**
*   **React:** For building the user interface.
*   **React Router:** For client-side routing and navigation.
*   **Context API:** For global state management (Authentication & Theme).
*   **Tailwind CSS:** For a modern, utility-first styling approach.
*   **Shadcn/UI:** For beautifully designed, accessible UI components.
*   **Recharts:** For creating the rating distribution chart.
*   **Sonner:** For elegant toast notifications.
*   **Lucide React:** For crisp, clean icons.

## Setup and Installation

### Prerequisites
- Node.js and npm (or yarn)
- A MongoDB Atlas account

### 1. Clone the Repository
```bash
git clone https://github.com/mohammed-anas-nathani/book-review-platform.git
cd book-review-platform
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `/backend` directory and add your secret keys:
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
```
Start the backend server:
```bash
npm start
```
The server will run on `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
```
Create a `.env` file in the `/frontend` directory and point it to your local backend server:
```
REACT_APP_BACKEND_URL=http://localhost:5000
```
Start the frontend development server:
```bash
npm start
The application will open at `http://localhost:3000`.
