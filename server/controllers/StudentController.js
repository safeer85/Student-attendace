const Student = require('../models/Student');
const User = require('../models/User');

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const { class: className } = req.query;
    
    let query = {};
    if (className) {
      query.class = className;
    }
    
    const students = await Student.find(query);
    res.status(200).json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.status(200).json({ student });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student details' });
  }
};

// Create student (usually handled during user registration)
exports.createStudent = async (req, res) => {
  try {
    const { nameWithInitial, email, class: className, userId } = req.body;
    
    const newStudent = new Student({
      nameWithInitial,
      email,
      class: className,
      userId
    });
    
    await newStudent.save();
    res.status(201).json({ message: 'Student created successfully', student: newStudent });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { nameWithInitial, email, class: className } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { nameWithInitial, email, class: className },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.status(200).json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Also delete the associated user account
    await User.findByIdAndDelete(student.userId);
    
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};