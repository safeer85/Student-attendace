import React, { useState, useEffect, useCallback } from 'react';
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
  const fetchAttendanceRecords = useCallback(async () => {
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
  }, [dateRange, selectedClass, selectedStudent, userId, userRole]);

  useEffect(() => {
    // Auto-fetch for students on component mount
    if (userRole === 'student' && userId) {
      fetchAttendanceRecords();
    }
  }, [userRole, userId, fetchAttendanceRecords]);  // Add fetchAttendanceRecords here
  

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
      {/* UI and rendering code remains the same */}
    </div>
  );
};

export default ViewAttendance;
