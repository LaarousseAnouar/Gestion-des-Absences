// controllers/groupesController.js
const client = require('../config/db');

// Ajouter un groupe à une formation spécifique
const addGroup = async (req, res) => {
  const { formation_id, nom, nombre_etudiants } = req.body;
  const emploiDuTemps = req.file ? req.file.buffer : null;  // L'emploi du temps est envoyé en tant que fichier

  try {
    const result = await client.query(
      'INSERT INTO groupes (formation_id, nom, nombre_etudiants, emploi_du_temps) VALUES ($1, $2, $3, $4) RETURNING *',
      [formation_id, nom, nombre_etudiants, emploiDuTemps]
    );

    res.status(201).json(result.rows[0]);  // Retourne les informations du groupe ajouté
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de l\'ajout du groupe');
  }
};


const getFormations = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM formations');
    res.json(result.rows); // Retourner toutes les formations
  } catch (err) {
    console.error('Erreur lors de la récupération des formations:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des formations.' });
  }
};

// Ajout de la fonction pour obtenir les groupes par formation
const getGroupsByFormation = async (req, res) => {
  const { formation } = req.query;  // Récupérer la formation via le query parameter

  console.log("Formation demandée :", formation);  // Ajouter cette ligne pour déboguer

  if (!formation) {
    return res.status(400).json({ error: "Le paramètre 'formation' est requis." });
  }

  try {
    const result = await client.query(`
      SELECT g.id, g.nom
      FROM groupes g
      JOIN formations f ON g.formation_id = f.id
      WHERE f.nom = $1
    `, [formation]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aucun groupe trouvé pour cette formation." });
    }

    res.json(result.rows);  // Retourner les groupes de la formation sélectionnée
  } catch (err) {
    console.error("Erreur lors de la récupération des groupes :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des groupes." });
  }
};


module.exports = {
  addGroup,
  getGroupsByFormation,
  getFormations,
};
