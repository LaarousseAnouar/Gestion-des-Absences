// CoursHoursController.js
const db = require('../config/db');  // Import correct du module de base de données

// Controller function to handle creating a new course entry
const createCoursHour = async (req, res) => {
  let { teacher_id, formation_id, groupe_id, start_time, end_time, pause_time, total_hours, date } = req.body;

  if (!teacher_id || !formation_id || !groupe_id || !start_time || !pause_time || !total_hours || !date) {
  return res.status(400).send({ error: 'All fields are required' });
}
// Note : on ne teste plus end_time ici, car elle peut être null au démarrage.


  // Conversion au format intervalle si total_hours est un nombre
  if (typeof total_hours === 'number') {
    const hours = Math.floor(total_hours);
    const minutes = Math.round((total_hours - hours) * 60);
    total_hours = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
  }

  try {
    const query = `
      INSERT INTO cours_hours (teacher_id, formation_id, groupe_id, start_time, end_time, pause_time, total_hours, date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id;
    `;
    const values = [teacher_id, formation_id, groupe_id, start_time, end_time, pause_time, total_hours, date];

    const result = await db.query(query, values);

    res.status(201).send({
      message: 'Cours ajouté avec succès',
      cours_id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du cours:', error);
    res.status(500).send({ error: 'Erreur serveur' });
  }
};

const updateCoursHour = async (req, res) => {
  const { id } = req.params;
  const { end_time, total_hours, pause_time } = req.body;

  if (!id || !end_time || !total_hours || !pause_time) {
    return res.status(400).send({ error: 'Tous les champs sont requis pour la mise à jour' });
  }

  try {
    const query = `
      UPDATE cours_hours 
      SET end_time = $1, total_hours = $2, pause_time = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [end_time, total_hours, pause_time, id];
    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).send({ error: 'Cours non trouvé' });
    }

    res.send({ message: 'Cours mis à jour avec succès', cours: result.rows[0] });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du cours:', error);
    res.status(500).send({ error: 'Erreur serveur' });
  }
};

const getCoursHoursByTeacher = async (req, res) => {
  const teacher_id = req.params.teacher_id;
  const date = req.query.date;  // récupère la date optionnelle depuis la query

  if (!teacher_id) {
    return res.status(400).send({ error: "teacher_id est requis" });
  }

  try {
    let query = `
      SELECT ch.*, f.nom AS formation_name, g.nom AS groupe_name
      FROM cours_hours ch
      LEFT JOIN formations f ON ch.formation_id = f.id
      LEFT JOIN groupes g ON ch.groupe_id = g.id
      WHERE ch.teacher_id = $1
    `;

    const params = [teacher_id];

    if (date) {
      query += ` AND ch.date = $2`;  // Filtrer par date
      params.push(date);
    }

    query += ` ORDER BY ch.date, ch.start_time`;

    const { rows } = await db.query(query, params);

    res.status(200).json(rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des heures de cours:", error);
    res.status(500).send({ error: "Erreur serveur" });
  }
};


module.exports = { 
  createCoursHour ,
  updateCoursHour,
  getCoursHoursByTeacher,
};
