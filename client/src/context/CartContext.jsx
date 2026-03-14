import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load initial cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  // Fetch cart from backend when user logs in
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const response = await api.get('/cart');
          // Map backend CartItem to frontend structure
          const items = response.data.map(item => ({
            id: item.id,
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
          }));
          setCartItems(items);
          localStorage.setItem('cart', JSON.stringify(items));
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        }
      }
    };

    if (!loading) {
      fetchCart();
    }
  }, [user, loading]);

  // Handle logout: Clear cart
  useEffect(() => {
    if (!user && !loading) {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  }, [user, loading]);

  // Persist cart items to localStorage whenever they change
  useEffect(() => {
    if (cartItems.length > 0 || !user) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // Add item to cart, increasing quantity if it already exists
  const addToCart = async (product) => {
    if (user) {
      try {
        await api.post('/cart', { productId: product.id, quantity: 1 });
        // Re-fetch cart to stay in sync
        const response = await api.get('/cart');
        const items = response.data.map(item => ({
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }));
        setCartItems(items);
        showToast(`Added ${product.name} to cart`, 'success');
      } catch (error) {
        console.error('Failed to add to cart:', error);
        showToast('Failed to add to cart', 'error');
      }
    } else {
      showToast('I can\'t add cart before login. Please login first.', 'warning');
    }
  };

  const removeFromCart = async (cartItemId, productId) => {
    if (user) {
      try {
        await api.delete(`/cart/${productId}`);
        setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
      } catch (error) {
        console.error('Failed to remove from cart:', error);
      }
    } else {
      setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
    }
  };

  const updateQuantity = async (cartItemId, productId, amount) => {
    if (user) {
      try {
        // Find current quantity
        const item = cartItems.find(i => i.productId === productId);
        if (item) {
          const newQuantity = item.quantity + amount;
          if (newQuantity < 1) return;
          
          await api.post('/cart', { productId, quantity: amount });
          setCartItems(prevItems => 
            prevItems.map(i => {
              if (i.productId === productId) {
                return { ...i, quantity: newQuantity };
              }
              return i;
            })
          );
        }
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    } else {
      setCartItems(prevItems => 
        prevItems.map(item => {
          if (item.id === cartItemId) {
            const newQuantity = Math.max(1, item.quantity + amount);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart');
        setCartItems([]);
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    } else {
      setCartItems([]);
    }
  };

  const checkout = async () => {
    try {
      const payload = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };
      
      await api.post('/orders', payload);
      await clearCart();
      return true;
    } catch (error) {
      console.error('Checkout failed:', error);
      throw error;
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      checkout,
      cartTotal, 
      itemCount,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};

