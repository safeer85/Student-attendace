const express = require('express');
const router = express.Router();
const { getAllClasses } = require('../controllers/ClassController');

// Get all classes - this is the endpoint needed for your dropdown
router.get('/api/classes', getAllClasses);

// Export the router
module.exports = router;