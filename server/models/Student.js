const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  nameWithInitial: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  class: {
    type: String,
    required: true
  },
  // Reference to the User model for authentication
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', StudentSchema);