// backend/routes/employeeRoutes.js

const express = require('express');
const multer = require('multer');
const { addEmployee, getEmployeeCount, getDailyAbsences, getWeeklyPresence, getAllEmployees, getScheduleByEmail ,modifyEmployee ,blockEmployee ,getProfessors} = require('../controllers/employeeController'); // Assurez-vous que le contrôleur est correctement importé

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Route pour ajouter un employé
router.post('/add-employee', upload.fields([
  { name: 'image_employee', maxCount: 1 },
  { name: 'emploi_du_temps', maxCount: 1 }
]), addEmployee);

// Route pour récupérer le nombre d'employés
router.get('/employee-count', getEmployeeCount);

// Route pour récupérer les absences de la journée
router.get('/daily-absences', getDailyAbsences);

// Route pour récupérer la présence de la semaine
router.get('/weekly-presence', getWeeklyPresence);

// Route pour récupérer tous les employés
router.get('/employees', getAllEmployees);

// Route pour récupérer les informations du professeur par email
router.get('/professor/:email/schedule', getScheduleByEmail); // Assurez-vous que cette route appelle bien la fonction du contrôleur

router.patch('/employees/:id', upload.single('image_employee'), modifyEmployee);

router.patch('/employees/:id/status', blockEmployee);

router.get('/employees/professors', getProfessors);

module.exports = router;
