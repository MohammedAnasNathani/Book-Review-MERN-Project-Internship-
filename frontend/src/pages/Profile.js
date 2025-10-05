import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import BookCard from '../components/BookCard';
import { Star, BookOpen, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
  const { user, getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!getAuthHeader) return;
    try {
      const response = await api.get(`/profile`, {
        headers: getAuthHeader()
      });
      setProfileData(response.data);
    } catch (error) {
      toast.error('Failed to fetch profile data.');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return <div className="loading" data-testid="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header" data-testid="profile-header">
          <div className="profile-avatar" data-testid="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1 data-testid="profile-name">{user?.name}</h1>
            <p data-testid="profile-email">{user?.email}</p>
            <div className="profile-stats">
              <div className="stat">
                <BookOpen size={20} />
                <span>{profileData?.books?.length || 0} Books Added</span>
              </div>
              <div className="stat">
                <MessageSquare size={20} />
                <span>{profileData?.reviews?.length || 0} Reviews Written</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="books" className="profile-tabs" data-testid="profile-tabs">
          <TabsList>
            <TabsTrigger value="books" data-testid="books-tab">My Books</TabsTrigger>
            <TabsTrigger value="reviews" data-testid="reviews-tab">My Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="books" data-testid="books-tab-content">
            {!profileData || profileData.books.length === 0 ? (
              <div className="empty-state" data-testid="no-books">
                <BookOpen size={48} />
                <p>You haven't added any books yet.</p>
              </div>
            ) : (
              <div className="books-grid">
                {profileData.books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" data-testid="reviews-tab-content">
            {!profileData || profileData.reviews.length === 0 ? (
              <div className="empty-state" data-testid="no-reviews">
                <MessageSquare size={48} />
                <p>You haven't written any reviews yet.</p>
              </div>
            ) : (
              <div className="reviews-list">
                {profileData.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="profile-review-card"
                    onClick={() => navigate(`/books/${review.book_id}`)}
                    data-testid={`profile-review-${review.id}`}
                  >
                    <div className="review-book-info">
                      <h3 data-testid="review-book-title">{review.book_title}</h3>
                      <p data-testid="review-book-author">by {review.book_author}</p>
                    </div>
                    <div className="review-rating" data-testid="profile-review-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < review.rating ? '#FDB022' : 'none'}
                          stroke={i < review.rating ? '#FDB022' : 'hsl(var(--muted-foreground))'}
                        />
                      ))}
                    </div>
                    <p className="review-text" data-testid="profile-review-text">{review.review_text}</p>
                    <p className="review-date" data-testid="profile-review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;