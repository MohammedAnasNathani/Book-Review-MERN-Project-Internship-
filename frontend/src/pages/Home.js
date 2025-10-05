import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { Search, BookOpen } from 'lucide-react';
import BookCard from '../components/BookCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [genres, setGenres] = useState([]);

  const fetchGenres = useCallback(async () => {
    try {
      const response = await api.get('/books/genres');
      setGenres(response.data.genres);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '5', // <--- THIS IS THE FIX. CHANGED FROM '6' to '5'.
      });
      if (search) params.append('search', search);
      if (genre) params.append('genre', genre);
      if (sortBy) params.append('sort_by', sortBy);

      const response = await api.get(`/books?${params}`);
      setBooks(response.data.books);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, [page, search, genre, sortBy]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="home-page">
      <div className="hero-section" data-testid="hero-section">
        <div className="container">
          <h1 className="hero-title" data-testid="hero-title">
            Discover Your Next Great Read
          </h1>
          <p className="hero-subtitle" data-testid="hero-subtitle">
            Share reviews, explore books, and connect with fellow readers
          </p>
        </div>
      </div>

      <div className="container">
        <div className="filters-section" data-testid="filters-section">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <Input
                type="text"
                placeholder="Search by title or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
                data-testid="search-input"
              />
            </div>
            <Button type="submit" data-testid="search-btn">
              Search
            </Button>
          </form>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Genre</label>
              <Select value={genre || 'all'} onValueChange={(value) => { setGenre(value === 'all' ? '' : value); setPage(1); }}>
                <SelectTrigger data-testid="genre-filter">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <Select value={sortBy || 'latest'} onValueChange={(value) => { setSortBy(value === 'latest' ? '' : value); setPage(1); }}>
                <SelectTrigger data-testid="sort-filter">
                  <SelectValue placeholder="Latest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="year_desc">Year (Newest)</SelectItem>
                  <SelectItem value="year_asc">Year (Oldest)</SelectItem>
                  <SelectItem value="rating_desc">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading" data-testid="loading">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="empty-state" data-testid="empty-state">
             <BookOpen size={48} />
            <p>No books found. Try adding a book or adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="books-grid" data-testid="books-grid">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
            {totalPages > 1 && (
                <div className="pagination" data-testid="pagination">
                <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    data-testid="prev-page-btn"
                >
                    Previous
                </Button>
                <span className="page-info" data-testid="page-info">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    data-testid="next-page-btn"
                >
                    Next
                </Button>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;