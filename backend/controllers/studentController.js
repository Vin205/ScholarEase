const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

// Student Signup
exports.signup = async (req, res) => {
  try {
    const requiredFields = ['name', 'email', 'password', 'phoneNo', 'className', 'div', 'rollNo', 'department'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    const existingStudent = await Student.findOne({ email: req.body.email });
    if (existingStudent) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const student = new Student(req.body);
    await student.save();
    
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret not configured');
    }

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { 
      expiresIn: '1h' 
    });
    
    res.status(201).json({ 
      token, 
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        phoneNo: student.phoneNo,
        className: student.className,
        div: student.div,
        rollNo: student.rollNo,
        department: student.department
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Student Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret not configured');
    }

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({ 
      token, 
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        phoneNo: student.phoneNo,
        className: student.className,
        div: student.div,
        rollNo: student.rollNo,
        department: student.department,
        status: student.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Submit Application with Drive Links
exports.submitApplication = async (req, res) => {
  try {
    const { studentId, name, department, year, applicationLink, incomeCertificateLink } = req.body;
    
    // Validate all required fields
    if (!studentId || !name || !department || !year || !applicationLink || !incomeCertificateLink) {
      return res.status(400).json({ 
        error: 'All fields are required (name, department, year, applicationLink, incomeCertificateLink)' 
      });
    }

    // Basic validation for Google Drive links
    if (!applicationLink.includes('drive.google.com') || !incomeCertificateLink.includes('drive.google.com')) {
      return res.status(400).json({ 
        error: 'Please provide valid Google Drive shareable links for both documents' 
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const newApplication = {
      name,
      department,
      year,
      applicationLink,
      incomeCertificateLink,
      status: 'Pending',
      submittedAt: new Date()
    };

    // Add the new application to the student's applications array
    student.applications.push(newApplication);
    await student.save();

    res.status(201).json({ 
      message: 'Application submitted successfully',
      application: {
        _id: student.applications[student.applications.length - 1]._id,
        studentId: student._id,
        studentName: student.name,
        ...newApplication
      }
    });
  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to submit application' 
    });
  }
};

// Get All Applications (for faculty)
// In studentController.js
exports.getApplications = async (req, res) => {
  try {
    // Find all students who have applications and populate necessary fields
    const students = await Student.find({ 'applications.0': { $exists: true } })
      .select('name email applications department className div rollNo')
      .lean();

    // Process applications with student info
    const applications = students.flatMap(student => 
      student.applications.map(app => ({
        _id: app._id,
        studentId: student._id,
        studentName: student.name,
        studentEmail: student.email,
        studentDepartment: student.department,
        studentClass: student.className,
        studentDiv: student.div,
        studentRollNo: student.rollNo,
        name: app.name,
        department: app.department,
        year: app.year,
        applicationLink: app.applicationLink,
        incomeCertificateLink: app.incomeCertificateLink,
        status: app.status,
        remarks: app.remarks || '',
        submittedAt: app.submittedAt,
        updatedAt: app.updatedAt || app.submittedAt // Fallback to submittedAt if no update
      }))
    ).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    res.status(200).json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch applications' 
    });
  }
};

// Get Student's Own Applications
// controllers/studentController.js
exports.getStudentApplications = async (req, res) => {
  try {
    // Add validation for req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized - User not authenticated' });
    }

    const student = await Student.findById(req.user.id)
      .select('applications name email department className div rollNo');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const applications = student.applications.map(app => ({
      _id: app._id,
      name: app.name,
      department: app.department,
      year: app.year,
      applicationLink: app.applicationLink,
      incomeCertificateLink: app.incomeCertificateLink,
      status: app.status || 'Pending',
      remarks: app.remarks || '',
      submittedAt: app.submittedAt,
      updatedAt: app.updatedAt || app.submittedAt
    })).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    res.status(200).json({
      success: true,
      studentName: student.name,
      studentEmail: student.email,
      studentDepartment: student.department,
      studentClass: student.className,
      studentDiv: student.div,
      studentRollNo: student.rollNo,
      applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch applications',
      details: error.message 
    });
  }
};
// Update Application Status (approve/reject)


// Get Single Application (for faculty view)
exports.getApplicationById = async (req, res) => {
  try {
    const { studentId, applicationId } = req.params;

    const student = await Student.findOne({
      _id: studentId,
      'applications._id': applicationId
    }).select('name email applications.$');

    if (!student || !student.applications.length) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = student.applications[0];
    
    res.status(200).json({
      _id: application._id,
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      name: application.name,
      department: application.department,
      year: application.year,
      applicationLink: application.applicationLink,
      incomeCertificateLink: application.incomeCertificateLink,
      status: application.status,
      remarks: application.remarks || '',
      submittedAt: application.submittedAt,
      updatedAt: application.updatedAt
    });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch application' 
    });
  }
};

// Get Single Application for Student (their own application)
// Update the getStudentApplications function in studentController.js
exports.getStudentApplications = async (req, res) => {
  try {
    const studentId = req.userId;// From auth middleware
    
    const student = await Student.findById(studentId)
      .select('applications name email department className div rollNo');
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Format applications with status and remarks
    const applications = student.applications.map(app => ({
      _id: app._id,
      name: app.name,
      department: app.department,
      year: app.year,
      applicationLink: app.applicationLink,
      incomeCertificateLink: app.incomeCertificateLink,
      status: app.status,
      remarks: app.remarks || '',
      submittedAt: app.submittedAt,
      updatedAt: app.updatedAt || app.submittedAt // Fallback to submittedAt if no update
    })).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    res.status(200).json({
      studentName: student.name,
      studentEmail: student.email,
      studentDepartment: student.department,
      studentClass: student.className,
      studentDiv: student.div,
      studentRollNo: student.rollNo,
      applications
    });
  } catch (error) {
    console.error('Get student applications error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get applications' 
    });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { studentId, applicationId } = req.params;
    const { status, remarks } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid status is required (Pending, Approved, Rejected)' 
      });
    }
    
    // Validate remarks for rejection
    if (status === 'Rejected' && !remarks) {
      return res.status(400).json({ 
        success: false,
        error: 'Remarks are required when rejecting an application' 
      });
    }

    // Find and update the application
    const student = await Student.findOneAndUpdate(
      { 
        _id: studentId, 
        'applications._id': applicationId 
      },
      {
        $set: {
          'applications.$.status': status,
          'applications.$.remarks': remarks || '',
          'applications.$.updatedAt': new Date()
        }
      },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ 
        success: false,
        error: 'Student or application not found' 
      });
    }

    // Find the updated application
    const updatedApp = student.applications.id(applicationId);

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      application: {
        _id: updatedApp._id,
        studentId: student._id,
        studentName: student.name,
        status: updatedApp.status,
        remarks: updatedApp.remarks,
        submittedAt: updatedApp.submittedAt,
        updatedAt: updatedApp.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update application status',
      details: error.message 
    });
  }
};

// Add this to your studentController.js
exports.getStudentApplicationById = async (req, res) => {
  try {
    const studentId = req.user.id;
    const applicationId = req.params.applicationId;

    const student = await Student.findOne({
      _id: studentId,
      'applications._id': applicationId
    });

    if (!student) {
      return res.status(404).json({ error: 'Student or application not found' });
    }

    const application = student.applications.id(applicationId);
    
    res.status(200).json({
      _id: application._id,
      name: application.name,
      department: application.department,
      year: application.year,
      applicationLink: application.applicationLink,
      incomeCertificateLink: application.incomeCertificateLink,
      status: application.status,
      remarks: application.remarks || '',
      submittedAt: application.submittedAt,
      updatedAt: application.updatedAt || application.submittedAt
    });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch application' 
    });
  }
};