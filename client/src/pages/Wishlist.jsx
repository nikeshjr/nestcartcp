import React, { useState, useEffect } from 'react';
import { Heart, PackageSearch, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        const response = await api.get('/wishlist');
        // The backend returns WishlistItem[] which has a product relation
        setWishlistItems(response.data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleWishlistChange = (productId, isInWishlist) => {
    if (!isInWishlist) {
      setWishlistItems(prev => prev.filter(item => item.product.id !== productId));
    }
  };

  if (!user) {
    return (
      <div className="container animate-fade-in flex-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="card text-center" style={{ padding: '3rem', maxWidth: '500px' }}>
          <Heart size={48} color="var(--error)" className="mb-4" />
          <h2 className="mb-2">Your Wishlist</h2>
          <p className="mb-8">Please login to view and manage your favorite items.</p>
          <Link to="/login" className="btn btn-primary w-100">Login Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="flex-between mb-8">
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>My Wishlist</h1>
          <p>You have {wishlistItems.length} items saved for later.</p>
        </div>
        <Link to="/" className="btn btn-outline btn-sm gap-2">
          Continue Shopping <ArrowRight size={18} />
        </Link>
      </div>

      {loading ? (
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      ) : wishlistItems.length > 0 ? (
        <div className="grid-cols-auto">
          {wishlistItems.map(item => (
            <ProductCard key={item.id} product={item.product} isLiked={true} onWishlistChange={handleWishlistChange} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-8" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Heart size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3>Your wishlist is empty</h3>
          <p className="mb-6">Browse our collection and add some favorites!</p>
          <Link to="/" className="btn btn-primary" style={{ alignSelf: 'center' }}>
            Explore Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
