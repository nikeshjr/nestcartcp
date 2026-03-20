import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../style/ProductCard.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();
  
  return (
    <div className="card product-card">
      <div className="product-image-container">
        <Link to={`/products/${product.id}`} className="product-image-link w-100 h-100">
          <div className="product-placeholder-image">
             {product.image ? (
               <img 
                 src={product.image} 
                 alt={product.name} 
                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                 onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = product.name.charAt(0); }}
               />
             ) : product.name.charAt(0)}
          </div>
        </Link>
        {product.stock < 10 && <span className="product-badge badge-yellow">Low Stock</span>}
      </div>
      
      <div className="product-info">
        <Link to={`/products/${product.id}`} className="product-title-link">
          <h3 className="product-title">{product.name}</h3>
        </Link>
        <p className="product-desc">{product.description || "Premium quality product."}</p>
        
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {!isAdmin && (
            <button 
              className="btn btn-primary btn-sm add-cart-btn"
              onClick={() => addToCart(product)}
            >
              <ShoppingCart size={18} />
               Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
