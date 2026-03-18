import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, PackageSearch, History, Menu, X, User, LogOut, ShieldCheck, Search, Tag } from 'lucide-react';
import api from '../services/api';
import '../style/Navbar.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [suggestions, setSuggestions] = React.useState({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const suggestionRef = React.useRef(null);
  const searchTimeout = React.useRef(null);

  // Synchronize searchTerm with URL search param
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search') || '';
    setSearchTerm(search);
  }, [location.search]);

  // Click away listener for suggestions
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions({ products: [], categories: [] });
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/products/suggestions?q=${encodeURIComponent(query)}`);
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (value.trim()) {
      searchTimeout.current = setTimeout(() => {
        fetchSuggestions(value.trim());
      }, 300);
    } else {
      setSuggestions({ products: [], categories: [] });
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (type, item) => {
    setShowSuggestions(false);
    if (type === 'product') {
      navigate(`/products/${item.id}`);
    } else {
      navigate(`/?categoryId=${item.id}&categoryName=${encodeURIComponent(item.name)}`);
    }
    setSearchTerm('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
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
          <div className="navbar-search-wrapper" ref={suggestionRef}>
            <form className="navbar-search desktop-menu" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
              />
              <button type="submit">
                <Search size={18} />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
              <div className="search-suggestions card animate-fade-in">
                {suggestions.categories.length > 0 && (
                  <div className="suggestion-group">
                    <div className="suggestion-label">Categories</div>
                    {suggestions.categories.map(cat => (
                      <div 
                        key={`cat-${cat.id}`} 
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick('category', cat)}
                      >
                        <Tag size={14} />
                        <span>{cat.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {suggestions.products.length > 0 && (
                  <div className="suggestion-group">
                    <div className="suggestion-label">Products</div>
                    {suggestions.products.map(prod => (
                      <div 
                        key={`prod-${prod.id}`} 
                        className="suggestion-item product-suggestion"
                        onClick={() => handleSuggestionClick('product', prod)}
                      >
                        <div className="suggestion-img">
                          {prod.image ? (
                            <img src={prod.image} alt="" />
                          ) : (
                            <PackageSearch size={16} />
                          )}
                        </div>
                        <div className="suggestion-info">
                          <div className="suggestion-name">{prod.name}</div>
                          <div className="suggestion-price">${prod.price.toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {loading && <div className="suggestion-loading">Searching...</div>}
              </div>
            )}
          </div>

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
          <Link to="/cart" className={`mobile-nav-link ${isActive('/cart')}`} onClick={toggleMenu}>
            Cart ({itemCount})
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
