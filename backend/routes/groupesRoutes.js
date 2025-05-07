// routes/groupesRoutes.js
const express = require('express');
const { addGroup ,getGroupsByFormation ,getFormations} = require('../controllers/groupesController');  // Assure-toi que le contrôleur pour ajouter un groupe existe
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Ajouter un groupe à une formation avec un emploi du temps (image binaire)
router.post('/add-group', upload.single('emploi_du_temps'), addGroup);

router.get('/groups', getGroupsByFormation);  // Ajouter cette ligne

router.get('/formations', getFormations);

module.exports = router;
