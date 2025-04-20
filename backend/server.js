require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Cloudinary Configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Middleware
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));

// PDF Proxy Endpoint (optional)
app.get('/api/pdf-proxy', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL parameter is required' });

    if (!url.includes(process.env.CLOUDINARY_CLOUD_NAME)) {
      return res.status(403).json({ error: 'Unauthorized PDF access' });
    }

    const pdfUrl = cloudinary.url(url, {
      resource_type: 'raw',
      secure: true,
      sign_url: true // Enable for private files
    });
    
    res.redirect(pdfUrl);
  } catch (error) {
    console.error('PDF proxy error:', error);
    res.status(500).json({ error: 'Failed to retrieve PDF' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    cloudinary: cloudinary.config().cloud_name ? 'Configured' : 'Not Configured',
    upload: typeof multer === 'function' ? 'Ready' : 'Not Ready'
  });
});

// Multer Error Handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(413).json({ 
      error: 'File upload error',
      message: err.code === 'LIMIT_FILE_SIZE' ? 
        'File too large (max 5MB)' : 
        err.message 
    });
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Cloudinary configured for: ${cloudinary.config().cloud_name}`);
  console.log(`Upload limit: 5MB per file`);
});