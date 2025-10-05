// frontend/src/pages/BookDetails.js
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Edit, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BookDetails = () => {
  const { id } = useParams();
  const { user, getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const fetchBookDetails = useCallback(async () => {
    try {
      const response = await api.get(`/books/${id}`);
      setBook(response.data);
    } catch (error) {
      toast.error('Failed to fetch book details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await api.get(`/books/${id}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [id]);

  const fetchRatingDistribution = useCallback(async () => {
    try {
      const response = await api.get(`/books/${id}/rating-distribution`);
      const dist = response.data.distribution;
      const chartData = Object.keys(dist).map(key => ({
        rating: `${key} Star${Number(key) !== 1 ? 's' : ''}`,
        count: dist[key]
      })).reverse();
      setRatingDistribution(chartData);
    } catch (error) {
      console.error('Error fetching rating distribution:', error);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchBookDetails();
    fetchReviews();
    fetchRatingDistribution();
  }, [id, fetchBookDetails, fetchReviews, fetchRatingDistribution]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      if (editingReview) {
        await api.put(
          `/reviews/${editingReview.id}`,
          { rating, review_text: reviewText },
          { headers: getAuthHeader() }
        );
        toast.success('Review updated successfully');
        setEditingReview(null);
      } else {
        await api.post(
          `/books/${id}/reviews`,
          { rating, review_text: reviewText },
          { headers: getAuthHeader() }
        );
        toast.success('Review submitted successfully');
      }
      setRating(5);
      setReviewText('');
      fetchReviews();
      fetchBookDetails();
      fetchRatingDistribution();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await api.delete(`/reviews/${reviewId}`, {
        headers: getAuthHeader()
      });
      toast.success('Review deleted successfully');
      fetchReviews();
      fetchBookDetails();
      fetchRatingDistribution();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setRating(review.rating);
    setReviewText(review.review_text);
    document.querySelector('.review-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteBook = async () => {
    if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) return;

    try {
      await api.delete(`/books/${id}`, {
        headers: getAuthHeader()
      });
      toast.success('Book deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete book');
    }
  };

  if (loading) {
    return <div className="loading" data-testid="loading">Loading book details...</div>;
  }

  if (!book) {
    return (
      <div className="container">
        <p className="text-center mt-20">Book not found.</p>
      </div>
    );
  }

  const userHasReviewed = reviews.some(r => r.user_id === user?.id);
  const canShowReviewForm = user && (!userHasReviewed || editingReview);

  return (
    <div className="book-details-page">
      <div className="container">
        <div className="book-details-header" data-testid="book-details-header">
            <div className="book-meta-top">
              <span className="book-genre-badge" data-testid="book-genre-badge">{book.genre}</span>
              <span className="book-year-badge" data-testid="book-year-badge">{book.year}</span>
            </div>
            <h1 className="book-details-title" data-testid="book-details-title">{book.title}</h1>
            <p className="book-details-author" data-testid="book-details-author">by {book.author}</p>
            <div className="book-rating-info">
              <div className="rating-display" data-testid="rating-display">
                <Star size={24} fill="#FDB022" stroke="#FDB022" />
                <span className="rating-value">{book.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="rating-count">({book.reviewCount} {book.reviewCount === 1 ? 'review' : 'reviews'})</span>
              </div>
            </div>
            <p className="book-details-description" data-testid="book-details-description">{book.description}</p>
            <p className="book-added-by" data-testid="book-added-by-info">
              Added by <strong>{book.added_by_name}</strong>
            </p>
            
            {user && book.added_by === user.id && (
              <div className="book-actions">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/books/edit/${book.id}`)}
                  data-testid="edit-book-btn"
                >
                  <Edit size={16} /> Edit Book
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteBook}
                  data-testid="delete-book-btn"
                >
                  <Trash2 size={16} /> Delete Book
                </Button>
              </div>
            )}
        </div>

        {ratingDistribution.length > 0 && ratingDistribution.some(d => d.count > 0) && (
          <div className="rating-chart-section" data-testid="rating-chart">
            <h2>Rating Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingDistribution} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {canShowReviewForm && (
          <div className="review-form-section" data-testid="review-form-section">
            <h2>{editingReview ? 'Edit Your Review' : 'Write a Review'}</h2>
            <form onSubmit={handleSubmitReview} className="review-form" data-testid="review-form">
              <div className="form-group">
                <label>Rating</label>
                <div className="star-selector">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="star-btn"
                      data-testid={`star-${star}`}
                    >
                      <Star
                        size={32}
                        fill={star <= rating ? '#FDB022' : 'hsl(var(--border))'}
                        stroke={star <= rating ? '#FDB022' : 'hsl(var(--muted-foreground))'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  required
                  rows={5}
                  data-testid="review-text-input"
                />
              </div>
              <div className="form-actions">
                <Button type="submit" disabled={submitting} data-testid="submit-review-btn">
                  {submitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
                </Button>
                {editingReview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingReview(null);
                      setRating(5);
                      setReviewText('');
                    }}
                    data-testid="cancel-edit-btn"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="reviews-section" data-testid="reviews-section">
          <h2>
            <MessageSquare size={24} />
            Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div className="empty-state" data-testid="no-reviews">
              <MessageSquare size={48}/>
              <p>No reviews yet. Be the first to review this book!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-card" data-testid={`review-${review.id}`}>
                  <div className="review-header">
                    <div>
                      <p className="review-author" data-testid="review-author">{review.user_name}</p>
                      <div className="review-rating" data-testid="review-rating">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < review.rating ? '#FDB022' : 'none'}
                            stroke={i < review.rating ? '#FDB022' : 'hsl(var(--muted-foreground))'}
                          />
                        ))}
                      </div>
                    </div>
                    {user && review.user_id === user.id && (
                      <div className="review-actions">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="icon-btn"
                          data-testid={`edit-review-${review.id}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="icon-btn"
                          data-testid={`delete-review-${review.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="review-text" data-testid="review-text">{review.review_text}</p>
                  <p className="review-date" data-testid="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;