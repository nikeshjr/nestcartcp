import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Lazy-loaded pages for code splitting
const Home = React.lazy(() => import('./pages/Home'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));

const PageLoader = () => (
  <div className="flex-center" style={{ minHeight: '60vh' }}>
    <div className="spinner"></div>
  </div>
);

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
        <Router>
          <div className="app-wrapper">
            <Navbar />
            <main className="main-content">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  {/* Fallback for undefined routes */}
                  <Route path="*" element={
                    <div className="container flex-center flex-column" style={{ minHeight: '50vh' }}>
                      <h1>404</h1>
                      <p className="mb-4">Page not found</p>
                      <a href="/" className="btn btn-primary">Return Home</a>
                    </div>
                  } />
                </Routes>
              </Suspense>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
    </NotificationProvider>
  );
}

export default App;

