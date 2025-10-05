import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BookOpen, Plus, User, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="nav-brand" data-testid="nav-brand">
            <BookOpen size={28} />
            <span>BookWorm</span>
          </Link>

          <div className="nav-actions">
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              data-testid="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {user ? (
              <>
                <Button
                  onClick={() => navigate('/books/add')}
                  className="add-book-btn"
                  data-testid="add-book-btn"
                >
                  <Plus size={18} />
                  <span className="btn-text">Add Book</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/profile')}
                  data-testid="profile-btn"
                >
                  <User size={18} />
                  <span className="btn-text">{user.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  data-testid="logout-btn"
                >
                  <LogOut size={18} />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  data-testid="login-nav-btn"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/signup')}
                  data-testid="signup-nav-btn"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
