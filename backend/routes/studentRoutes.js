const express = require('express');
const studentController = require('../controllers/studentController');
const { auth } = require('../middleware');

const router = express.Router();

// Public routes
router.post('/signup', studentController.signup);
router.post('/login', studentController.login);

// Protected student routes
router.post('/submit', auth, studentController.submitApplication);
router.get('/my-applications', auth, studentController.getStudentApplications);
router.get('/my-applications/:applicationId', auth, studentController.getStudentApplicationById);

// Faculty-only routes
router.get('/applications', auth, studentController.getApplications);
router.get('/applications/:studentId/:applicationId', auth, studentController.getApplicationById);
router.put('/update/:studentId/:applicationId', auth, studentController.updateApplicationStatus);

module.exports = router;