// backend/routes/formationsRoutes.js

const express = require('express');
const router = express.Router();
const client = require('../config/db');

// Récupérer toutes les formations
router.get("/formations", async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM formations');
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des formations :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des formations." });
  }
});

// Récupérer les formations avec leurs groupes et nombre d'étudiants
router.get("/formations-groupes-etudiants", async (req, res) => {
  try {
    const query = `
      SELECT 
        f.nom AS formation_nom,
        g.nom AS groupe_nom,
        COUNT(s.id) AS nombre_etudiants_reels
      FROM formations f
      JOIN groupes g ON g.formation_id = f.id
      LEFT JOIN students s ON s.groupe_id = g.id AND s.status = 'active'
      GROUP BY f.nom, g.nom
      ORDER BY f.nom, g.nom
    `;
    const result = await client.query(query);

    const formations = {};
    result.rows.forEach(row => {
      if (!formations[row.formation_nom]) {
        formations[row.formation_nom] = [];
      }
      formations[row.formation_nom].push({
        groupe: row.groupe_nom,
        nombre_etudiants: Number(row.nombre_etudiants_reels)
      });
    });

    res.json(formations);
  } catch (err) {
    console.error('Erreur lors de la récupération formations et groupes :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


module.exports = router;
