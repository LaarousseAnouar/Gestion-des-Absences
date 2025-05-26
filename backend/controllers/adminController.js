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
    const userId = 5;
    const result = await client.query('SELECT nom, prenom FROM admins WHERE id = $1', [userId]);

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

const getEmploiDuTempsGroupe = async (req, res) => {
  const { groupId } = req.params;

  try {
    const result = await client.query(
      `SELECT emploi_du_temps FROM groupes WHERE id = $1`,
      [groupId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Groupe non trouvé" });
    }

    const emploiDuTempsBuffer = result.rows[0].emploi_du_temps;
    if (!emploiDuTempsBuffer) {
      return res.status(404).json({ error: "Aucun emploi du temps disponible pour ce groupe" });
    }

    const emploiDuTempsBase64 = emploiDuTempsBuffer.toString('base64');
    res.json({ emploiDuTempsBase64 });
  } catch (err) {
    console.error("Erreur récupération emploi du temps groupe:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// Récupérer emploi du temps d'un professeur par son ID
const getEmploiDuTempsProf = async (req, res) => {
  const { profId } = req.params;

  try {
    const result = await client.query(
      `SELECT emploi_du_temps FROM employees WHERE id = $1`,
      [profId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Professeur non trouvé" });
    }

    const emploiDuTempsBuffer = result.rows[0].emploi_du_temps;
    if (!emploiDuTempsBuffer) {
      return res.status(404).json({ error: "Aucun emploi du temps disponible pour ce professeur" });
    }

    const emploiDuTempsBase64 = emploiDuTempsBuffer.toString('base64');
    res.json({ emploiDuTempsBase64 });
  } catch (err) {
    console.error("Erreur récupération emploi du temps professeur:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


module.exports = {
  addAdmin,
  getAdminName,
  getEmploiDuTempsGroupe,
  getEmploiDuTempsProf,

};
