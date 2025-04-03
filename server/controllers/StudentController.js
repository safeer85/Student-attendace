// StudentController.js
// This controller works without requiring a separate Student model
// It uses the User model since students are stored there

const User = require('../models/User.js');

// Get all students with optional class filter
exports.getAllStudents = async (req, res) => {
  try {
    const { class: className } = req.query;
    
    // For testing, use mock data
    // In production, uncomment the database queries below
    
    // Mock student data based on class
    let students = [];
    
    if (className) {
      // Filter by class if provided
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
      } else if (className === 'Grade 3') {
        students = [
          { id: '6', nameWithInitial: 'K.L. Wilson', email: 'wilson@example.com', class: 'Grade 3' },
          { id: '7', nameWithInitial: 'M.N. Taylor', email: 'taylor@example.com', class: 'Grade 3' }
        ];
      } else if (className === 'Grade 4') {
        students = [
          { id: '8', nameWithInitial: 'O.P. Anderson', email: 'anderson@example.com', class: 'Grade 4' },
          { id: '9', nameWithInitial: 'Q.R. Thomas', email: 'thomas@example.com', class: 'Grade 4' }
        ];
      } else if (className === 'Grade 5') {
        students = [
          { id: '10', nameWithInitial: 'S.T. Jackson', email: 'jackson@example.com', class: 'Grade 5' },
          { id: '11', nameWithInitial: 'U.V. White', email: 'white@example.com', class: 'Grade 5' }
        ];
      }
    } else {
      // Return some students from all classes if no class filter
      students = [
        { id: '1', nameWithInitial: 'A.B. Smith', email: 'smith@example.com', class: 'Grade 1' },
        { id: '4', nameWithInitial: 'G.H. Davis', email: 'davis@example.com', class: 'Grade 2' },
        { id: '6', nameWithInitial: 'K.L. Wilson', email: 'wilson@example.com', class: 'Grade 3' }
      ];
    }
    
    /* 
    // Uncomment this to use real data from your database
    // Build query based on whether class filter is provided
    const query = { role: 'student' };
    if (className) {
      query.class = className;
    }
    
    // Find students that match the query
    const userStudents = await User.find(query).select('_id nameWithInitial email class');
    
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
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Other student-related methods would go here...

module.exports = exports;