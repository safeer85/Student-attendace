/*import React, { useState } from 'react';
import TakeAttendance from '../../Components/TakeAttendance.tsx'; // Import the Take Attendance component
import ViewAttendance from '../../Components/ViewAttendance.tsx';
import GenerateReport from '../../Components/GenerateReport.tsx';
import { useLocation } from 'react-router-dom'; // Import the View Attendance component

const HomePage = () => {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const handleButtonClick = (component: string) => {
    setActiveComponent(activeComponent === component ? null : component);
  };

  const location = useLocation();
  const user = location.state?.user;

  return (
    <div>
      <h1>Welcome to the Homepage</h1>
      <h2>Hello, {user.email}!</h2>
      <h3>Role: {user.role}</h3>

      {user.role === 'teacher' && (
        <div>
          <button onClick={() => handleButtonClick('viewAttendance')}>
            View Students Attendance Details
          </button>
          <button onClick={() => handleButtonClick('takeAttendance')}>
            Take Attendance
          </button>
          <button onClick={() => handleButtonClick('generateReport')}>
            Generate Report
          </button>

          {activeComponent === 'viewAttendance' && (
            <div>
              <h4>View Students Attendance Details</h4>
              <ViewAttendance />
            </div>
          )}

          {activeComponent === 'takeAttendance' && (
            <div>
              <h4>Take Attendance</h4>
              <TakeAttendance />
            </div>
          )}
          {activeComponent === 'generateReport' && (
            <div>
              <h4>Generate Report</h4>
              <GenerateReport />
            </div>
          )}
        </div>
      )}

      {user.role === 'student' && (
        <div>
          <button onClick={() => handleButtonClick('viewAttendance')}>
            View Your Attendance Details
          </button>

          {activeComponent === 'viewAttendance' && (
            <div>
              <h4>Your Attendance Details</h4>
              <ViewAttendance />
            </div>
          )}
        </div>
      )}

      {user.role === 'parent' && (
        <div>
          <button onClick={() => handleButtonClick('viewAttendance')}>
            View Child’s Attendance Details
          </button>

          {activeComponent === 'viewAttendance' && (
            <div>
              <h4>Child’s Attendance Details</h4>
              <ViewAttendance />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;*/

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
//import Navbar from '../../Components/navbar.tsx'; // Import the Navbar component
import TakeAttendance from '../../Components/TakeAttendance.tsx'; // Import the Take Attendance component
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
      

      {/* Main Content */}
      <div className="container mx-auto mt-6 p-6">
        <h1 className="text-2xl font-bold">Welcome to the Homepage</h1>
        <h2 className="text-lg">Hello, {user?.email}!</h2>
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
              <div className="mt-4">
                <h4 className="text-xl font-semibold">View Students Attendance Details</h4>
                <ViewAttendance />
              </div>
            )}
            {activeComponent === 'takeAttendance' && (
              <div className="mt-4">
                <h4 className="text-xl font-semibold">Take Attendance</h4>
                <TakeAttendance />
              </div>
            )}
            {activeComponent === 'generateReport' && (
              <div className="mt-4">
                <h4 className="text-xl font-semibold">Generate Report</h4>
                <GenerateReport />
              </div>
            )}
          </div>
        )}

        {user?.role === 'student' && (
          <div className="mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => handleButtonClick('viewAttendance')}>
              View Your Attendance Details
            </button>

            {activeComponent === 'viewAttendance' && (
              <div className="mt-4">
                <h4 className="text-xl font-semibold">Your Attendance Details</h4>
                <ViewAttendance />
              </div>
            )}
          </div>
        )}

        {user?.role === 'parent' && (
          <div className="mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => handleButtonClick('viewAttendance')}>
              View Child’s Attendance Details
            </button>

            {activeComponent === 'viewAttendance' && (
              <div className="mt-4">
                <h4 className="text-xl font-semibold">Child’s Attendance Details</h4>
                <ViewAttendance />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
