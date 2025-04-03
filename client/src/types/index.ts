// src/types/index.ts

// User types
export interface User {
    id: string;
    name: string;
    email: string;
    userType: 'student' | 'teacher';
    grade?: string;
  }
  
  export interface LoginData {
    email: string;
    password: string;
    userType: 'student' | 'teacher';
  }
  
  export interface RegisterData extends LoginData {
    name: string;
    confirmPassword: string;
    grade?: string;
  }
  
  // Attendance types
  export interface AttendanceRecord {
    id: string;
    studentId: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    markedBy: string;
    timestamp: string;
  }
  
  export interface Student extends User {
    userType: 'student';
    grade: string;
  }
  
  export interface AttendanceStats {
    present: number;
    absent: number;
    late: number;
    total: number;
    percentage: number;
  }
  
  export interface MonthlyAttendanceData {
    month: string;
    records: AttendanceRecord[];
    present: number;
    absent: number;
    late: number;
    total: number;
    percentage: number;
  }
  
  export interface ReportData {
    type: 'grade' | 'student';
    grade?: string;
    student?: Student;
    students?: (Student & AttendanceStats & { totalDays: number; attendancePercentage: number })[];
    records?: Record<string, 'present' | 'absent' | 'late'>;
    summary?: {
      present: number;
      absent: number;
      late: number;
      totalDays: number;
      attendancePercentage: number;
    };
  }
  
  // Context types
  export interface AuthContextType {
    currentUser: User | null;
    login: (credentials: LoginData) => Promise<User>;
    register: (userData: RegisterData) => Promise<Omit<RegisterData, 'confirmPassword' | 'password'> & { id: string }>;
    logout: () => void;
    loading: boolean;
  }
  
  export interface AttendanceContextType {
    attendanceRecords: AttendanceRecord[];
    students: Student[];
    markAttendance: (studentIds: string[], date: string, status: 'present' | 'absent' | 'late', markedBy: string) => AttendanceRecord[];
    getStudentAttendance: (studentId: string) => AttendanceStats;
    getStudentsByGrade: (grade: string) => Student[];
    addStudent: (studentData: Omit<Student, 'id'>) => Student;
  }
  
  // Component props types
  export interface CardProps {
    title: string;
    value: string | number;
    color?: 'primary' | 'success' | 'error' | 'warning';
  }
  
  export interface NavbarProps {
    title: string;
  }
  
  export interface SidebarProps {
    userType: 'student' | 'teacher';
  }
  
  export interface StudentListProps {
    students: Student[];
    attendanceData: Record<string, 'present' | 'absent' | 'late'>;
    onStatusChange: (studentId: string, status: 'present' | 'absent' | 'late') => void;
  }
  
  export interface FormInputProps {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    required?: boolean;
    [x: string]: any;
  }