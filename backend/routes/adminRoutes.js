const express = require('express');
const { addAdmin, getAdminName,getEmploiDuTempsGroupe ,getEmploiDuTempsProf} = require('../controllers/adminController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Ajouter un administrateur avec une image
router.post('/add-admin', upload.single('image_admin'), addAdmin);
// Récupérer le nom de l'administrateur
router.get('/admin-name', getAdminName); // Vérifiez que cette route existe bien dans votre code

router.get('/group/:groupId', getEmploiDuTempsGroupe);

router.get('/prof/:profId', getEmploiDuTempsProf);

module.exports = router;
