const client = require('../config/db');

// Fonction pour récupérer le statut de présence d'un étudiant/employé pour une date donnée
const getAttendanceStatus = async (req, res) => {
  const { id, date, type } = req.query; // id : student_id ou employee_id, type : 'student' ou 'employee'

  if (!id || !date || !type) {
    return res.status(400).json({ error: "id, date, et type sont requis." });
  }

  try {
    // Déterminer la table en fonction du type (étudiant ou employé)
    let table = type === 'employee' ? 'attendance_employees' : 'attendance_students';

    const result = await client.query(`
      SELECT status
      FROM ${table}
      WHERE ${type}_id = $1 AND date = $2
    `, [id, date]);

    // Si aucune présence n'est trouvée
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aucune présence trouvée pour cette date" });
    }

    // Retourner le statut (présent/absent)
    res.json({ status: result.rows[0].status });
  } catch (err) {
    console.error("Erreur lors de la récupération de la présence :", err);
    res.status(500).json({ error: "Erreur lors de la récupération du statut de présence." });
  }
};

// Fonction pour ajouter une nouvelle présence (étudiant/employé)
const addAttendance = async (req, res) => {
  const { id, date, status, note, type } = req.body; // Récupérer les informations depuis la requête

  if (!id || !date || !status || !note || !type) {
    return res.status(400).json({ error: "id, date, status, note, et type sont requis." });
  }

  try {
    // Déterminer la table et la colonne en fonction du type
    let table = type === 'employee' ? 'attendance_employees' : 'attendance_students';
    let column = type === 'employee' ? 'employee_id' : 'student_id';

    const result = await client.query(`
      INSERT INTO ${table} (${column}, date, status, note)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [id, date, status, note]);

    res.status(201).json({
      message: "Présence ajoutée avec succès",
      id: result.rows[0].id
    });
  } catch (err) {
    console.error("Erreur lors de l'ajout de la présence :", err);
    res.status(500).json({ error: "Erreur lors de l'ajout de la présence." });
  }
};



module.exports = {
  getAttendanceStatus,
  addAttendance
};
