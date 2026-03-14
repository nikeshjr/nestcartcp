import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ProductCard.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const ProductCard = ({ product, isLiked = false, onWishlistChange }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [isInWishlist, setIsInWishlist] = React.useState(isLiked);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      showToast('Please login to add items to wishlist', 'info');
      return;
    }
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${product.id}`);
        setIsInWishlist(false);
        showToast('Removed from wishlist', 'info');
        if (onWishlistChange) onWishlistChange(product.id, false);
      } else {
        await api.post('/wishlist', { productId: product.id });
        setIsInWishlist(true);
        showToast('Added to wishlist', 'success');
        if (onWishlistChange) onWishlistChange(product.id, true);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  return (
    <div className="card product-card">
      <div className="product-image-container">
        {/* Mocking an image background matching the theme since we don't have real images in DB */}
        <div className="product-placeholder-image">
           {product.name.charAt(0)}
        </div>
        <button 
          className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
          onClick={toggleWishlist}
          title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={18} fill={isInWishlist ? "var(--error)" : "none"} color={isInWishlist ? "var(--error)" : "white"} />
        </button>
        {product.stock < 10 && <span className="product-badge badge-yellow">Low Stock</span>}
      </div>
      
      <div className="product-info">
        <Link to={`/products/${product.id}`} className="product-title-link">
          <h3 className="product-title">{product.name}</h3>
        </Link>
        <p className="product-desc">{product.description || "Premium quality product."}</p>
        
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button 
            className="btn btn-primary btn-sm add-cart-btn"
            onClick={() => addToCart(product)}
          >
            <ShoppingCart size={18} />
             Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
