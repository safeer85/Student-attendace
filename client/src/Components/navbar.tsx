import React from 'react';
import { useNavigate } from 'react-router-dom';
import './navbar.css'; // Create this CSS file for styling

interface NavbarProps {
  userName: string;
  userRole: string;
}

const Navbar: React.FC<NavbarProps> = ({ userName, userRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem('user');
    // Navigate back to login page
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Student Attendance System</h1>
      </div>
      <div className="navbar-menu">
        <div className="user-info">
          <span className="user-name">{userName}</span>
          <span className="user-role">({userRole})</span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;