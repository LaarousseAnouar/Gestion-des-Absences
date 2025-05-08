// backend/server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const groupRoutes = require('./routes/groupesRoutes');
const studentRoutes = require('./routes/studentsRoutes');
const authRoutes = require('./routes/authRoutes');
const formationsRoutes = require('./routes/formationsRoutes');  // Import de la route formations
const attendanceRoutes = require('./routes/attendanceRoutes');  // Assurez-vous que cette ligne est présente
const coursHoursRoutes = require('./routes/CoursHoursRoutes');  // Import des routes de CoursHours

const app = express();
const port = 3000;

app.use(cors());  // Autoriser les requêtes venant de notre frontend
app.use(bodyParser.json());

app.use('/api', authRoutes);  // Routes pour l'authentification
app.use('/api', adminRoutes);
app.use('/api', employeeRoutes);  // Intégration des routes pour les employés
app.use('/api', groupRoutes);
app.use('/api', studentRoutes);
app.use('/api', formationsRoutes);  // Intégration des routes pour les formations
app.use('/api', attendanceRoutes);  // Assurez-vous que cette ligne est présente pour utiliser les routes de présence
app.use('/api', coursHoursRoutes);  // Intégration des routes pour les heures de cours

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
