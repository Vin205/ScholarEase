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

// Submit Application
exports.submitApplication = async (req, res) => {
  try {
    const { name, department, year, applicationLink, incomeCertificateLink } = req.body;
    
    if (!name || !department || !year || !applicationLink || !incomeCertificateLink) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.applications.push({
      scholarshipName: `${name}'s Scholarship Application`,
      applicationLink,
      incomeCertificateLink,
      status: 'Pending'
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

// Get All Applications (for faculty)
exports.getApplications = async (req, res) => {
  try {
    const students = await Student.find({ 'applications.0': { $exists: true } })
      .select('name email applications department className div rollNo')
      .lean();

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
        scholarshipName: app.scholarshipName,
        applicationLink: app.applicationLink,
        incomeCertificateLink: app.incomeCertificateLink,
        status: app.status,
        remarks: app.remarks || '',
        submittedAt: app.submittedAt,
        updatedAt: app.updatedAt || app.submittedAt
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
exports.getStudentApplications = async (req, res) => {
  try {
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
      scholarshipName: app.scholarshipName,
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
      scholarshipName: application.scholarshipName,
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

// Update Application Status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { studentId, applicationId } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid status is required (Pending, Approved, Rejected)' 
      });
    }
    
    if (status === 'Rejected' && !remarks) {
      return res.status(400).json({ 
        success: false,
        error: 'Remarks are required when rejecting an application' 
      });
    }

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

// Get Single Application for Student
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
      scholarshipName: application.scholarshipName,
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