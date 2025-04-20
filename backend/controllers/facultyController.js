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