const express = require('express');
const { addAdmin, getAdminName,getEmploiDuTempsByCriteria} = require('../controllers/adminController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Ajouter un administrateur avec une image
router.post('/add-admin', upload.single('image_admin'), addAdmin);
// Récupérer le nom de l'administrateur
router.get('/admin-name', getAdminName); // Vérifiez que cette route existe bien dans votre code

// Route pour obtenir l'emploi du temps d'un employé
//router.get('/emploi-du-temps/employee/:id', getEmploiDuTempsEmployee);

// Route pour obtenir l'emploi du temps d'un groupe
//router.get('/emploi-du-temps/group/:id', getEmploiDuTempsGroup);

router.get('/emploi-du-temps', getEmploiDuTempsByCriteria);

module.exports = router;
