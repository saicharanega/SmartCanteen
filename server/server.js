const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const studentRoutes = require('./routes/studentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment configurations
dotenv.config();

// Refuse startup if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
  console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: JWT_SECRET environment variable is missing!');
  console.error('\x1b[31m%s\x1b[0m', 'The server cannot start without a secure secret key.');
  process.exit(1);
}

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with permissive CORS for development
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Expose Socket.io instance to request pipeline
app.set('io', io);

// Socket.io connection setup
io.on('connection', (socket) => {
  console.log(`Live Simulator Client Connected: ${socket.id}`);
  
  socket.on('join_room', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`Socket ${socket.id} joined room for user: ${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Live Simulator Client Disconnected: ${socket.id}`);
  });
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'SmartCanteen Core REST + Socket API Server is active and running',
    version: '1.0.0',
    time: new Date()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Unhandled Server Error: ${err.message}`);
  res.status(500).json({ 
    message: 'Something went wrong on the server', 
    error: err.message 
  });
});

const PORT = process.env.PORT || 5001;

// Use server.listen instead of app.listen to enable socket integrations
server.listen(PORT, () => {
  console.log(`SmartCanteen Backend Server running on port ${PORT}`);
});
