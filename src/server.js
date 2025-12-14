// server/src/server.js (Modified for Vercel)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 

// ... routes imports ...

const app = express();

// Database Connection (Vercel ENV vars will be injected here)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json()); 
// Allow frontend origin (will be set to GitHub Pages URL later)
app.use(cors({ origin: '*' })); 

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes); 

app.get('/', (req, res) => {
  res.send('Transport Billing API is running (Vercel).');
});

// We no longer call app.listen() here!
module.exports = app;
