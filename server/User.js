const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nameWithInitial: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student', 'parent'],
    default: 'student'
  },
  class: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  subjects: {
    type: [String],
    required: function() {
      return this.role === 'teacher';
    }
  },
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: function() {
      return this.role === 'parent';
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);