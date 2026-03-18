import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { Package, ClipboardList, Plus, Edit, Trash2, CheckCircle, Clock, XCircle, ChevronRight, BarChart, TrendingUp, Tag, X } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import Pagination from '../components/Pagination';
import '../style/AdminDashboard.css';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', or 'analytics'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);

  // Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form States
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', image: '' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin, activeTab, productPage, orderPage]);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      if (activeTab === 'products') {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products', { params: { page: productPage, limit: 10 } }),
          api.get('/categories')
        ]);
        
        const prodData = prodRes.data;
        if (prodData && prodData.meta) {
          setProducts(prodData.data || []);
          setProductTotalPages(prodData.meta.totalPages || 1);
          setProductTotal(prodData.meta.total || 0);
        } else {
          setProducts(Array.isArray(prodData) ? prodData : []);
          setProductTotalPages(1);
          setProductTotal(Array.isArray(prodData) ? prodData.length : 0);
        }
        
        setCategories(catRes.data);
      } else if (activeTab === 'orders') {
        const response = await api.get('/orders', { params: { page: orderPage, limit: 10 } });
        const orderData = response.data;
        
        if (orderData && orderData.meta) {
          setOrders(orderData.data || []);
          setOrderTotalPages(orderData.meta.totalPages || 1);
          setOrderTotal(orderData.meta.total || 0);
        } else {
          setOrders(Array.isArray(orderData) ? orderData : []);
          setOrderTotalPages(1);
          setOrderTotal(Array.isArray(orderData) ? orderData.length : 0);
        }
      } else if (activeTab === 'analytics') {
        const response = await api.get('/analytics/stats');
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container animate-fade-in flex-center flex-column" style={{ minHeight: '60vh' }}>
        <div className="card text-center" style={{ padding: '3rem', maxWidth: '500px' }}>
          <XCircle size={48} color="var(--error)" className="mb-4" />
          <h2 className="mb-2">Access Denied</h2>
          <p className="mb-8">This page is restricted to administrators only.</p>
          <a href="/" className="btn btn-primary w-100">Return to Home</a>
        </div>
      </div>
    );
  }

  // Product Logic
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId || '',
        image: product.image || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', stock: '', categoryId: '', image: '' });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        categoryId: productForm.categoryId ? parseInt(productForm.categoryId) : null,
        image: productForm.image || null
      };

      if (editingProduct) {
        await api.patch(`/products/${editingProduct.id}`, payload);
        showToast(`Product "${payload.name}" updated successfully`, 'success');
      } else {
        await api.post('/products', payload);
        showToast(`Product "${payload.name}" created successfully`, 'success');
      }
      setShowProductModal(false);
      loadData(true);
    } catch (error) {
      showToast('Failed to save product. Please check console.', 'error');
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        showToast('Product deleted successfully', 'error');
        loadData(true);
      } catch (error) {
        showToast('Failed to delete product.', 'error');
      }
    }
  };

  // Category Logic
  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await api.post('/categories', { name: newCategoryName.trim() });
      showToast(`Category "${newCategoryName.trim()}" created`, 'success');
      setNewCategoryName('');
      loadData(true);
    } catch (error) {
      if (error.response?.status === 409) {
        showToast('Category already exists', 'error');
      } else {
        showToast('Failed to create category', 'error');
      }
    }
  };

  const deleteCategory = async (id, name) => {
    if (window.confirm(`Delete category "${name}"? Products in this category will become uncategorized.`)) {
      try {
        await api.delete(`/categories/${id}`);
        showToast(`Category "${name}" deleted`, 'info');
        loadData(true);
      } catch (error) {
        showToast('Failed to delete category. It may have products assigned.', 'error');
      }
    }
  };

  // Order Logic
  const handleViewOrder = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setSelectedOrder(response.data);
      setShowOrderModal(true);
    } catch (error) {
      showToast('Failed to fetch order details.', 'error');
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      await api.patch(`/orders/${id}`, { status: newStatus });
      showToast(`Order status updated to ${newStatus}`, 'success');
      loadData(true);
    } catch (error) {
      showToast('Failed to update order status.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <span className="badge badge-success flex-center gap-1"><CheckCircle size={14} /> Completed</span>;
      case 'pending': return <span className="badge badge-yellow flex-center gap-1"><Clock size={14} /> Pending</span>;
      case 'cancelled': return <span className="badge badge-error flex-center gap-1"><XCircle size={14} /> Cancelled</span>;
      case 'processing': return <span className="badge badge-blue flex-center gap-1"><Clock size={14} /> Processing</span>;
      case 'shipped': return <span className="badge badge-primary flex-center gap-1"><Package size={14} /> Shipped</span>;
      case 'delivered': return <span className="badge badge-success flex-center gap-1"><CheckCircle size={14} /> Delivered</span>;
      default: return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <>
      <div className="container animate-fade-in" style={{ position: 'relative' }}>
        <div className="admin-header mb-8">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your products and monitor system orders.</p>
          </div>
          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Package size={20} /> Products
            </button>
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ClipboardList size={20} /> Orders
            </button>
            <button
              className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart size={20} /> Analytics
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-center" style={{ minHeight: '400px' }}>
            <div className="spinner"></div>
          </div>
        ) : activeTab === 'products' ? (
          <div className="admin-content animate-fade-in" key="products">
            {/* Category Manager */}
            <div className="category-manager-section mb-4">
              <div className="flex-between mb-4">
                <div className="flex-center gap-2">
                  <Tag size={20} color="var(--accent-yellow)" />
                  <h3 style={{ margin: 0 }}>Categories ({categories.length})</h3>
                </div>
                <button
                  className="btn btn-outline btn-sm gap-1"
                  onClick={() => setShowCategoryManager(!showCategoryManager)}
                  style={{ fontSize: '0.85rem' }}
                >
                  {showCategoryManager ? 'Hide' : 'Manage'}
                </button>
              </div>
              {showCategoryManager && (
                <div className="card category-manager-card animate-fade-in">
                  <form onSubmit={addCategory} className="category-add-row">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="New category name (e.g. Electronics, Fashion...)"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn btn-primary btn-sm gap-1" disabled={!newCategoryName.trim()}>
                      <Plus size={16} /> Add
                    </button>
                  </form>
                  <div className="category-tags-wrap">
                    {categories.length === 0 ? (
                      <p className="text-muted" style={{ padding: '0.5rem 0', fontSize: '0.9rem' }}>No categories yet. Add your first category above!</p>
                    ) : categories.map(cat => (
                      <div key={cat.id} className="category-tag">
                        <span>{cat.name}</span>
                        <span className="category-tag-count">{cat._count?.products || 0}</span>
                        <button
                          className="category-tag-delete"
                          onClick={() => deleteCategory(cat.id, cat.name)}
                          title="Delete category"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-between mb-4">
              <h3>Product List ({productTotal})</h3>
              <button className="btn btn-primary btn-sm gap-2" onClick={() => handleOpenProductModal()}>
                <Plus size={18} /> New Product
              </button>
            </div>

            <div className="card admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-8">No products found.</td></tr>
                  ) : products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="table-product-info" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {product.image ? (
                              <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Package size={20} color="var(--text-muted)" />
                            )}
                          </div>
                          <div>
                            <strong>{product.name}</strong>
                            <div className="text-muted text-sm">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary text-xs">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>
                        <span className={product.stock <= 5 ? 'text-error font-bold' : ''}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="table-actions">
                          <button className="action-btn edit-btn" onClick={() => handleOpenProductModal(product)} title="Edit">
                            <Edit size={18} />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            aria-label="Delete"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={productPage}
              totalPages={productTotalPages}
              onPageChange={setProductPage}
            />
          </div>
        ) : activeTab === 'orders' ? (
          <div className="admin-content animate-fade-in" key="orders">
            <div className="mb-4">
              <h3>System Orders ({orderTotal})</h3>
            </div>

            <div className="grid-cols-1 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {orders.length === 0 ? (
                <div className="card text-center py-8 text-muted">No orders found in the system.</div>
              ) : orders.map(order => (
                <div key={order.id} className="card admin-order-card">
                  <div className="order-main-info">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div className="order-icon-bg">
                        <ClipboardList color="var(--primary-blue)" />
                      </div>
                      <div>
                        <strong>Order #{order.id}</strong>
                        <div className="text-muted text-sm">Customer: {order.user?.username || order.userId} • Total: ${order.total}</div>
                      </div>
                    </div>
                    <div className="order-status-actions">
                      {getStatusBadge(order.status)}
                      <div className="status-menu">
                        <select 
                          className="form-input text-sm py-1" 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{ width: '130px', marginRight: '1rem' }}
                          disabled={['delivered', 'cancelled'].includes(order.status)}
                        >
                          <option value={order.status} disabled>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</option>
                          {order.status === 'pending' && (
                            <>
                              <option value="processing">Processing</option>
                              <option value="cancelled">Cancelled</option>
                            </>
                          )}
                          {order.status === 'processing' && (
                            <>
                              <option value="shipped">Shipped</option>
                              <option value="cancelled">Cancelled</option>
                            </>
                          )}
                          {order.status === 'shipped' && (
                            <>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </>
                          )}
                        </select>
                        <button className="action-btn" onClick={() => handleViewOrder(order.id)} title="View Details">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="order-footer">
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    <strong style={{ fontSize: '1.1rem' }}>${order.total.toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              currentPage={orderPage}
              totalPages={orderTotalPages}
              onPageChange={setOrderPage}
            />
          </div>
        ) : (
          <div className="admin-content animate-fade-in" key="analytics">
            <div className="mb-8">
              <h3>Sales Analytics</h3>
              <p className="text-muted" style={{ marginTop: '0.25rem' }}>Real-time overview of your store performance</p>
            </div>
            
            <div className="analytics-grid">
              <div className="card stat-card stat-revenue">
                <div className="stat-icon-wrap stat-icon-revenue">
                  <span style={{ fontSize: '1.4rem' }}>💰</span>
                </div>
                <div className="stat-content">
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-value" style={{ color: '#059669' }}>${analytics?.totalRevenue?.toFixed(2)}</div>
                </div>
              </div>
              <div className="card stat-card stat-orders">
                <div className="stat-icon-wrap stat-icon-orders">
                  <span style={{ fontSize: '1.4rem' }}>📦</span>
                </div>
                <div className="stat-content">
                  <div className="stat-label">Total Orders</div>
                  <div className="stat-value">{analytics?.totalOrders}</div>
                </div>
              </div>
              <div className="card stat-card stat-customers">
                <div className="stat-icon-wrap stat-icon-customers">
                  <span style={{ fontSize: '1.4rem' }}>👥</span>
                </div>
                <div className="stat-content">
                  <div className="stat-label">Active Customers</div>
                  <div className="stat-value">{analytics?.totalUsers}</div>
                </div>
              </div>
              <div className="card stat-card stat-products">
                <div className="stat-icon-wrap stat-icon-products">
                  <span style={{ fontSize: '1.4rem' }}>🏷️</span>
                </div>
                <div className="stat-content">
                  <div className="stat-label">Total Products</div>
                  <div className="stat-value">{analytics?.totalProducts}</div>
                </div>
              </div>
            </div>

            <div className="grid-2 mt-8">
              <div className="card analytics-list-card">
                <div className="analytics-list-header">
                  <div className="analytics-list-title">
                    <TrendingUp size={20} color="var(--accent-yellow)" />
                    <h4>Trending Products</h4>
                  </div>
                  <span className="badge badge-secondary text-xs">Top {analytics?.trendingProducts?.length || 0}</span>
                </div>
                <div className="analytics-list-body">
                  {analytics?.trendingProducts?.map((product, index) => {
                    const maxSales = analytics.trendingProducts[0]?._count?.orderItems || 1;
                    const sales = product._count?.orderItems || 0;
                    const pct = Math.round((sales / maxSales) * 100);
                    return (
                      <div key={product.id} className="trending-item">
                        <div className="trending-rank">#{index + 1}</div>
                        <div className="trending-info">
                          <div className="trending-name">{product.name}</div>
                          <div className="trending-bar-track">
                            <div className="trending-bar-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                        <div className="trending-sales">{sales} <span className="text-muted text-xs">sales</span></div>
                      </div>
                    );
                  })}
                  {(!analytics?.trendingProducts || analytics.trendingProducts.length === 0) && (
                    <p className="text-muted text-center" style={{ padding: '2rem 0' }}>No sales data yet.</p>
                  )}
                </div>
              </div>
              <div className="card analytics-list-card">
                <div className="analytics-list-header">
                  <div className="analytics-list-title">
                    <Package size={20} color="var(--error)" />
                    <h4>Low Stock Alerts</h4>
                  </div>
                  <span className="badge badge-error text-xs">{analytics?.lowStockProducts?.length || 0} items</span>
                </div>
                <div className="analytics-list-body">
                  {analytics?.lowStockProducts?.map(product => {
                    const stockPct = Math.round((product.stock / 10) * 100);
                    const severity = product.stock <= 2 ? 'critical' : product.stock <= 4 ? 'warning' : 'caution';
                    return (
                      <div key={product.id} className="stock-item">
                        <div className="stock-info">
                          <div className="stock-name">{product.name}</div>
                          <div className="stock-gauge-track">
                            <div className={`stock-gauge-fill stock-${severity}`} style={{ width: `${Math.min(stockPct, 100)}%` }}></div>
                          </div>
                        </div>
                        <div className={`stock-count stock-count-${severity}`}>
                          {product.stock} left
                        </div>
                      </div>
                    );
                  })}
                  {analytics?.lowStockProducts?.length === 0 && (
                    <div className="text-center" style={{ padding: '2rem 0' }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>✅</span>
                      <p className="text-muted">All products well-stocked!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content card animate-scale-in">
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="action-btn" onClick={() => setShowProductModal(false)}><XCircle /></button>
            </div>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group mb-4">
                <label htmlFor="p-name">Product Name</label>
                <input
                  id="p-name"
                  type="text"
                  className="form-input"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="p-desc">Description</label>
                <textarea
                  id="p-desc"
                  className="form-input"
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="p-category">Category</label>
                <select
                  id="p-category"
                  className="form-input"
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group mb-4">
                <label htmlFor="p-image">Image URL</label>
                <input
                  id="p-image"
                  type="text"
                  className="form-input"
                  placeholder="https://example.com/product-image.jpg"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group mb-6" style={{ flex: 1 }}>
                  <label htmlFor="p-price">Price ($)</label>
                  <input
                    id="p-price"
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group mb-6" style={{ flex: 1 }}>
                  <label htmlFor="p-stock">Stock</label>
                  <input
                    id="p-stock"
                    type="number"
                    className="form-input"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingProduct ? 'Update Product' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && createPortal(
        <div className="modal-overlay">
          <div className="modal-content card animate-scale-in" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Order Details #{selectedOrder.id}</h2>
              <button className="action-btn" onClick={() => setShowOrderModal(false)}><XCircle /></button>
            </div>
            <div className="mb-6">
              <div className="flex-between mb-2">
                <span className="text-muted">Customer:</span>
                <strong>{selectedOrder.user?.username || 'Unknown'}</strong>
              </div>
              <div className="flex-between mb-4">
                <span className="text-muted">Date:</span>
                <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
              </div>
              <div className="mb-4">
                <label className="text-sm font-bold text-muted mb-2 block">ITEMS</label>
                <div className="order-items-mini-list">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map(item => (
                      <div key={item.id} className="flex-between py-2 border-bottom">
                        <span>{item.product?.name || 'Unknown Product'} x{item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted">No items found.</p>
                  )}
                </div>
              </div>
              <div className="flex-between" style={{ borderTop: '2px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                <strong style={{ fontSize: '1.2rem' }}>Total Amount</strong>
                <strong style={{ fontSize: '1.2rem', color: 'var(--primary-blue-dark)' }}>${selectedOrder.total.toFixed(2)}</strong>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default AdminDashboard;
