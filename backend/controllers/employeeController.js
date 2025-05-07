// backend/controllers/employeeController.js

const bcrypt = require('bcryptjs');
const client = require('../config/db');
const multer = require('multer');

// Fonction pour ajouter un employé
const addEmployee = async (req, res) => {
  const { nom, prenom, email, password, fonction } = req.body;

  // Accès correct aux fichiers
  const image = req.files && req.files['image_employee'] ? req.files['image_employee'][0].buffer : null;  
  const emploiDuTemps = req.files && req.files['emploi_du_temps'] ? req.files['emploi_du_temps'][0].buffer : null;  

  try {
    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion dans la base de données
    const result = await client.query(
      'INSERT INTO employees (nom, prenom, email, password, fonction, image_employee, emploi_du_temps) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nom, prenom, email, hashedPassword, fonction, image, emploiDuTemps]
    );

    // Réponse avec les données de l'employé ajouté
    res.status(201).json(result.rows[0]);  
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur lors de l\'ajout de l\'employé');
  }
};

// Fonction pour récupérer le nombre d'employés
const getEmployeeCount = async (req, res) => {
  try {
    const result = await client.query('SELECT COUNT(*) FROM employees');
    res.json({ count: result.rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fonction pour récupérer les absences de la journée
const getDailyAbsences = async (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
  try {
    const result = await client.query(
      'SELECT COUNT(*) FROM attendance WHERE date = $1 AND status = $2',
      [today, 'absent']
    );
    res.json({ count: result.rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fonction pour récupérer la présence de la semaine
const getWeeklyPresence = async (req, res) => {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Dimanche de la semaine actuelle
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() - endOfWeek.getDay() + 6); // Samedi de la semaine actuelle

  try {
    const result = await client.query(
      'SELECT COUNT(*) FROM attendance WHERE date BETWEEN $1 AND $2 AND status = $3',
      [startOfWeek.toISOString().split('T')[0], endOfWeek.toISOString().split('T')[0], 'présent']
    );
    res.json({ count: result.rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Fonction pour récupérer tous les employés
const getAllEmployees = async (req, res) => {
  try {
    const result = await client.query(`
      SELECT id, nom, prenom, email, fonction, image_employee
      FROM employees
      WHERE isActive = TRUE
      ORDER BY createdAt DESC
    `);

    const employees = result.rows.map(emp => ({
      ...emp,
      name: `${emp.nom} ${emp.prenom}`,
      photo: emp.image_employee ? `data:image/jpeg;base64,${emp.image_employee.toString('base64')}` : null,
      fonction: emp.fonction // Assure-toi que "fonction" est bien récupéré
    }));

    res.json(employees);
  } catch (err) {
    console.error("Erreur dans getAllEmployees :", err);
    res.status(500).json({ error: 'Erreur lors du chargement des employés' });
  }
};

const getScheduleByEmail = async (req, res) => {
  const { email } = req.params; // Récupérer l'email du professeur

  try {
    const result = await client.query(
      `SELECT nom, prenom, email, image_employee, emploi_du_temps 
      FROM employees WHERE email = $1`, 
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }

    const { nom, prenom, image_employee, emploi_du_temps } = result.rows[0];

    // Conversion en base64 des images et emploi du temps
    const imageBase64 = image_employee ? Buffer.from(image_employee).toString('base64') : null;
    const emploiDuTempsBase64 = emploi_du_temps ? Buffer.from(emploi_du_temps).toString('base64') : null;

    res.json({
      nom,
      prenom,
      image: imageBase64,   // Image en base64
      emploiDuTemps: emploiDuTempsBase64 // Emploi du temps en base64
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des informations du professeur:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des informations' });
  }
};

// Exportation des fonctions
module.exports = {
  addEmployee,
  getEmployeeCount,
  getDailyAbsences,
  getWeeklyPresence,
  getAllEmployees,
  getScheduleByEmail
};
