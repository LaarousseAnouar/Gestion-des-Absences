const bcrypt = require('bcryptjs');
const client = require('../config/db');
const multer = require('multer');

// Configuration de Multer pour stocker les fichiers en mémoire (image)
const storage = multer.memoryStorage();  
const upload = multer({ storage: storage });

// Ajouter un administrateur avec une image
const addAdmin = async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  // Vérifier que le mot de passe est défini
  if (!password) {
    return res.status(400).send('Le mot de passe est requis');
  }

  // Vérifier que l'image de l'administrateur est présente
  const imageAdmin = req.file ? req.file.buffer : null;  

  try {
    // Crypter le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'administrateur dans la base de données
    const result = await client.query(
      'INSERT INTO admins (nom, prenom, email, password, image_admin) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nom, prenom, email, hashedPassword, imageAdmin]
    );

    // Retourner l'administrateur ajouté
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de l'ajout de l'administrateur : ", err);
    res.status(500).send('Erreur lors de l\'ajout de l\'administrateur');
  }
};

// Récupérer le nom de l'administrateur
const getAdminName = async (req, res) => {
  try {
    const result = await client.query('SELECT nom, prenom FROM admins WHERE id = $1', [req.userId]);

    if (result.rows.length > 0) {
      res.json({ name: `${result.rows[0].prenom} ${result.rows[0].nom}` });
    } else {
      res.status(404).json({ message: 'Administrateur non trouvé' });
    }
  } catch (err) {
    console.error('Erreur lors de la récupération du nom de l\'administrateur : ', err);
    res.status(500).send('Erreur lors de la récupération du nom de l\'administrateur');
  }
};
// Dans votre fonction `getEmploiDuTempsByCriteria`
const getEmploiDuTempsByCriteria = async (req, res) => {
  const { formationId, groupId, professorId } = req.query;

  try {
    let query = '';
    let params = [];

    if (groupId && professorId) {
      query = 'SELECT emploi_du_temps FROM groupes WHERE formation_id = $1 AND id = $2';
      params = [formationId, groupId];
    } else if (groupId) {
      query = 'SELECT emploi_du_temps FROM groupes WHERE formation_id = $1 AND id = $2';
      params = [formationId, groupId];
    } else if (professorId) {
      query = 'SELECT emploi_du_temps FROM employees WHERE formation_id = $1 AND id = $2';
      params = [formationId, professorId];
    } else {
      return res.status(400).send('Veuillez spécifier un groupe ou un professeur.');
    }

    const result = await client.query(query, params);

    if (result.rows.length > 0) {
      // Convertir le buffer en Base64
      const emploiDuTempsBase64 = result.rows[0].emploi_du_temps.toString('base64');
      res.json({ emploi_du_temps: emploiDuTempsBase64 });
    } else {
      res.status(404).send('Aucun emploi du temps trouvé pour ces critères');
    }
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'emploi du temps : ', err);
    res.status(500).send('Erreur lors de la récupération des données');
  }
};




module.exports = {
  addAdmin,
  getAdminName,
  // getEmploiDuTempsGroup,
  // getEmploiDuTempsEmployee,
  getEmploiDuTempsByCriteria,

};
