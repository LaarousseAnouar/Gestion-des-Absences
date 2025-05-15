// backend/routes/attendanceRoutes.js
const express = require('express');
const { getAttendanceStatus, addAttendance ,updateAttendanceStatus } = require('../controllers/attendanceController');

const router = express.Router();

// Route pour récupérer le statut de présence pour une date donnée
router.get('/attendance', getAttendanceStatus);

// Route pour ajouter une nouvelle présence
router.post('/attendance', addAttendance);
// Route pour modify la présence
router.patch('/attendance', updateAttendanceStatus);

module.exports = router;



//http://localhost:3000/api/attendance?date=2025-05-04&id=8&type=employee
