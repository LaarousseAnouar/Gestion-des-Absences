// CoursHoursRoutes.js
const express = require('express');
const router = express.Router();
const CoursHoursController = require('../controllers/CoursHoursController'); // Import the controller

// Route to handle the saving of course hours
router.post('/cours_hours', CoursHoursController.createCoursHour);

module.exports = router;
