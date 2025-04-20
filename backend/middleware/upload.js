const multer = require('multer');
const { Readable } = require('stream');

// Configure memory storage
const memoryStorage = multer.memoryStorage();

// Create multer instance
const upload = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = { upload };