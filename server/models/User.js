const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
  nameWithInitial: {
    type: String,
    required: true,
    trim: true, // Removes extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true, // Ensures email is always stored in lowercase
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'], // Restricts roles to predefined values
    default: 'student', // Defaults to 'student'
  },
  class: {
    type: String,
    required: function () {
      return this.role === 'student'; // Mandatory only if the role is 'student'
    },
  },
  subjects: {
    type: [String], // Array of subjects for teachers
    required: function () {
      return this.role === 'teacher'; // Only required for teachers
    },
    default: function () {
      return this.role === 'teacher' ? [] : undefined; // Default to empty array for teachers
    },
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Export the User Model
const User = mongoose.model('User', userSchema);

module.exports = User;
