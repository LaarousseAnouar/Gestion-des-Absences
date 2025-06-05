const client = require('../config/db');

// Fonction pour récupérer le statut de présence d'un étudiant/employé pour une date donnée et session (matin/soir)
const getAttendanceStatus = async (req, res) => {
  const { id, date, type, session } = req.query;

  if (!id || !date || !type || !session) {
    return res.status(400).json({ error: "id, date, type, et session sont requis." });
  }

  const validTypes = ['employee', 'student'];
  const typeLower = type.toLowerCase();

  if (!validTypes.includes(typeLower)) {
    return res.status(400).json({ error: "Type invalide. Utilisez 'employee' ou 'student'." });
  }

  const validSessions = ['matin', 'soir'];
  if (!validSessions.includes(session)) {
    return res.status(400).json({ error: "Session invalide. Utilisez 'matin' ou 'soir'." });
  }

  const table = typeLower === 'employee' ? 'attendance_employees' : 'attendance_students';
  const column = typeLower === 'employee' ? 'employee_id' : 'student_id';

  try {
    const result = await client.query(`
      SELECT status
      FROM ${table}
      WHERE ${column} = $1 AND date = $2 AND session = $3
    `, [id, date, session]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aucune présence trouvée pour cette date et session" });
    }

    res.json({ status: result.rows[0].status });
  } catch (err) {
    console.error("Erreur lors de la récupération de la présence :", err);
    res.status(500).json({ error: "Erreur lors de la récupération du statut de présence." });
  }
};

// Fonction pour ajouter une nouvelle présence (étudiant/employé) avec session
const addAttendance = async (req, res) => {
  const { id, date, status, note, type, session } = req.body; // On ajoute session

  if (!id || !date || !status || !type || !session) {
    return res.status(400).json({ error: "id, date, status, type, et session sont requis." });
  }

  const validSessions = ['matin', 'soir'];
  if (!validSessions.includes(session)) {
    return res.status(400).json({ error: "Session invalide. Utilisez 'matin' ou 'soir'." });
  }

  try {
    const table = type === 'employee' ? 'attendance_employees' : 'attendance_students';
    const column = type === 'employee' ? 'employee_id' : 'student_id';

    const result = await client.query(`
      INSERT INTO ${table} (${column}, date, status, note, session)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [id, date, status, note, session]);

    res.status(201).json({
      message: "Présence ajoutée avec succès",
      id: result.rows[0].id
    });
  } catch (err) {
    console.error("Erreur lors de l'ajout de la présence :", err);
    res.status(500).json({ error: "Erreur lors de l'ajout de la présence." });
  }
};

const updateAttendanceStatus = async (req, res) => {
  const { id, date, type, session, status } = req.body;

  if (!id || !date || !type || !session || !status) {
    return res.status(400).json({ error: "id, date, type, session, et status sont requis." });
  }

  const validTypes = ['employee', 'student'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: "Type invalide. Utilisez 'employee' ou 'student'." });
  }

  const validSessions = ['matin', 'soir'];
  if (!validSessions.includes(session)) {
    return res.status(400).json({ error: "Session invalide. Utilisez 'matin' ou 'soir'." });
  }

  const table = type === 'employee' ? 'attendance_employees' : 'attendance_students';
  const column = type === 'employee' ? 'employee_id' : 'student_id';

  try {
    const existing = await client.query(
      `SELECT id FROM ${table} WHERE ${column} = $1 AND date = $2 AND session = $3`,
      [id, date, session]
    );

    if (existing.rows.length > 0) {
      await client.query(
        `UPDATE ${table} SET status = $1 WHERE id = $2`,
        [status, existing.rows[0].id]
      );
    } else {
      await client.query(
        `INSERT INTO ${table} (${column}, date, session, status) VALUES ($1, $2, $3, $4)`,
        [id, date, session, status]
      );
    }

    res.json({ message: "Statut de présence mis à jour avec succès." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
  }
};
module.exports = {
  getAttendanceStatus,
  addAttendance,
  updateAttendanceStatus
};
