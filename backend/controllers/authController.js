// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const client = require('../config/db');  // Connexion à la base de données

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let result = await client.query('SELECT * FROM admins WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      result = await client.query('SELECT * FROM employees WHERE email = $1', [email]);
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);  
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const role = user.fonction; 
    return res.status(200).json({
      success: true,
      data: {
        email: user.email,
        role: role,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue' });
  }
};

module.exports = { login };
