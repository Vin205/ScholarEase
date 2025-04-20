const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
  phoneNo: { type: String, required: true },
});

// Hash password before saving
FacultySchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare passwords
FacultySchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Faculty', FacultySchema);
