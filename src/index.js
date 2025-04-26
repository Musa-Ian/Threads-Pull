require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

// Initialize express
const app = express();
const PORT = process.env.PORT || 3000;

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Request logging

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    error: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// API routes
app.use('/api', routes);

// Base route
app.get('/', (req, res) => {
  res.json({
    name: 'ThreadsPull API',
    description: 'API service to extract media links from Threads posts',
    version: '1.0.0',
    documentation: '/docs',
  });
});

// Documentation route
app.get('/docs', (req, res) => {
  res.redirect('https://github.com/your-username/ThreadsPull#api-documentation');
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes 