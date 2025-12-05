const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const soilRoutes = require('./routes/soil');
const recommendationRoutes = require('./routes/recommendations');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware with relaxed CSP for local development
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());

// Rate limiting for API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// API routes
app.use('/api/soil', soilRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GrowNEX API is running' });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🌱 GrowNEX server running at http://localhost:${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}/`);
  console.log(`   Admin:    http://localhost:${PORT}/admin.html`);
  console.log(`   API:      http://localhost:${PORT}/api/`);
});
