// CoursHoursRoutes.js
const express = require('express');
const router = express.Router();
const CoursHoursController = require('../controllers/CoursHoursController'); // Import the controller

// Route to handle the saving of course hours
router.post('/cours_hours', CoursHoursController.createCoursHour);

router.put('/cours_hours/:id', CoursHoursController.updateCoursHour);

router.get('/cours_hours/teacher/:teacher_id', CoursHoursController.getCoursHoursByTeacher);

module.exports = router;
