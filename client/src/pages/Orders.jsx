import React, { useState, useEffect } from 'react';
import { Package, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useSocket } from '../context/SocketContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Pagination from '../components/Pagination';

const STEPS = ['pending', 'processing', 'shipped', 'delivered'];

// Map legacy 'completed' status to 'delivered'
const normalizeStatus = (status) => status === 'completed' ? 'delivered' : status;

const getStepState = (stepStatus, orderStatus) => {
  const normalized = normalizeStatus(orderStatus);
  if (normalized === 'cancelled') {
    return 'cancelled-step';
  }
  const stepIndex = STEPS.indexOf(stepStatus);
  const currentIndex = STEPS.indexOf(normalized);
  if (currentIndex < 0) return 'inactive';
  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'current';
  return 'inactive';
};

const getProgress = (orderStatus) => {
  const normalized = normalizeStatus(orderStatus);
  if (normalized === 'cancelled') return 0;
  const idx = STEPS.indexOf(normalized);
  if (idx < 0) return 0;
  return idx / (STEPS.length - 1);
};

const Orders = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders', { params: { page, limit: 10 } });
      const orderData = response.data;
      
      if (orderData && orderData.meta) {
        setOrders(orderData.data || []);
        setTotalPages(orderData.meta.totalPages || 1);
        setTotalOrders(orderData.meta.total || 0);
      } else {
        setOrders(Array.isArray(orderData) ? orderData : []);
        setTotalPages(1);
        setTotalOrders(Array.isArray(orderData) ? orderData.length : 0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user, page]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleOrderStatusUpdate = (data) => {
      console.log('Orders.jsx: Received orderStatusUpdated:', data);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          Number(order.id) === Number(data.orderId) 
            ? { ...order, status: data.status } 
            : order
        )
      );
    };

    socket.on('orderStatusUpdated', handleOrderStatusUpdate);

    return () => {
      socket.off('orderStatusUpdated', handleOrderStatusUpdate);
    };
  }, [socket, user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await api.patch(`/orders/${orderId}/cancel`);
      showToast('Order cancelled successfully', 'error');
      fetchOrders(); // Refresh list
    } catch (error) {
      console.error('Error cancelling order:', error);
      showToast(error.response?.data?.message || 'Failed to cancel order', 'error');
    }
  };

  if (!user) {
    return (
      <div className="container animate-fade-in flex-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="card text-center" style={{ padding: '3rem', maxWidth: '500px' }}>
          <Lock size={48} color="var(--accent-yellow-dark)" className="mb-4" />
          <h2 className="mb-2">Authentication Required</h2>
          <p className="mb-8">Please log in to view your order history.</p>
          <Link to="/login" className="btn btn-primary w-100">
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container animate-fade-in">
        <div className="mb-8">
          <div className="skeleton skeleton-title" style={{ width: '250px', height: '2.5rem' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '350px', height: '1.2rem', marginTop: '0.5rem' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)' }}></div>
                  <div>
                    <div className="skeleton skeleton-title" style={{ width: '120px', height: '1.5rem' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '180px', height: '1rem', marginTop: '0.5rem' }}></div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="skeleton border-radius-sm" style={{ width: '80px', height: '1.5rem', marginLeft: 'auto' }}></div>
                  <div className="skeleton border-radius-sm mt-3" style={{ width: '100px', height: '1.2rem', marginLeft: 'auto' }}></div>
                </div>
              </div>
              <div className="skeleton" style={{ width: '100%', height: '4px', borderRadius: '2px' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="skeleton skeleton-text" style={{ width: '150px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '100%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="mb-8">
        <h1>Order History</h1>
        <p>Track your past purchases and their status.</p>
      </div>

      {orders.length === 0 ? (
        <div className="card flex-center flex-column" style={{ padding: '4rem 2rem' }}>
          <Package size={48} color="var(--text-muted)" className="mb-4" />
          <h2 className="mb-2">No orders found</h2>
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="card order-card-animated"
              style={{ padding: '1.5rem', animationDelay: `${index * 0.1}s` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <Package color="var(--primary-blue)" />
                  </div>
                  <div>
                    <h3 style={{ marginBottom: '0.25rem' }}>Order #{order.id}</h3>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--primary-blue-dark)', marginBottom: '0.25rem' }}>
                    ${(order.total || 0).toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                    {normalizeStatus(order.status) === 'pending' && <span className="badge badge-yellow">Pending</span>}
                    {normalizeStatus(order.status) === 'processing' && <span className="badge badge-blue">Processing</span>}
                    {normalizeStatus(order.status) === 'shipped' && <span className="badge badge-primary">Shipped</span>}
                    {normalizeStatus(order.status) === 'delivered' && <span className="badge badge-success">Delivered</span>}
                    {normalizeStatus(order.status) === 'cancelled' && <span className="badge badge-error">Cancelled</span>}
                  </div>
                  {normalizeStatus(order.status) === 'pending' && (
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleCancelOrder(order.id)}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Animated Status Timeline */}
              <div
                className="status-timeline mb-6"
                style={{ '--progress': getProgress(order.status) }}
              >
                {STEPS.map((step) => (
                  <div key={step} className={`timeline-step ${getStepState(step, order.status)}`}>
                    <div className="step-dot"></div>
                    <div className="step-label">{step.charAt(0).toUpperCase() + step.slice(1)}</div>
                  </div>
                ))}
              </div>

              {order.items && order.items.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Items Ordered:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {order.items.map(item => (
                      <div key={item.id} className="order-item-row">
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                           <span style={{ fontWeight: '600', color: 'var(--primary-blue)' }}>{item.quantity}x</span>
                           <span style={{ color: 'var(--text-main)' }}>{item.product?.name || 'Product'}</span>
                        </div>
                        <span style={{ fontWeight: '500', color: 'var(--text-muted)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => { setPage(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      </>
      )}
    </div>
  );
};

export default Orders;
