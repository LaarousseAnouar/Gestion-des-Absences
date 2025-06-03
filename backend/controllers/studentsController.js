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
    // Update the query to only select active students
    const result = await client.query(`
      SELECT 
        s.id, s.nom, s.prenom, s.email, s.status, s.image_student, 
        g.nom AS groupe, 
        f.nom AS formation
      FROM students s
      LEFT JOIN groupes g ON s.groupe_id = g.id
      LEFT JOIN formations f ON g.formation_id = f.id
      WHERE s.status = 'active'  -- Only fetch active students
      ORDER BY s.created_at DESC
    `);

    const students = result.rows.map(st => ({
      ...st,
      name: `${st.nom} ${st.prenom}`,
      photo: st.image_student ? `data:image/jpeg;base64,${st.image_student.toString('base64')}` : null,
      groupe: st.groupe,
      formation: st.formation
    }));

    res.json(students);  // Return the list of active students
  } catch (err) {
    console.error("Erreur dans getAllStudents :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des étudiants." });
  }
};

const blockStudent = async (req, res) => {
  const { id } = req.params;  // Récupérer l'id de l'étudiant
  const { status } = req.body;  // Le statut envoyé (ici, on va le définir sur 'bloqué')

  if (status !== 'blocked') {
    return res.status(400).json({ error: 'Le statut doit être "blocked"' });
  }

  try {
    const result = await client.query(
      'UPDATE students SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Étudiant non trouvé' });
    }

    res.json({ message: 'Étudiant bloqué avec succès', student: result.rows[0] });
  } catch (err) {
    console.error("Erreur lors du blocage de l'étudiant :", err);
    res.status(500).json({ error: "Erreur lors du blocage de l'étudiant." });
  }
};

const modifyStudent = async (req, res) => {
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  const { id } = req.params;
  const { nom, prenom, email, telephone, date_naissance } = req.body;
  const imageStudent = req.file ? req.file.buffer : null;

  try {
    // Récupérer l'étudiant actuel
    const studentResult = await client.query('SELECT * FROM students WHERE id = $1', [id]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Étudiant non trouvé' });
    }
    const student = studentResult.rows[0];

    // Mettre à jour seulement les champs envoyés (ou garder l'existant)
    const updatedNom = nom || student.nom;
    const updatedPrenom = prenom || student.prenom;
    const updatedEmail = email || student.email;
    const updatedTelephone = telephone || student.telephone;
    const updatedDateNaissance = date_naissance || student.date_naissance;
    const updatedImage = imageStudent || student.image_student;

    const result = await client.query(
      `UPDATE students SET 
        nom = $1, prenom = $2, email = $3, telephone = $4, 
        date_naissance = $5, image_student = $6, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $7 RETURNING *`,
      [
        updatedNom, updatedPrenom, updatedEmail, updatedTelephone, updatedDateNaissance, updatedImage, id
      ]
    );

    res.json({ message: 'Informations de l\'étudiant mises à jour avec succès', student: result.rows[0] });

  } catch (err) {
    console.error('Erreur lors de la modification de l\'étudiant :', err);
    res.status(500).json({ error: 'Erreur lors de la modification de l\'étudiant.' });
  }
};


module.exports = {
  addStudent,
  getAllStudents,
  blockStudent,
  modifyStudent,
};
