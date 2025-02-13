const User = require('../models/User.js');
const bcrypt = require('bcryptjs');


exports.registerUser = async (req, res) => {
  try {
    // Extract name, email, password, role, class, and subjects from the request body
    const { nameWithInitial, email, password, role, class: className, subjects } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user object
    const newUser = new User({
      nameWithInitial,
      email,
      password: hashedPassword,
      role,
      class: role === 'student' ? className : undefined, // class is only required for students
      subjects: role === 'teacher' ? subjects : undefined, // subjects are required only for teachers
    });

    // Save the new user to the database
    await newUser.save();

    // Send a response indicating successful registration
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    // Handle any errors during the process
    res.status(400).json({ error: err.message });
  }
};




 exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Compare the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    // Respond with user data
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

//module.exports = { loginUser };


//module.exports = { registerUser };