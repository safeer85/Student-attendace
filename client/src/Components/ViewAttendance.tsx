import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ViewAttendance.css'; // You'll need to create this CSS file

interface Student {
  id: string;
  nameWithInitial: string;
  email: string;
  class: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  className: string;
  status: 'present' | 'absent' | 'late';
}

interface DateRange {
  startDate: string;
  endDate: string;
}

const ViewAttendance: React.FC = () => {
  const [viewMode, setViewMode] = useState<'class' | 'student'>('class');
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Backend API URL - update this to match your server
  const API_URL = 'http://13.60.17.251:5000';

  // Fetch available classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        console.log('Fetching classes...');
        const response = await axios.get(`${API_URL}/api/classes`);
        console.log('Classes response:', response.data);
        
        if (response.data && response.data.classes) {
          setClasses(response.data.classes);
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Failed to load classes');
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Failed to load classes');
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
        
        console.log('Students response:', response.data);
        
        if (response.data && response.data.students) {
          setStudents(response.data.students);
          setSelectedStudent(''); // Reset selected student
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Failed to fetch students');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to fetch students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params: Record<string, string> = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      if (viewMode === 'class') {
        if (!selectedClass) {
          setError('Please select a class');
          setLoading(false);
          return;
        }
        params.class = selectedClass;
      } else {
        if (!selectedStudent) {
          setError('Please select a student');
          setLoading(false);
          return;
        }
        params.studentId = selectedStudent;
      }
      
      console.log('Fetching attendance with params:', params);
      const response = await axios.get(`${API_URL}/api/attendance`, { params });
      console.log('Attendance response:', response.data);
      
      if (response.data && response.data.records) {
        setAttendanceRecords(response.data.records);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Failed to fetch attendance records');
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setError('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance statistics
  const calculateStats = () => {
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(record => record.status === 'present').length;
    const absentCount = attendanceRecords.filter(record => record.status === 'absent').length;
    const lateCount = attendanceRecords.filter(record => record.status === 'late').length;
    
    return {
      total: totalRecords,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      presentPercentage: totalRecords > 0 ? (presentCount / totalRecords * 100).toFixed(2) : '0',
      absentPercentage: totalRecords > 0 ? (absentCount / totalRecords * 100).toFixed(2) : '0',
      latePercentage: totalRecords > 0 ? (lateCount / totalRecords * 100).toFixed(2) : '0',
    };
  };

  const stats = calculateStats();

  // Group records by date for class view
  const recordsByDate = attendanceRecords.reduce((acc, record) => {
    const date = new Date(record.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(record);
    return acc;
  }, {} as Record<string, AttendanceRecord[]>);

  // Group records by student for class view
  const recordsByStudent = attendanceRecords.reduce((acc, record) => {
    if (!acc[record.studentId]) {
      acc[record.studentId] = {
        studentName: record.studentName,
        records: []
      };
    }
    acc[record.studentId].records.push(record);
    return acc;
  }, {} as Record<string, { studentName: string, records: AttendanceRecord[] }>);

  return (
    <div className="view-attendance">
      <h2>View Attendance Records</h2>
      
      <div className="filters-container">
        <div className="view-mode">
          <label>View Mode:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input 
                type="radio" 
                name="viewMode"
                value="class"
                checked={viewMode === 'class'}
                onChange={() => setViewMode('class')}
              />
              Class View
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                name="viewMode"
                value="student"
                checked={viewMode === 'student'}
                onChange={() => setViewMode('student')}
              />
              Student View
            </label>
          </div>
        </div>
        
        <div className="filters">
          {viewMode === 'class' ? (
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
          ) : (
            <>
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
                <label htmlFor="student">Student:</label>
                <select 
                  id="student" 
                  value={selectedStudent} 
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  disabled={!selectedClass || students.length === 0}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.nameWithInitial}</option>
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
              required
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
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            className="fetch-button"
            onClick={fetchAttendanceRecords}
            disabled={loading || (viewMode === 'class' && !selectedClass) || 
                    (viewMode === 'student' && !selectedStudent)}
          >
            {loading ? 'Loading...' : 'Fetch Records'}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      {attendanceRecords.length > 0 && (
        <div className="attendance-results">
          <div className="attendance-summary">
            <h3>Attendance Summary</h3>
            <div className="summary-stats">
              <div className="stat-card">
                <h4>Total Records</h4>
                <p className="stat-value">{stats.total}</p>
              </div>
              <div className="stat-card present">
                <h4>Present</h4>
                <p className="stat-value">{stats.present}</p>
                <p className="stat-percent">{stats.presentPercentage}%</p>
              </div>
              <div className="stat-card absent">
                <h4>Absent</h4>
                <p className="stat-value">{stats.absent}</p>
                <p className="stat-percent">{stats.absentPercentage}%</p>
              </div>
              <div className="stat-card late">
                <h4>Late</h4>
                <p className="stat-value">{stats.late}</p>
                <p className="stat-percent">{stats.latePercentage}%</p>
              </div>
            </div>
          </div>
          
          <div className="attendance-details">
            <h3>Attendance Details</h3>
            
            {viewMode === 'class' ? (
              <div className="class-view">
                <div className="date-summary">
                  <h4>By Date</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Late</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(recordsByDate).map(([date, records]) => {
                        const presentCount = records.filter(r => r.status === 'present').length;
                        const absentCount = records.filter(r => r.status === 'absent').length;
                        const lateCount = records.filter(r => r.status === 'late').length;
                        
                        return (
                          <tr key={date}>
                            <td>{date}</td>
                            <td>{presentCount}</td>
                            <td>{absentCount}</td>
                            <td>{lateCount}</td>
                            <td>{records.length}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="student-summary">
                  <h4>By Student</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Late</th>
                        <th>Attendance %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(recordsByStudent).map(([studentId, { studentName, records }]) => {
                        const presentCount = records.filter(r => r.status === 'present').length;
                        const absentCount = records.filter(r => r.status === 'absent').length;
                        const lateCount = records.filter(r => r.status === 'late').length;
                        const attendancePercentage = ((presentCount + (lateCount * 0.5)) / records.length * 100).toFixed(2);
                        
                        return (
                          <tr key={studentId}>
                            <td>{studentName}</td>
                            <td>{presentCount}</td>
                            <td>{absentCount}</td>
                            <td>{lateCount}</td>
                            <td>{attendancePercentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="student-view">
                <h4>Daily Records</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map(record => (
                      <tr key={record.id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
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
            )}
          </div>
        </div>
      )}
      
      {!loading && attendanceRecords.length === 0 && (
        <div className="no-records-message">
          No attendance records found for the selected criteria. Please adjust your filters or select different dates.
        </div>
      )}
    </div>
  );
};

export default ViewAttendance;