import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft, MessageSquare, User, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useNotification();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit review state
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const [prodRes, reviewsRes, ratingRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/reviews/product/${id}`),
          api.get(`/reviews/product/${id}/rating`)
        ]);
        
        setProduct(prodRes.data);
        setReviews(reviewsRes.data);
        setRatingStats(ratingRes.data);
      } catch (error) {
        console.error('Error fetching product details:', error);
        showToast('Error loading product details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, showToast]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please login to leave a review', 'info');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await api.post('/reviews', {
        productId: parseInt(id),
        rating: newRating,
        comment: newComment
      });
      
      setReviews([response.data, ...reviews]);
      // Refresh rating stats
      const ratingRes = await api.get(`/reviews/product/${id}/rating`);
      setRatingStats(ratingRes.data);
      
      setNewComment('');
      setNewRating(5);
      showToast('Review submitted successfully!', 'success');
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r.id !== reviewId));
      
      // Refresh rating stats
      const ratingRes = await api.get(`/reviews/product/${id}/rating`);
      setRatingStats(ratingRes.data);
      
      showToast('Review deleted', 'error');
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('Failed to delete review', 'error');
    }
  };

  const handleStartEdit = (review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.patch(`/reviews/${editingId}`, {
        rating: editRating,
        comment: editComment
      });
      
      setReviews(reviews.map(r => r.id === editingId ? response.data : r));
      
      // Refresh rating stats
      const ratingRes = await api.get(`/reviews/product/${id}/rating`);
      setRatingStats(ratingRes.data);
      
      setEditingId(null);
      showToast('Review updated', 'warning');
    } catch (error) {
      console.error('Error updating review:', error);
      showToast('Failed to update review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={18} 
            className={star <= rating ? 'star-filled' : 'star-empty'} 
            fill={star <= rating ? 'var(--accent-yellow)' : 'none'}
          />
        ))}
      </div>
    );
  };

  if (loading) return <div className="container flex-center py-8"><div className="spinner"></div></div>;
  if (!product) return <div className="container text-center py-8"><h2>Product not found</h2><Link to="/" className="btn btn-primary mt-4">Go Home</Link></div>;

  return (
    <div className="container animate-fade-in product-detail-page">
      <Link to="/" className="back-link mb-8 flex-center">
        <ArrowLeft size={18} /> Back to Products
      </Link>
      
      <div className="product-main-grid">
        <div className="product-image-section">
          <div className="product-large-image">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-100 h-100"
                style={{ objectFit: 'cover', borderRadius: 'inherit' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = product.name.charAt(0); }}
              />
            ) : product.name.charAt(0)}
          </div>
        </div>
        
        <div className="product-details-section">
          <h1 className="mb-2">{product.name}</h1>
          <div className="product-meta mb-4">
            {renderStars(Math.round(ratingStats.averageRating))}
            <span className="rating-text">({ratingStats.count} reviews)</span>
          </div>
          <p className="product-price-lg mb-6">${product.price.toFixed(2)}</p>
          <p className="product-description mb-8">{product.description || "Premium quality product with attention to detail."}</p>
          
          <div className="product-actions">
            <button 
              className="btn btn-primary btn-lg glow-hover w-100 mb-4"
              onClick={() => addToCart(product)}
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <div className="product-stock-info">
              {product.stock > 0 ? (
                <span className="text-success">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-error">Out of Stock</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="reviews-section mt-12">
        <h2 className="section-title mb-8 flex-center">
          <MessageSquare size={24} /> Customer Reviews
        </h2>

        <div className="reviews-grid">
          <div className="reviews-list-container">
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.id} className="card review-card mb-4">
                    {editingId === review.id ? (
                      <form onSubmit={handleUpdateReview} className="edit-review-form">
                        <div className="form-group">
                          <label className="form-label">Edit Rating</label>
                          <div className="star-select">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button 
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                className="star-btn"
                              >
                                <Star 
                                  size={20} 
                                  fill={star <= editRating ? 'var(--accent-yellow)' : 'none'}
                                  className={star <= editRating ? 'star-filled' : 'star-empty'}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Edit Comment</label>
                          <textarea 
                            className="form-input" 
                            rows="3" 
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            required
                          ></textarea>
                        </div>
                        <div className="flex gap-4 mt-4">
                          <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="review-header">
                          <div className="user-info flex-center">
                            <User size={16} />
                            <span className="username">{review.user.username}</span>
                            {(user?.id === review.userId || user?.role === 'admin') && (
                              <div className="review-actions ml-auto">
                                {user?.id === review.userId && (
                                  <button className="action-btn-edit" onClick={() => handleStartEdit(review)} title="Edit Review">
                                    <Edit2 size={14} /> Edit
                                  </button>
                                )}
                                <button className="action-btn-delete" onClick={() => handleDeleteReview(review.id)} title="Delete Review">
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                          <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        {renderStars(review.rating)}
                        <p className="review-comment mt-3">{review.comment}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-8">
                <p>No reviews yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>

          <div className="review-form-container">
            <div className="card review-form-card">
              <h3>Leave a Review</h3>
              <form onSubmit={handleSubmitReview} className="mt-4">
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div className="star-select">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="star-btn"
                      >
                        <Star 
                          size={24} 
                          fill={star <= newRating ? 'var(--accent-yellow)' : 'none'}
                          className={star <= newRating ? 'star-filled' : 'star-empty'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Your Comment</label>
                  <textarea 
                    className="form-input" 
                    rows="4" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tell us what you think..."
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
