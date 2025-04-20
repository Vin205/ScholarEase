// middleware/index.js
const auth = require('./auth');
const { upload, uploadToCloudinary } = require('./upload');

module.exports = {
  auth,
  upload,
  uploadToCloudinary
};