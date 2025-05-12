// CoursHoursController.js
const db = ('../config/db');  // Assuming you're using a database module (PostgreSQL, MySQL, etc.)

// Controller function to handle creating a new course entry
const createCoursHour = async (req, res) => {
  const { teacher_id, formation_id, groupe_id, start_time, end_time, pause_time, total_hours, date } = req.body;

  if (!teacher_id || !formation_id || !groupe_id || !start_time || !end_time || !pause_time || !total_hours || !date) {
    return res.status(400).send({ error: 'All fields are required' });
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


module.exports = { createCoursHour };
