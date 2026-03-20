import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const { showToast } = useNotification();

  useEffect(() => {
    const socketUrl = 'https://nestcartcp.onrender.com';
    // const socketUrl = 'http://localhost:8081';
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
      if (user) {
        newSocket.emit('join', user.id);
      }
    });

    // Listen for order status updates
    newSocket.on('orderStatusUpdated', (data) => {
      console.log('Received orderStatusUpdated:', data);
      showToast(data.message, 'info');
    });

    // Listen for new orders (Admin only)
    newSocket.on('newOrder', (order) => {
      console.log('Received newOrder:', order);
      if (user?.role === 'admin') {
        showToast(`New order placed by ${order.user?.username || 'Customer'}!`, 'success');
      }
    });

    // Listen for stock updates
    newSocket.on('stockUpdated', (data) => {
      console.log('Received stockUpdated:', data);
    });

    return () => newSocket.close();
  }, [user, showToast]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
