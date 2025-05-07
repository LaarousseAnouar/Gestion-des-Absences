// routes/studentsRoutes.js
const express = require('express');
const { addStudent ,getAllStudents } = require('../controllers/studentsController');
const multer = require('multer');

// Configuration de Multer pour gérer les fichiers image de l'étudiant
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Ajouter un étudiant avec une image
router.post('/add-student', upload.single('image_student'), addStudent);

router.get('/students', getAllStudents);

module.exports = router;
