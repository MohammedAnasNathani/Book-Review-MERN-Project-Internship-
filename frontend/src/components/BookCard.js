import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare } from 'lucide-react';

const BookCard = ({ book }) => {
  const navigate = useNavigate();

  return (
    <div
      className="book-card"
      onClick={() => navigate(`/books/${book.id}`)}
      data-testid={`book-card-${book.id}`}
    >
      <div className="book-card-header">
        <h3 className="book-title" data-testid="book-title">{book.title}</h3>
        <span className="book-genre" data-testid="book-genre">{book.genre}</span>
      </div>
      
      <p className="book-author" data-testid="book-author">by {book.author}</p>
      
      <p className="book-description" data-testid="book-description">
        {book.description.length > 150
          ? `${book.description.substring(0, 150)}...`
          : book.description}
      </p>
      
      <div className="book-card-footer">
        <div className="book-meta">
          <span className="book-year" data-testid="book-year">{book.year}</span>
          <span className="book-added-by" data-testid="book-added-by">
            Added by {book.added_by_name}
          </span>
        </div>
        
        <div className="book-stats">
          <div className="stat" data-testid="book-rating">
            <Star size={16} fill="#FDB022" stroke="#FDB022" />
            <span>{book.average_rating?.toFixed(1) || '0.0'}</span>
          </div>
          <div className="stat" data-testid="book-review-count">
            <MessageSquare size={16} />
            <span>{book.review_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
