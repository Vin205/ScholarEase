const Faculty = require('../models/Faculty');
const jwt = require('jsonwebtoken');

// Faculty Signup

exports.signup = async (req, res) => {
  const { name, password, phoneNo } = req.body;

  if (!name || !password || !phoneNo) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingFaculty = await Faculty.findOne({ name });
    if (existingFaculty) {
      return res.status(400).json({ message: 'Faculty already exists' });
    }

    const faculty = new Faculty({ name, password, phoneNo });
    await faculty.save();

    const token = jwt.sign({ id: faculty._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ 
      token, 
      faculty: { 
        id: faculty._id, 
        name: faculty.name,
        phoneNo: faculty.phoneNo
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

exports.login = async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: 'Name and password are required' });
  }

  try {
    const faculty = await Faculty.findOne({ name });
    if (!faculty) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await faculty.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: faculty._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ 
      token, 
      faculty: { 
        id: faculty._id, 
        name: faculty.name,
        phoneNo: faculty.phoneNo
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const students = await Student.find({ 'applications.0': { $exists: true } })
      .select('name email applications department className div rollNo');

    const applications = students.flatMap(student => 
      student.applications.map(app => ({
        _id: app._id,
        studentId: student._id,
        studentName: student.name,
        scholarshipName: app.scholarshipName,
        status: app.status,
        remarks: app.remarks || '',
        submittedAt: app.submittedAt,
        updatedAt: app.updatedAt
      }))
    ).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { studentId, applicationId } = req.params;
    const { status, remarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (status === 'Rejected' && !remarks) {
      return res.status(400).json({ error: 'Remarks required for rejection' });
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
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json({
      success: true,
      application: student.applications.id(applicationId)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};