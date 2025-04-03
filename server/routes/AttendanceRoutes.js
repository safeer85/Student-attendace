const express = require('express');
const router = express.Router();
const { recordAttendance, getAttendanceRecords } = require('../controllers/AttendanceController');

// Record attendance
router.post('/api/attendance', recordAttendance);

// Get attendance records with filters
router.get('/api/attendance', getAttendanceRecords);

module.exports = router;