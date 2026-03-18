import React, { useState } from 'react';
import { Trash2, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';
import '../style/Cart.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, checkout } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart', message: 'Please login to place your order' } });
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      await checkout();
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="container animate-fade-in flex-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="card text-center" style={{ padding: '4rem 2rem', maxWidth: '500px' }}>
          <ShoppingBag size={64} className="mb-4" style={{ color: 'var(--accent-yellow)' }} />
          <h2 className="mb-2">Login to see your cart</h2>
          <p className="mb-8">You need to be logged in to view your items and place orders.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary">Login Now</Link>
            <Link to="/" className="btn btn-secondary">Browse Products</Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container animate-fade-in flex-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="card text-center" style={{ padding: '4rem 2rem', maxWidth: '500px' }}>
          <CheckCircle size={64} color="var(--success)" className="mb-4" />
          <h2 className="mb-2">Order Placed!</h2>
          <p className="mb-8">Your order has been received and is being processed.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/orders" className="btn btn-primary">View My Orders</Link>
            <Link to="/" className="btn btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="cart-header mb-8">
        <h1>Your Shopping Cart</h1>
        <p>Review your items before checkout.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart flex-center flex-column">
          <ShoppingBag size={64} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h2>Your cart is empty</h2>
          <p className="mb-4">Looks like you haven't added anything yet.</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item card">
                <div className="item-image-placeholder">
                  {item.name.charAt(0)}
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <div className="item-price">${item.price.toFixed(2)}</div>
                </div>
                <div className="item-actions">
                  <div className="quantity-controls">
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.productId, -1)}>-</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.productId, 1)}>+</button>
                  </div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button className="remove-btn" aria-label="Remove item" onClick={() => removeFromCart(item.id, item.productId)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="card summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              {error && (
                <div className="alert alert-error mb-4 flex-center gap-2" style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                  <AlertCircle size={18} /> {error}
                </div>
              )}
              <button 
                className="btn btn-primary w-100 mt-4 checkout-btn"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? <div className="spinner spinner-sm"></div> : 'Place My Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
