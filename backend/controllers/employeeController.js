// backend/controllers/employeeController.js

const bcrypt = require('bcryptjs');
const client = require('../config/db');
const multer = require('multer');

// Fonction pour ajouter un employé
const addEmployee = async (req, res) => {
  const { nom, prenom, email, password, fonction, formation_id } = req.body;

  // Accès aux fichiers
  const image = req.files && req.files['image_employee'] ? req.files['image_employee'][0].buffer : null;
  const emploiDuTemps = req.files && req.files['emploi_du_temps'] ? req.files['emploi_du_temps'][0].buffer : null;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertion avec formation_id
    const result = await client.query(
      `INSERT INTO employees (
        nom, prenom, email, password, fonction, image_employee, emploi_du_temps, formation_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nom, prenom, email, hashedPassword, fonction, image, emploiDuTemps, formation_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur lors de l'ajout de l'employé :", err);
    res.status(500).send("Erreur lors de l'ajout de l'employé");
  }
};

const tableMap = {
  students: 'attendance_students',
  employees: 'attendance_employees',
};
// Fonction pour récupérer le nombre d'employés
const getEmployeeCount = async (req, res) => {
  try {
    const result = await client.query('SELECT COUNT(*) FROM employees');
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDailyAbsences = async (req, res) => {
  const { type } = req.query;
  const tableName = tableMap[type];
  if (!tableName) return res.status(400).json({ error: 'Type must be students or employees' });

  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await client.query(
      `SELECT COUNT(*) FROM ${tableName} WHERE date = $1 AND status = 'absent'`,
      [today]
    );
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDailyPresence = async (req, res) => {
  const { type } = req.query;
  const tableName = tableMap[type];
  if (!tableName) return res.status(400).json({ error: 'Type must be students or employees' });

  const today = new Date().toISOString().split('T')[0];

  try {
    const result = await client.query(
      `SELECT COUNT(*) FROM ${tableName} WHERE date = $1 AND status = 'present'`,
      [today]
    );
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getWeeklyPresence = async (req, res) => {
  const { type } = req.query;
  const tableName = tableMap[type];
  if (!tableName) return res.status(400).json({ error: 'Type must be students or employees' });

  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startStr = startOfWeek.toISOString().split('T')[0];
  const endStr = endOfWeek.toISOString().split('T')[0];

  try {
    const result = await client.query(
      `SELECT COUNT(*) FROM ${tableName} WHERE date BETWEEN $1 AND $2 AND status = 'present'`,
      [startStr, endStr]
    );
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getWeeklyAbsences = async (req, res) => {
  const { type } = req.query;
  const tableName = tableMap[type];
  if (!tableName) return res.status(400).json({ error: 'Type must be students or employees' });

  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startStr = startOfWeek.toISOString().split('T')[0];
  const endStr = endOfWeek.toISOString().split('T')[0];

  try {
    const result = await client.query(
      `SELECT COUNT(*) FROM ${tableName} WHERE date BETWEEN $1 AND $2 AND status = 'absent'`,
      [startStr, endStr]
    );
    res.json({ count: parseInt(result.rows[0].count, 10) });
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
      `SELECT id, nom, prenom, email, image_employee, emploi_du_temps 
       FROM employees WHERE email = $1`, 
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }

    const { id, nom, prenom, image_employee, emploi_du_temps } = result.rows[0];

    // Conversion en base64 des images et emploi du temps
    const imageBase64 = image_employee ? Buffer.from(image_employee).toString('base64') : null;
    const emploiDuTempsBase64 = emploi_du_temps ? Buffer.from(emploi_du_temps).toString('base64') : null;

    res.json({
      id,                  // Ajout de l'id ici
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

// Fonction pour bloquer un employé
const blockEmployee = async (req, res) => {
 const { id } = req.params;
 const { isActive } = req.body; // booléen : true ou false

 try {
   const result = await client.query(
     'UPDATE employees SET isActive = $1 WHERE id = $2 RETURNING *',
     [isActive, id]
   );

   if (result.rows.length === 0) {
     return res.status(404).json({ error: 'Employee not found' });
   }

   res.json({ message: 'Employee status updated successfully', employee: result.rows[0] });
 } catch (err) {
   console.error("Error updating employee status:", err);
   res.status(500).json({ error: 'Error updating employee status' });
 }
};

const modifyEmployee = async (req, res) => {
 const { id } = req.params;
 const { nom, prenom, email, fonction, isActive } = req.body;
 const imageEmployee = req.files && req.files['image_employee'] ? req.files['image_employee'][0].buffer : null;

 try {
   const result = await client.query(
     `UPDATE employees SET
       nom = $1, prenom = $2, email = $3, fonction = $4, isActive = $5, image_employee = $6, updatedAt = CURRENT_TIMESTAMP
     WHERE id = $7 RETURNING *`,
     [nom, prenom, email, fonction, isActive, imageEmployee, id]
   );

   if (result.rows.length === 0) {
     return res.status(404).json({ error: 'Employee not found' });
   }

   res.json({ message: 'Employee information updated successfully', employee: result.rows[0] });
 } catch (err) {
   console.error("Error updating employee:", err);
   res.status(500).json({ error: 'Error updating employee' });
 }
};

const getProfessors = async (req, res) => {
  try {
    const result = await client.query(
      `SELECT id, nom, prenom, email, fonction, image_employee
       FROM employees
       WHERE fonction = $1 AND isActive = TRUE
       ORDER BY createdAt DESC`,
      ['professor']
    );

    // Formatage pour inclure la photo en base64 si existante
    const professors = result.rows.map(emp => ({
      id: emp.id,
      nom: emp.nom,
      prenom: emp.prenom,
      email: emp.email,
      fonction: emp.fonction,
      photo: emp.image_employee ? emp.image_employee.toString('base64') : null,
      name: `${emp.nom} ${emp.prenom}`
    }));

    res.json(professors);
  } catch (err) {
    console.error('Erreur lors de la récupération des professeurs:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des professeurs' });
  }
};

// Exportation des fonctions
module.exports = {
  addEmployee,
  getEmployeeCount,
  getDailyAbsences,
  getDailyPresence,
  getWeeklyPresence,
  getWeeklyAbsences,
  getAllEmployees,
  getScheduleByEmail,
  modifyEmployee,
  blockEmployee,
  getProfessors,
};
