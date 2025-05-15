const express = require('express');
const { addStudent, getAllStudents, blockStudent, modifyStudent } = require('../controllers/studentsController');
const multer = require('multer');

// Configuration de Multer pour gérer les fichiers image de l'étudiant
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Ajouter un étudiant avec une image
router.post('/add-student', upload.single('image_student'), addStudent);

// Récupérer tous les étudiants
router.get('/students', getAllStudents);

// Modifier le statut d'un étudiant (pour bloquer l'étudiant)
router.patch('/students/:id/status', blockStudent);

// Modifier les informations d'un étudiant (et image)
router.patch('/students/:id', upload.single('image_student'), modifyStudent); // Using PATCH to modify student data

module.exports = router;
