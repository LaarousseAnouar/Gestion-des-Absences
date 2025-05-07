// controllers/studentsController.js
const client = require('../config/db');
const multer = require('multer');

// Configuration de Multer pour stocker les images dans la mémoire
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// Ajouter un étudiant
const addStudent = async (req, res) => {
  const { nom, prenom, email, telephone, date_naissance, groupe_id, status } = req.body;
  const imageStudent = req.file ? req.file.buffer : null; // Si une image est téléchargée

  try {
    // Insérer un étudiant dans la base de données
    const result = await client.query(
      'INSERT INTO students (nom, prenom, email, telephone, date_naissance, groupe_id, status, image_student) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [nom, prenom, email, telephone, date_naissance, groupe_id, status, imageStudent]
    );

    res.status(201).json(result.rows[0]); // Retourner l'étudiant ajouté
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de l\'ajout de l\'étudiant');
  }
};


// Fonction pour récupérer tous les étudiants
const getAllStudents = async (req, res) => {
  try {
    const result = await client.query(`
      SELECT 
        s.id, s.nom, s.prenom, s.email, s.status, s.image_student, 
        g.nom AS groupe, 
        f.nom AS formation
      FROM students s
      LEFT JOIN groupes g ON s.groupe_id = g.id
      LEFT JOIN formations f ON g.formation_id = f.id
      ORDER BY s.created_at DESC
    `);

    const students = result.rows.map(st => ({
      ...st,
      name: `${st.nom} ${st.prenom}`,
      photo: st.image_student ? `data:image/jpeg;base64,${st.image_student.toString('base64')}` : null,
      groupe: st.groupe,
      formation: st.formation
    }));

    res.json(students);
  } catch (err) {
    console.error("Erreur dans getAllStudents :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des étudiants." });
  }
};





module.exports = {
  addStudent,
  getAllStudents,
};
