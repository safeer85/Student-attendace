import React, { useState } from 'react';
import axios from 'axios';
import './RegisterPage.css';

const RegisterPage = () => {
  const [nameWithInitial, setNameWithInitial] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [className, setClassName] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        nameWithInitial,
        email,
        password,
        role,
        class: role === 'student' ? className : undefined,
        subjects: role === 'teacher' ? subjects : undefined,
      };

      const response = await axios.post('http://13.61.3.43:5000/api/register', userData);
      setSuccessMessage(response.data.message);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.response.data.error);
      setSuccessMessage('');
    }
  };

  const handleSubjectsChange = (e) => {
    const { value } = e.target;
    setSubjects(value.split(',').map(subject => subject.trim()));
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        
        <div className="form-group">
          <label>Name with Initial</label>
          <input
            type="text"
            value={nameWithInitial}
            onChange={(e) => setNameWithInitial(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role === 'student' && (
          <div className="form-group">
            <label>Class Name</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
            />
          </div>
        )}

        {role === 'teacher' && (
          <div className="form-group">
            <label>Subjects (comma separated)</label>
            <input
              type="text"
              value={subjects.join(', ')}
              onChange={handleSubjectsChange}
              required
            />
          </div>
        )}

        <button type="submit" className="register-button">Register</button>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </form>
    </div>
  );
};

export default RegisterPage;
