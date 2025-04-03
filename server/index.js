const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow requests from your React frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost', 'http://13.60.17.251:3000'],
    credentials: true
  }));

// Parse request bodies
app.use(bodyParser.json());

// Import routes
const userRoutes = require('./routes/UserRoutes');
const classRoutes = require('./routes/ClassRoutes');
const studentRoutes = require('./routes/StudentRoutes');
const attendanceRoutes = require('./routes/AttendanceRoutes');

// Use routes
app.use('/', userRoutes);
app.use('/', classRoutes);
app.use('/', studentRoutes);
app.use('/', attendanceRoutes);

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI ;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.error('MongoDB Connection Error:', err));

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/`);
  });