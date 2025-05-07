// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const client = require('../config/db');  // Connexion à la base de données

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérification des administrateurs dans la table 'admins'
    let result = await client.query('SELECT * FROM admins WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      // Si l'email n'est pas trouvé dans les admins, vérifier dans les employés
      result = await client.query('SELECT * FROM employees WHERE email = $1', [email]);
    }

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);  // Vérification du mot de passe
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const role = user.fonction;  // 'fonction' correspond au rôle : admin, prof, direction pédagogique

    return res.status(200).json({
      success: true,
      data: {
        email: user.email,
        role: role,  // Le rôle de l'utilisateur (admin, prof, direction pédagogique)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Une erreur est survenue' });
  }
};

module.exports = { login };
