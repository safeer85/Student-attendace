// ClassController.js
// This controller doesn't require a separate Class model
// It uses the existing User and Student models to find class information

const User = require('../models/User.js');
const Student = require('../models/Student.js');

// Get all unique classes (get distinct class values from both User and Student models)
exports.getAllClasses = async (req, res) => {
  try {
    // For testing, use hardcoded classes
    // In production, you'll want to uncomment the MongoDB queries below
    
    // Using hardcoded classes for now
    const classes = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
    
    /* 
    // Uncomment this to use real data from your database
    // Find all unique class names from student records in User model
    const classesFromUsers = await User.distinct('class', { role: 'student' });
    
    // Find all unique class names from Student model (if it exists)
    let classesFromStudents = [];
    try {
      classesFromStudents = await Student.distinct('class');
    } catch (err) {
      // If Student model doesn't exist or has no class field, just continue
      console.log('Note: Student model might not exist or has no data yet');
    }
    
    // Combine and remove duplicates
    const allClasses = [...new Set([...classesFromUsers, ...classesFromStudents])];
    */
    
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
    
    // For testing we'll return mock students
    // In production, you'll want to use the actual database queries
    
    // Mock student data based on class
    let students = [];
    
    if (className === 'Grade 1') {
      students = [
        { id: '1', nameWithInitial: 'A.B. Smith', email: 'smith@example.com', class: 'Grade 1' },
        { id: '2', nameWithInitial: 'C.D. Johnson', email: 'johnson@example.com', class: 'Grade 1' },
        { id: '3', nameWithInitial: 'E.F. Williams', email: 'williams@example.com', class: 'Grade 1' }
      ];
    } else if (className === 'Grade 2') {
      students = [
        { id: '4', nameWithInitial: 'G.H. Davis', email: 'davis@example.com', class: 'Grade 2' },
        { id: '5', nameWithInitial: 'I.J. Brown', email: 'brown@example.com', class: 'Grade 2' }
      ];
    } else {
      // For other grades
      students = [
        { id: '6', nameWithInitial: 'K.L. Student', email: 'student@example.com', class: className }
      ];
    }
    
    /* 
    // Uncomment this to use real data from your database
    // Find students in this class from User model (if that's where you store students)
    const userStudents = await User.find({ 
      role: 'student', 
      class: className 
    }).select('_id nameWithInitial email class');
    
    // Format data to match the expected structure
    students = userStudents.map(student => ({
      id: student._id,
      nameWithInitial: student.nameWithInitial,
      email: student.email,
      class: student.class
    }));
    */
    
    res.status(200).json({ students });
  } catch (error) {
    console.error('Error fetching students by class:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

module.exports = exports;