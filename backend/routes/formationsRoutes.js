// backend/routes/formationsRoutes.js

const express = require('express');
const router = express.Router();
const client = require('../config/db');

// Récupérer toutes les formations
router.get("/formations", async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM formations');
    res.json(result.rows);  // Renvoie les formations en format JSON
  } catch (err) {
    console.error("Erreur lors de la récupération des formations :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des formations." });
  }
});

module.exports = router;
