import React, { createContext, useContext, useState, useEffect } from 'react';
import { io as socketIO } from 'socket.io-client';

const CanteenContext = createContext();

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 min ago';
  if (diffMins < 60) return `${diffMins} mins ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  return date.toLocaleDateString();
};

const mapBackendOrder = (order) => ({
  _id: order._id,
  id: order.orderNumber,
  studentName: order.studentName,
  rollNumber: order.studentRoll,
  items: (order.items || []).map(item => ({
    id: item.menuItemId || item._id,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  })),
  total: order.totalAmount,
  status: order.status,
  time: formatRelativeTime(order.createdAt),
  timestamp: new Date(order.createdAt).getTime()
});

export const CanteenProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState('student'); // student, cashier, kitchen, admin
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [token, setToken] = useState(sessionStorage.getItem('smartcanteen_token') || '');
  const [notificationStats, setNotificationStats] = useState({ sentToday: 0, failedToday: 0 });
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [topItems, setTopItems] = useState([]);

  const [userId, setUserId] = useState('');
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAdminAnalytics = async () => {
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      if (!savedToken) return;

      const res = await fetch('http://localhost:5001/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setAdminAnalytics(data.analytics);
        setTopItems(data.topItems);
      }
    } catch (err) {
      console.warn('Failed to fetch admin analytics:', err.message);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      if (!savedToken) return;

      const res = await fetch('http://localhost:5001/api/notifications/admin/stats', {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setNotificationStats({
          sentToday: data.sentCount,
          failedToday: data.failedCount
        });
      }
    } catch (err) {
      console.warn('Failed to fetch notification stats:', err.message);
    }
  };

  // 1. Fetch Student Profile on boot if JWT exists
  useEffect(() => {
    const fetchProfile = async () => {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      if (!savedToken) {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setUserId('');
        return;
      }

      try {
        const res = await fetch('http://localhost:5001/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.profile.student || data.profile.user);
          setIsLoggedIn(true);
          const userObj = data.profile.user;
          if (userObj && userObj.role) {
            setActiveRole(userObj.role);
            setUserId(userObj._id);
          }
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Backend server offline, falling back to offline simulation.');
      }
    };
    fetchProfile();
  }, [token]);

  // 2. Fetch Menu Items (MongoDB real database integration)
  const fetchMenu = async () => {
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const endpoint = activeRole === 'admin' 
        ? 'http://localhost:5001/api/menu/admin' 
        : 'http://localhost:5001/api/menu/student';
      
      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${savedToken || token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        // Map _id to id so frontend items continue to render cleanly
        const mapped = data.menu.map(item => ({
          ...item,
          id: item._id
        }));
        setMenuItems(mapped);
      }
    } catch (err) {
      console.warn('Backend offline, menu listing falls back to default values.');
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [isLoggedIn, activeRole, token]);

  // 3. Dynamic Simulator Auto-Login (Acquires correct JWT token immediately)
  const changeRole = async (role) => {
    setActiveRole(role);
    
    try {
      let username = '';
      if (role === 'student') username = '22bd1a0501';
      else if (role === 'cashier') username = 'cashier1';
      else if (role === 'kitchen') username = 'kitchen1';
      else if (role === 'admin') username = 'admin1';

      if (username) {
        const res = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password: 'password123' })
        });
        const data = await res.json();
        if (data.success) {
          sessionStorage.setItem('smartcanteen_token', data.token);
          setToken(data.token);
          setUserId(data.user.id);
          if (role === 'student') {
            setCurrentUser(data.user.profile || data.user);
            setIsLoggedIn(true);
          } else {
            setCurrentUser(null);
            setIsLoggedIn(true);
          }
        }
      }
    } catch (err) {
      console.error('Simulator background auth check failed:', err);
    }
  };

  // 4. Unified Authentication APIs
  const login = async (username, password) => {
    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.toLowerCase().trim(), password })
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('smartcanteen_token', data.token);
        setToken(data.token);
        setActiveRole(data.user.role);
        setUserId(data.user.id);
        setCurrentUser(data.user.profile || data.user);
        setIsLoggedIn(true);
        return { success: true, role: data.user.role };
      } else {
        return { success: false, message: data.message || 'Invalid credentials' };
      }
    } catch (err) {
      console.error('Login request failed:', err);
      return { success: false, message: 'Could not connect to authentication server' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('smartcanteen_token');
    setToken('');
    setIsLoggedIn(false);
    setUserId('');
    setCurrentUser(null);
    setCart([]);
    setInAppNotifications([]);
    setUnreadCount(0);
    setActiveRole('student');
    window.history.pushState(null, '', '/');
  };

  // Backwards compatibility mappings for existing page calls
  const loginStudent = login;
  const logoutStudent = logout;

  const fetchInAppNotifications = async () => {
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      if (!savedToken) return;

      const res = await fetch('http://localhost:5001/api/notifications', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setInAppNotifications(data.notifications);
        const unread = data.notifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.warn('Failed to fetch in-app notifications:', err.message);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      if (!savedToken) return;

      const res = await fetch(`http://localhost:5001/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${savedToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setInAppNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn('Failed to mark notification as read:', err.message);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      if (!savedToken) return;

      const res = await fetch('http://localhost:5001/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${savedToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setInAppNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.warn('Failed to clear notifications:', err.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeRole === 'student') {
      fetchInAppNotifications();
    }
  }, [isLoggedIn, activeRole, token]);

  // 5. Cart operations
  const addToCart = (item, quantity) => {
    setCart(prevCart => {
      const existing = prevCart.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity }];
    });
  };

  const updateCartQty = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(cartItem =>
        cartItem.id === itemId ? { ...cartItem, quantity } : cartItem
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // 6. Fetch Orders (Dynamic role based lookup)
  const fetchOrders = async () => {
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      if (!savedToken) return;

      let endpoint = '';
      if (activeRole === 'student') {
        endpoint = 'http://localhost:5001/api/orders/student';
      } else if (activeRole === 'cashier') {
        const [pendingRes, recentRes] = await Promise.all([
          fetch('http://localhost:5001/api/orders/cashier/pending', {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          }),
          fetch('http://localhost:5001/api/orders/cashier/recent', {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          })
        ]);
        
        const pendingData = await pendingRes.json();
        const recentData = await recentRes.json();
        
        const mergedOrders = [];
        const seenIds = new Set();
        
        if (pendingData.success) {
          pendingData.orders.forEach(o => {
            if (!seenIds.has(o._id)) {
              seenIds.add(o._id);
              mergedOrders.push(mapBackendOrder(o));
            }
          });
        }
        
        if (recentData.success) {
          recentData.orders.forEach(o => {
            if (!seenIds.has(o._id)) {
              seenIds.add(o._id);
              mergedOrders.push(mapBackendOrder(o));
            }
          });
        }
        
        mergedOrders.sort((a, b) => b.timestamp - a.timestamp);
        setOrders(mergedOrders);
        return;
      } else if (activeRole === 'kitchen') {
        endpoint = 'http://localhost:5001/api/orders/kitchen';
      } else {
        return;
      }

      if (endpoint) {
        const res = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        const data = await res.json();
        if (data.success) {
          const mapped = data.orders.map(mapBackendOrder);
          setOrders(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch orders:', err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    if (activeRole === 'admin') {
      fetchNotificationStats();
      fetchAdminAnalytics();
    }
  }, [token, activeRole, isLoggedIn]);

  // 7. Socket.IO connection and updates handler
  useEffect(() => {
    const savedToken = sessionStorage.getItem('smartcanteen_token');
    if (!savedToken) return;

    const socket = socketIO('http://localhost:5001');

    socket.on('connect', () => {
      console.log('Live Simulator Client Socket Connected');
      if (userId) {
        socket.emit('join_room', userId);
      }
    });

    const handleOrderEvent = () => {
      fetchOrders();
      if (activeRole === 'admin') {
        fetchNotificationStats();
        fetchAdminAnalytics();
      }
    };

    socket.on('order_created', handleOrderEvent);
    socket.on('order_paid', handleOrderEvent);
    socket.on('order_ready', handleOrderEvent);
    socket.on('order_delivered', handleOrderEvent);

    socket.on('inapp_notification', (notification) => {
      setInAppNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, activeRole, userId]);

  // 8. Order Placement & State Mutations
  const placeOrder = async (paymentMethod, paymentDetails = {}) => {
    if (cart.length === 0) return null;

    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const bodyItems = cart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity
      }));

      const res = await fetch('http://localhost:5001/api/orders/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({ 
          items: bodyItems, 
          paymentMethod,
          paymentId: paymentDetails.paymentId,
          razorpayOrderId: paymentDetails.razorpayOrderId,
          razorpaySignature: paymentDetails.razorpaySignature
        })
      });

      const data = await res.json();
      if (data.success) {
        clearCart();
        const newOrder = mapBackendOrder(data.order);
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
      } else {
        console.error('Failed to place order:', data.message);
        return null;
      }
    } catch (err) {
      console.error('Error placing order:', err);
      return null;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const localOrder = orders.find(o => o.id === orderId || o._id === orderId);
    const dbId = localOrder ? localOrder._id : orderId;

    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      let endpoint = '';
      
      if (status === 'PAID') {
        endpoint = `http://localhost:5001/api/orders/cashier/${dbId}/mark-paid`;
      } else if (status === 'READY') {
        endpoint = `http://localhost:5001/api/orders/kitchen/${dbId}/ready`;
      } else if (status === 'DELIVERED') {
        endpoint = `http://localhost:5001/api/orders/kitchen/${dbId}/delivered`;
      }

      if (endpoint) {
        const res = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(prev =>
            prev.map(o => (o._id === dbId ? { ...o, status } : o))
          );
        }
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const lookupStudent = async (searchVal) => {
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const res = await fetch(`http://localhost:5001/api/orders/cashier/student/search?query=${encodeURIComponent(searchVal)}`, {
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        return data.student;
      }
      return null;
    } catch (err) {
      console.error('Error searching student:', err);
      return null;
    }
  };

  const createCashierOrder = async (studentInfo, cashierCart) => {
    if (cashierCart.length === 0) return null;

    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const bodyItems = cashierCart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity
      }));

      const res = await fetch('http://localhost:5001/api/orders/cashier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({
          studentRoll: studentInfo?.rollNumber || 'WALKIN',
          items: bodyItems
        })
      });

      const data = await res.json();
      if (data.success) {
        const newOrder = mapBackendOrder(data.order);
        setOrders(prev => [newOrder, ...prev]);
        return newOrder.id;
      } else {
        console.error('Failed to register cashier order:', data.message);
        return null;
      }
    } catch (err) {
      console.error('Error registering cashier order:', err);
      return null;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      if (!savedToken) return { success: false, message: 'Authorization token not found' };

      const res = await fetch('http://localhost:5001/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.student);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Failed to update profile' };
      }
    } catch (err) {
      console.error('Profile update failed:', err);
      return { success: false, message: 'Server connection error' };
    }
  };

  // 9. Admin Menu CRUD Database Actions (REST fetch queries)
  const addMenuItem = async (item) => {
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const res = await fetch('http://localhost:5001/api/menu/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify(item)
      });
      const data = await res.json();
      if (data.success) {
        // Map _id to id
        const mappedItem = { ...data.item, id: data.item._id };
        setMenuItems(prev => [...prev, mappedItem]);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Menu addition failed:', err);
      return { success: false, message: 'Server connection error' };
    }
  };

  const updateMenuItem = async (updatedItem) => {
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const res = await fetch(`http://localhost:5001/api/menu/admin/${updatedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify(updatedItem)
      });
      const data = await res.json();
      if (data.success) {
        const mappedItem = { ...data.item, id: data.item._id };
        setMenuItems(prev =>
          prev.map(i => (i.id === updatedItem.id ? mappedItem : i))
        );
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Menu edit failed:', err);
      return { success: false, message: 'Server connection error' };
    }
  };

  const deleteMenuItem = async (itemId) => {
    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const res = await fetch(`http://localhost:5001/api/menu/admin/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${savedToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMenuItems(prev => prev.filter(i => i.id !== itemId));
        setCart(prev => prev.filter(i => i.id !== itemId));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Menu deletion failed:', err);
      return { success: false, message: 'Server connection error' };
    }
  };

  const toggleItemAvailability = async (itemId) => {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    try {
      const savedToken = sessionStorage.getItem('smartcanteen_token');
      const res = await fetch(`http://localhost:5001/api/menu/admin/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken}`
        },
        body: JSON.stringify({ available: !item.available })
      });
      const data = await res.json();
      if (data.success) {
        const mappedItem = { ...data.item, id: data.item._id };
        setMenuItems(prev =>
          prev.map(i => (i.id === itemId ? mappedItem : i))
        );
      }
    } catch (err) {
      console.error('Stock toggle failed:', err);
    }
  };

  return (
    <CanteenContext.Provider
      value={{
        activeRole,
        changeRole,
        currentUser,
        isLoggedIn,
        loginStudent,
        logoutStudent,
        menuItems,
        orders,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        placeOrder,
        updateOrderStatus,
        lookupStudent,
        createCashierOrder,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        notificationStats,
        fetchNotificationStats,
        updateProfile,
        login,
        logout,
        adminAnalytics,
        topItems,
        fetchAdminAnalytics,
        userId,
        inAppNotifications,
        unreadCount,
        fetchInAppNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
};

export const useCanteen = () => {
  const context = useContext(CanteenContext);
  if (!context) {
    throw new Error('useCanteen must be used within a CanteenProvider');
  }
  return context;
};
