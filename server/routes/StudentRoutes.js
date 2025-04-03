const express = require('express');
const router = express.Router();
const { getAllStudents } = require('../controllers/Studentcontroller');

// Get all students with optional class filter
// This is the endpoint needed for loading students in the dropdown
router.get('/api/students', getAllStudents);

// Comment out other routes that might be causing issues
// If you need these routes later, make sure the controller functions exist first

// // Get student by ID
// router.get('/api/students/:id', getStudentById);

// // Create new student
// router.post('/api/students', createStudent);

// // Update student
// router.put('/api/students/:id', updateStudent);

// // Delete student
// router.delete('/api/students/:id', deleteStudent);

module.exports = router;