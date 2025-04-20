const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  applicationLink: { type: String, required: true },
  incomeCertificateLink: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  remarks: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
});


const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNo: { type: String, required: true },
  className: { type: String, required: true },
  div: { type: String, required: true },
  rollNo: { type: String, required: true },
  department: { type: String, required: true },
  password: { type: String, required: true },
  applications: [ApplicationSchema]
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

// Password hashing
StudentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison
StudentSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', StudentSchema);