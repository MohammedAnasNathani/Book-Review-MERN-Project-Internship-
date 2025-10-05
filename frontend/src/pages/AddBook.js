import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AddBook = () => {
  const { getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    year: new Date().getFullYear()
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post(
        `/books`,
        formData,
        { headers: getAuthHeader() }
      );
      toast.success('Book added successfully!');
      navigate(`/books/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || error.response?.data?.msg || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-book-page">
      <div className="container">
        <div className="form-page-header" data-testid="add-book-header">
          <h1>Add a New Book</h1>
          <p>Share a book with the BookWorm community</p>
        </div>

        <form onSubmit={handleSubmit} className="book-form" data-testid="add-book-form">
          <div className="form-group">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter book title"
              data-testid="book-title-input"
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
              data-testid="book-author-input"
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
                data-testid="book-genre-input"
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
                data-testid="book-year-input"
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
              data-testid="book-description-input"
            />
          </div>

          <div className="form-actions">
            <Button type="submit" disabled={loading} data-testid="submit-book-btn">
              {loading ? 'Adding Book...' : 'Add Book'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              data-testid="cancel-btn"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;