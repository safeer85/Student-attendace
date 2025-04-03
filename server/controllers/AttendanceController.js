const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// Record attendance for a class or individual students
exports.recordAttendance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { date, class: className, records } = req.body;
    
    // Convert date string to Date object
    const attendanceDate = new Date(date);
    
    // Create an array to hold attendance records
    const attendanceRecords = [];
    
    // Process each student's attendance record
    for (const record of records) {
      const { studentId, status } = record;
      
      // Find student to get their name and class
      const student = await Student.findById(studentId);
      if (!student) {
        // Skip invalid student IDs
        continue;
      }
      
      // Create or update attendance record
      const attendanceRecord = {
        date: attendanceDate,
        studentId,
        studentName: student.nameWithInitial,
        className: student.class,
        status,
        recordedBy: req.user ? req.user._id : null // If you're using authentication middleware
      };
      
      attendanceRecords.push(attendanceRecord);
    }
    
    // Check if we have any valid records to save
    if (attendanceRecords.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'No valid student records found' });
    }
    
    // First, delete any existing records for these students on this date
    const studentIds = attendanceRecords.map(record => record.studentId);
    await Attendance.deleteMany({ 
      date: attendanceDate,
      studentId: { $in: studentIds }
    });
    
    // Then insert the new records
    await Attendance.insertMany(attendanceRecords);
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({ 
      message: 'Attendance recorded successfully',
      recordsCount: attendanceRecords.length
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error recording attendance:', error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
};

// Get attendance records with various filters
exports.getAttendanceRecords = async (req, res) => {
  try {
    const { startDate, endDate, studentId, class: className } = req.query;
    
    // Build query based on provided filters
    const query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }
    
    if (studentId) {
      query.studentId = studentId;
    }
    
    if (className) {
      query.className = className;
    }
    
    // Get attendance records based on query
    const records = await Attendance.find(query).sort({ date: -1 });
    
    res.status(200).json({ records });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
};

// Get attendance statistics
exports.getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate, studentId, class: className } = req.query;
    
    // Build match stage for aggregation
    const match = {};
    
    if (startDate && endDate) {
      match.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      match.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      match.date = { $lte: new Date(endDate) };
    }
    
    if (studentId) {
      match.studentId = mongoose.Types.ObjectId(studentId);
    }
    
    if (className) {
      match.className = className;
    }
    
    // Aggregate to get stats
    const stats = await Attendance.aggregate([
      { $match: match },
      { 
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Format stats into an object
    const formattedStats = {
      present: 0,
      absent: 0,
      late: 0,
      total: 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat.status] = stat.count;
      formattedStats.total += stat.count;
    });
    
    // Calculate attendance percentage
    if (formattedStats.total > 0) {
      // Count late as half attendance (adjust as needed)
      formattedStats.percentage = ((formattedStats.present + (formattedStats.late * 0.5)) / formattedStats.total) * 100;
    } else {
      formattedStats.percentage = 0;
    }
    
    res.status(200).json({ stats: formattedStats });
  } catch (error) {
    console.error('Error calculating attendance statistics:', error);
    res.status(500).json({ error: 'Failed to calculate attendance statistics' });
  }
};

// Update attendance record
exports.updateAttendanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const attendanceRecord = await Attendance.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!attendanceRecord) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    res.status(200).json({ 
      message: 'Attendance record updated successfully',
      record: attendanceRecord
    });
  } catch (error) {
    console.error('Error updating attendance record:', error);
    res.status(500).json({ error: 'Failed to update attendance record' });
  }
};

// Delete attendance record
exports.deleteAttendanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    const attendanceRecord = await Attendance.findByIdAndDelete(id);
    
    if (!attendanceRecord) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    res.status(200).json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
};