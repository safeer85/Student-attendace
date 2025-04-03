import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TakeAttendance.css';

interface Student {
  id: string;
  nameWithInitial: string;
  email: string;
  class: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late';
}

const TakeAttendance: React.FC = () => {
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });

  // Backend API URL - update this to match your server
  const API_URL = 'http://13.60.17.251:5000';

  // Fetch available classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Log the attempt to fetch classes for debugging
        console.log('Attempting to fetch classes...');
        
        const response = await axios.get(`${API_URL}/api/classes`);
        
        // Log the response for debugging
        console.log('Classes response:', response.data);
        
        if (response.data && response.data.classes) {
          setClasses(response.data.classes);
        } else {
          console.error('Unexpected response format:', response.data);
          setMessage({ type: 'error', text: 'Failed to load classes (unexpected format)' });
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setMessage({ type: 'error', text: 'Failed to load classes' });
      }
    };

    fetchClasses();
  }, []);

  // Fetch students when class is selected
  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/students`, {
          params: { class: selectedClass }
        });
        
        // Log the response for debugging
        console.log('Students response:', response.data);
        
        if (response.data && response.data.students) {
          setStudents(response.data.students);
          
          // Initialize all students as present
          const initialAttendance: Record<string, 'present' | 'absent' | 'late'> = {};
          response.data.students.forEach((student: Student) => {
            initialAttendance[student.id] = 'present';
          });
          setAttendance(initialAttendance);
        } else {
          console.error('Unexpected response format:', response.data);
          setMessage({ type: 'error', text: 'Failed to fetch students (unexpected format)' });
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setMessage({ type: 'error', text: 'Failed to fetch students' });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass) {
      setMessage({ type: 'error', text: 'Please select a class' });
      return;
    }
    
    if (students.length === 0) {
      setMessage({ type: 'error', text: 'No students to mark attendance for' });
      return;
    }
    
    // Convert attendance object to array of records
    const attendanceRecords: AttendanceRecord[] = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status
    }));
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/attendance`, {
        date,
        class: selectedClass,
        records: attendanceRecords
      });
      
      console.log('Attendance submission response:', response.data);
      setMessage({ type: 'success', text: 'Attendance submitted successfully!' });
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setMessage({ type: 'error', text: 'Failed to submit attendance' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="take-attendance">
      <h2>Take Attendance</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-controls">
          <div className="form-group">
            <label htmlFor="class">Class:</label>
            <select 
              id="class" 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              required
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input 
              type="date" 
              id="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              required
            />
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Loading students...</div>
        ) : students.length > 0 ? (
          <div className="students-list">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.nameWithInitial}</td>
                    <td className="center">
                      <input 
                        type="radio" 
                        name={`attendance-${student.id}`}
                        checked={attendance[student.id] === 'present'}
                        onChange={() => handleStatusChange(student.id, 'present')}
                      />
                    </td>
                    <td className="center">
                      <input 
                        type="radio" 
                        name={`attendance-${student.id}`}
                        checked={attendance[student.id] === 'absent'}
                        onChange={() => handleStatusChange(student.id, 'absent')}
                      />
                    </td>
                    <td className="center">
                      <input 
                        type="radio" 
                        name={`attendance-${student.id}`}
                        checked={attendance[student.id] === 'late'}
                        onChange={() => handleStatusChange(student.id, 'late')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedClass ? (
          <div className="no-students">No students found in this class</div>
        ) : (
          <div className="select-class-prompt">Please select a class to view students</div>
        )}
        
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || students.length === 0}
          >
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TakeAttendance;