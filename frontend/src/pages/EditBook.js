import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const EditBook = () => {
  const { id } = useParams();
  const { getAuthHeader, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    year: new Date().getFullYear()
  });

  const fetchBook = useCallback(async () => {
    try {
      const response = await api.get(`/books/${id}`); // THIS IS THE CORRECTED LINE
      const book = response.data;
      
      // Ensure user is loaded before checking ownership
      if (!user || book.added_by !== user._id) {
        toast.error('You can only edit your own books.');
        navigate('/');
        return;
      }

      setFormData({
        title: book.title,
        author: book.author,
        description: book.description,
        genre: book.genre,
        year: book.year
      });
    } catch (error) {
      toast.error('Failed to fetch book details.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    // Wait until the user object is loaded before fetching the book
    if (user) {
        fetchBook();
    }
  }, [user, fetchBook]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.put(
        `/books/${id}`,
        formData,
        { headers: getAuthHeader() }
      );
      toast.success('Book updated successfully!');
      navigate(`/books/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update book.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading" data-testid="loading">Loading book...</div>;
  }

  return (
    <div className="edit-book-page">
      <div className="container">
        <div className="form-page-header" data-testid="edit-book-header">
          <h1>Edit Book</h1>
          <p>Update the book information</p>
        </div>

        <form onSubmit={handleSubmit} className="book-form" data-testid="edit-book-form">
            <div className="form-group">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter book title"
              />
            </div>

            <div className="form-group">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                placeholder="Enter author name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <Label htmlFor="genre">Genre *</Label>
                <Input
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Fiction, Mystery"
                />
              </div>

              <div className="form-group">
                <Label htmlFor="year">Published Year *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="1000"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="form-group">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Describe the book..."
              />
            </div>

            <div className="form-actions">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating Book...' : 'Update Book'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/books/${id}`)}
              >
                Cancel
              </Button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;