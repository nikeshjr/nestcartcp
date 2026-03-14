import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, PackageSearch, History, Menu, X, User, LogOut, ShieldCheck, Heart } from 'lucide-react';
import './Navbar.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Synchronize searchTerm with URL search param
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    setSearchTerm(search);
  }, [location.search]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      navigate(`/?search=${encodeURIComponent(value.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <PackageSearch className="brand-icon" />
            <span>NestMart</span>
          </Link>

          {/* Search Bar */}
          <form className="navbar-search desktop-menu" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleInputChange}
            />
            <button type="submit">
              <PackageSearch size={18} />
            </button>
          </form>

          {/* Desktop Menu */}
          <div className="navbar-menu desktop-menu">
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Products
            </Link>
            {user && (
              <Link to="/orders" className={`nav-link ${isActive('/orders')}`}>
                <History size={18} /> Orders
              </Link>
            )}
            
            {isAdmin && (
              <Link to="/admin" className={`nav-link ${isActive('/admin')}`} style={{ color: 'var(--accent-yellow)' }}>
                <ShieldCheck size={18} /> Admin Dashboard
              </Link>
            )}

            {user && (
              <Link to="/wishlist" className={`nav-link ${isActive('/wishlist')}`} title="Wishlist">
                <Heart size={18} />
              </Link>
            )}
            
            <Link to="/cart" className={`nav-cart ${isActive('/cart')}`}>
              <ShoppingCart size={20} />
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>

            {user ? (
                <div className="user-profile-menu flex-center" style={{ gap: '1rem', marginLeft: '1rem' }}>
                  <span className="user-greeting">Hello, {user.username}</span>
                  <button onClick={handleLogout} className="nav-link" style={{ padding: 0 }} aria-label="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
            ) : (
               <div className="flex-center" style={{ gap: '1rem', marginLeft: '1rem' }}>
                 <Link to="/login" className="nav-link">Login</Link>
                 <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
               </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="mobile-menu-btn">
            <button onClick={toggleMenu} aria-label="Toggle menu">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu animate-fade-in">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleInputChange}
            />
          </form>
          <Link to="/" className={`mobile-nav-link ${isActive('/')}`} onClick={toggleMenu}>
            Products
          </Link>
          {user && (
            <Link to="/wishlist" className={`mobile-nav-link ${isActive('/wishlist')}`} onClick={toggleMenu}>
              Favorites
            </Link>
          )}
          <Link to="/cart" className={`mobile-nav-link ${isActive('/cart')}`} onClick={toggleMenu}>
            Cart ({itemCount})
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
