import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './GenerateReport.css';

// Adding proper type definitions
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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

interface ReportData {
  student?: Student;
  class?: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  records: AttendanceRecord[];
  stats: {
    present: number;
    absent: number;
    late: number;
    total: number;
    percentage: number;
  };
}

const GenerateReport: React.FC = () => {
  const [reportType, setReportType] = useState<'class' | 'student'>('class');
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch available classes
  useEffect(() => {
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
  }, []);

  // Fetch students when class is selected
  useEffect(() => {
    if (!selectedClass) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://13.61.3.43:5000/api/students?class=${selectedClass}`);
        setStudents(response.data.students);
        setSelectedStudent(''); // Reset selected student
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

  const generateReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      let url = 'http://13.61.3.43:5000/api/attendance';
      const params: Record<string, string> = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };
      
      if (reportType === 'class') {
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
      
      const response = await axios.get(url, { params });
      const records = response.data.records;
      
      // Calculate statistics
      const recordsCount = records.length;
      const presentCount = records.filter((r: AttendanceRecord) => r.status === 'present').length;
      const absentCount = records.filter((r: AttendanceRecord) => r.status === 'absent').length;
      const lateCount = records.filter((r: AttendanceRecord) => r.status === 'late').length;
      
      const stats = {
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        total: recordsCount,
        percentage: recordsCount > 0 
          ? ((presentCount + (lateCount * 0.5)) / recordsCount) * 100 
          : 0
      };
      
      // Set report data
      setReportData({
        class: reportType === 'class' ? selectedClass : undefined,
        student: reportType === 'student' 
          ? students.find(s => s.id === selectedStudent) 
          : undefined,
        dateRange,
        records,
        stats
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!reportData) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Attendance Report', 14, 15);
    
    // Add report period
    doc.setFontSize(10);
    doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 14, 22);
    
    // Add report type specific details
    if (reportType === 'class' && reportData.class) {
      doc.text(`Class: ${reportData.class}`, 14, 29);
      
      // Add summary statistics
      doc.text('Attendance Summary:', 14, 38);
      doc.text(`Total Students: ${reportData.records.length > 0 ? [...new Set(reportData.records.map(r => r.studentId))].length : 0}`, 20, 45);
      doc.text(`Present: ${reportData.stats.present} (${(reportData.stats.present / reportData.stats.total * 100).toFixed(2)}%)`, 20, 52);
      doc.text(`Absent: ${reportData.stats.absent} (${(reportData.stats.absent / reportData.stats.total * 100).toFixed(2)}%)`, 20, 59);
      doc.text(`Late: ${reportData.stats.late} (${(reportData.stats.late / reportData.stats.total * 100).toFixed(2)}%)`, 20, 66);
      
      // Add attendance table
      const tableData = reportData.records.map(record => [
        new Date(record.date).toLocaleDateString(),
        record.studentName,
        record.status.charAt(0).toUpperCase() + record.status.slice(1)
      ]);
      
      doc.text('Daily Attendance Records:', 14, 76);
      
      doc.autoTable({
        startY: 80,
        head: [['Date', 'Student', 'Status']],
        body: tableData
      });
      
    } else if (reportType === 'student' && reportData.student) {
      doc.text(`Student: ${reportData.student.nameWithInitial}`, 14, 29);
      doc.text(`Class: ${reportData.student.class}`, 14, 36);
      
      // Add summary statistics
      doc.text('Attendance Summary:', 14, 45);
      doc.text(`Total Days: ${reportData.stats.total}`, 20, 52);
      doc.text(`Present: ${reportData.stats.present} (${(reportData.stats.present / reportData.stats.total * 100).toFixed(2)}%)`, 20, 59);
      doc.text(`Absent: ${reportData.stats.absent} (${(reportData.stats.absent / reportData.stats.total * 100).toFixed(2)}%)`, 20, 66);
      doc.text(`Late: ${reportData.stats.late} (${(reportData.stats.late / reportData.stats.total * 100).toFixed(2)}%)`, 20, 73);
      doc.text(`Attendance Rate: ${reportData.stats.percentage.toFixed(2)}%`, 20, 80);
      
      // Add attendance table
      const tableData = reportData.records.map(record => [
        new Date(record.date).toLocaleDateString(),
        record.status.charAt(0).toUpperCase() + record.status.slice(1)
      ]);
      
      doc.text('Daily Attendance Records:', 14, 90);
      
      doc.autoTable({
        startY: 95,
        head: [['Date', 'Status']],
        body: tableData
      });
    }
    
    // Save PDF
    doc.save(`attendance_report_${reportType === 'class' ? selectedClass : 'student'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="generate-report">
      <h2>Generate Attendance Report</h2>
      
      <div className="report-form">
        <div className="form-group report-type">
          <label>Report Type:</label>
          <div className="radio-group">
            <label className="radio-label">
              <input 
                type="radio" 
                name="reportType"
                value="class"
                checked={reportType === 'class'}
                onChange={() => setReportType('class')}
              />
              Class Report
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                name="reportType"
                value="student"
                checked={reportType === 'student'}
                onChange={() => setReportType('student')}
              />
              Student Report
            </label>
          </div>
        </div>
        
        <div className="filters">
          {reportType === 'class' ? (
            <div className="form-group">
              <label htmlFor="class">Select Class:</label>
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
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              required
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            className="generate-button"
            onClick={generateReport}
            disabled={loading || (reportType === 'class' && !selectedClass) || 
                    (reportType === 'student' && !selectedStudent)}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      {reportData && (
        <div className="report-preview">
          <div className="preview-header">
            <h3>Report Preview</h3>
            <button 
              className="download-button"
              onClick={downloadPDF}
            >
              Download PDF
            </button>
          </div>
          
          <div className="report-content">
            <div className="report-header">
              <h4>Attendance Report</h4>
              <p>Period: {dateRange.startDate} to {dateRange.endDate}</p>
              
              {reportType === 'class' && (
                <p>Class: {selectedClass}</p>
              )}
              
              {reportType === 'student' && reportData.student && (
                <>
                  <p>Student: {reportData.student.nameWithInitial}</p>
                  <p>Class: {reportData.student.class}</p>
                </>
              )}
            </div>
            
            <div className="report-stats">
              <div className="stat-card">
                <h5>Present</h5>
                <p className="stat-value">{reportData.stats.present}</p>
                <p className="stat-percent">
                  {reportData.stats.total > 0 
                    ? ((reportData.stats.present / reportData.stats.total) * 100).toFixed(2) 
                    : '0'}%
                </p>
              </div>
              
              <div className="stat-card">
                <h5>Absent</h5>
                <p className="stat-value">{reportData.stats.absent}</p>
                <p className="stat-percent">
                  {reportData.stats.total > 0 
                    ? ((reportData.stats.absent / reportData.stats.total) * 100).toFixed(2) 
                    : '0'}%
                </p>
              </div>
              
              <div className="stat-card">
                <h5>Late</h5>
                <p className="stat-value">{reportData.stats.late}</p>
                <p className="stat-percent">
                  {reportData.stats.total > 0 
                    ? ((reportData.stats.late / reportData.stats.total) * 100).toFixed(2) 
                    : '0'}%
                </p>
              </div>
              
              <div className="stat-card">
                <h5>Attendance Rate</h5>
                <p className="stat-value">{reportData.stats.percentage.toFixed(2)}%</p>
              </div>
            </div>
            
            <div className="attendance-table">
              <h5>Attendance Records</h5>
              
              {reportData.records.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      {reportType === 'class' && <th>Student</th>}
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.records.map(record => (
                      <tr key={record.id}>
                        <td>{new Date(record.date).toLocaleDateString()}</td>
                        {reportType === 'class' && <td>{record.studentName}</td>}
                        <td>
                          <span className={`status-badge ${record.status}`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-records">No attendance records found for the selected criteria</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateReport;