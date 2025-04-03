
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
// Fix capitalization and add the .tsx extension
import './home.css'; // Create this CSS file for styling
import Navbar from '../../Components/navbar.tsx';
import TakeAttendance from '../../Components/TakeAttendance.tsx';
import ViewAttendance from '../../Components/ViewAttendance.tsx'; 
import GenerateReport from '../../Components/GenerateReport.tsx';

const HomePage: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const location = useLocation();
  const user = location.state?.user;

  const handleButtonClick = (component: string) => {
    setActiveComponent(activeComponent === component ? null : component);
  };

  return (
    <div>
      {/* Navbar at the top */}
      <Navbar userName={user?.nameWithInitial || user?.email} userRole={user?.role} />

      {/* Main Content */}
      <div className="container mx-auto mt-6 p-6">
        <h1 className="text-2xl font-bold">Welcome to the Attendance System</h1>
        <h2 className="text-lg">Hello! {user?.nameWithInitial}</h2>
        <h3 className="text-md font-semibold">Role: {user?.role}</h3>

        {/* Content based on user role */}
        {user?.role === 'teacher' && (
          <div className="mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={() => handleButtonClick('viewAttendance')}>
              View Students Attendance Details
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded mr-2" onClick={() => handleButtonClick('takeAttendance')}>
              Take Attendance
            </button>
            <button className="bg-purple-500 text-white px-4 py-2 rounded" onClick={() => handleButtonClick('generateReport')}>
              Generate Report
            </button>

            {/* Conditional Rendering */}
            {activeComponent === 'viewAttendance' && (
              <ViewAttendance userRole="teacher" />
            )}
            {activeComponent === 'takeAttendance' && (
              <TakeAttendance />
            )}
            {activeComponent === 'generateReport' && (
              <GenerateReport />
            )}
          </div>
        )}

        {user?.role === 'student' && (
          <div className="mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => handleButtonClick('viewAttendance')}>
              View Your Attendance Details
            </button>

            {activeComponent === 'viewAttendance' && (
              <ViewAttendance userRole="student" userId={user.id} userEmail={user.email} />
            )}
          </div>
        )}

        {user?.role === 'parent' && (
          <div className="mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => handleButtonClick('viewAttendance')}>
              View Child's Attendance Details
            </button>

            {activeComponent === 'viewAttendance' && (
              <ViewAttendance userRole="parent" userId={user.childId} userEmail={user.childEmail} />
            )}
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={() => handleButtonClick('viewAttendance')}>
              View All Attendance
            </button>
            <button className="bg-purple-500 text-white px-4 py-2 rounded" onClick={() => handleButtonClick('generateReport')}>
              Generate Reports
            </button>

            {activeComponent === 'viewAttendance' && (
              <ViewAttendance userRole="admin" />
            )}
            {activeComponent === 'generateReport' && (
              <GenerateReport />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;