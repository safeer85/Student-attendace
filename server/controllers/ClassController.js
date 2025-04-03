const Student = require('../models/Student');
const User = require('../models/User');

// Get all unique classes
exports.getAllClasses = async (req, res) => {
  try {
    // Find all unique class names from student records
    const classes = await Student.distinct('class');
    res.status(200).json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};

// Get students by class
exports.getStudentsByClass = async (req, res) => {
  try {
    const { className } = req.params;
    
    const students = await Student.find({ class: className });
    
    res.status(200).json({ students });
  } catch (error) {
    console.error('Error fetching students by class:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Create a new class (this just adds class to the system, actual implementation depends on your requirements)
exports.createClass = async (req, res) => {
  try {
    const { className } = req.body;
    
    // Check if class already exists
    const existingClass = await Student.findOne({ class: className });
    if (existingClass) {
      return res.status(400).json({ error: 'Class already exists' });
    }
    
    // Since we don't have a separate Class model, we'll just return success
    // In a real system, you might want to create an actual Class model
    res.status(201).json({ message: 'Class created successfully', className });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
};

// Get teachers for a class (based on subject teachers)
exports.getTeachersForClass = async (req, res) => {
  try {
    const { className } = req.params;
    
    // Find teachers who teach in this class
    const teachers = await User.find({ 
      role: 'teacher',
      // In a real application, you might have a more complex relationship between
      // teachers and classes, possibly through subjects or a direct relationship
    });
    
    res.status(200).json({ teachers });
  } catch (error) {
    console.error('Error fetching teachers for class:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};