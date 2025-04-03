import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ViewAttendance.css';

interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  className: string;
  status: 'present' | 'absent' | 'late';
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

interface ViewAttendanceProps {
  userRole: string;
  userId?: string;
  userEmail?: string;
}

const ViewAttendance: React.FC<ViewAttendanceProps> = ({ userRole, userId, userEmail }) => {
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    present: 0,
    absent: 0,
    late: 0,
    total: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch available classes for teachers
  useEffect(() => {
    if (userRole !== 'teacher') return;

    const fetchClasses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/classes');
        setClasses(response.data.classes);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Failed to fetch classes');
      }
    };

    fetchClasses();
  }, [userRole]);

  // Fetch students when class is selected (for teachers)
  useEffect(() => {
    if (userRole !== 'teacher' || !selectedClass) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/students?class=${selectedClass}`);
        setStudents(response.data.students.map((s: any) => ({ 
          id: s.id, 
          name: s.nameWithInitial 
        })));
        setSelectedStudent(''); // Reset selected student
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, userRole]);

  // Fetch attendance records based on role and selections
  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setError('');
    
    try {
      let url = 'http://localhost:5000/api/attendance';
      const params: Record<string, string> = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      if (userRole === 'teacher') {
        if (selectedClass) {
          params.class = selectedClass;
        }
        if (selectedStudent) {
          params.studentId = selectedStudent;
        }
      } else if (userRole === 'student' && userId) {
        params.studentId = userId;
      }
      
      const response = await axios.get(url, { params });
      setRecords(response.data.records);
      
      // Calculate statistics
      const recordsCount = response.data.records.length;
      const presentCount = response.data.records.filter((r: AttendanceRecord) => r.status === 'present').length;
      const absentCount = response.data.records.filter((r: AttendanceRecord) => r.status === 'absent').length;
      const lateCount = response.data.records.filter((r: AttendanceRecord) => r.status === 'late').length;
      
      setStats({
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        total: recordsCount,
        percentage: recordsCount > 0 
          ? ((presentCount + (lateCount * 0.5)) / recordsCount) * 100 
          : 0
      });
      
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setError('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch for students on component mount
    if (userRole === 'student' && userId) {
      fetchAttendanceRecords();
    }
  }, [userRole, userId]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="view-attendance">
      <h2>View Attendance Records</h2>
      
      <div className="filters">
        {userRole === 'teacher' && (
          <>
            <div className="form-group">
              <label htmlFor="class">Class:</label>
              <select 
                id="class" 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="student">Student:</label>
              <select 
                id="student" 
                value={selectedStudent} 
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={!selectedClass || students.length === 0}
              >
                <option value="">All Students</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>
          </>
        )}
        
        <div className="form-group">
          <label htmlFor="startDate">Start Date:</label>
          <input 
            type="date" 
            id="startDate" 
            name="startDate"
            value={dateRange.startDate} 
            onChange={handleDateChange}
            max={dateRange.endDate}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endDate">End Date:</label>
          <input 
            type="date" 
            id="endDate" 
            name="endDate"
            value={dateRange.endDate} 
            onChange={handleDateChange}
            min={dateRange.startDate}
            max={new Date().toISOString().split('T')[0]} // Prevent future dates
          />
        </div>
        
        <button 
          className="filter-button"
          onClick={fetchAttendanceRecords}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Filter'}
        </button>
      </div>
      
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="attendance-stats">
            <div className="stat-card">
              <h3>Present</h3>
              <p className="stat-value">{stats.present}</p>
            </div>
            <div className="stat-card">
              <h3>Absent</h3>
              <p className="stat-value">{stats.absent}</p>
            </div>
            <div className="stat-card">
              <h3>Late</h3>
              <p className="stat-value">{stats.late}</p>
            </div>
            <div className="stat-card">
              <h3>Attendance Rate</h3>
              <p className="stat-value">{stats.percentage.toFixed(2)}%</p>
            </div>
          </div>
          
          {loading ? (
            <div className="loading">Loading records...</div>
          ) : records.length > 0 ? (
            <div className="records-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    {userRole === 'teacher' && <th>Student</th>}
                    {userRole === 'teacher' && <th>Class</th>}
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      {userRole === 'teacher' && <td>{record.studentName}</td>}
                      {userRole === 'teacher' && <td>{record.className}</td>}
                      <td>
                        <span className={`status-badge ${record.status}`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-records">No attendance records found for the selected criteria</div>
          )}
        </>
      )}
    </div>
  );
};

export default ViewAttendance;