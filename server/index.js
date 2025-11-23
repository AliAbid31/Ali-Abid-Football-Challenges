// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Charger les variables d'environnement

// IMPORTER LES ROUTES APRÈS AVOIR CONFIGURÉ dotenv
const authRoutes = require('./routes/authRoutes');

const app = express();
const frontendAppUrl = process.env.FRONTEND_URL;

// Connexion MongoDB
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in .env file.');
  process.exit(1); // Quitter si l'URI n'est pas définie
}
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1); // Quitter en cas d'échec de connexion
  });

// Middlewares globaux
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ali-abid-football-challenges.vercel.app",
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // Pour parser le JSON dans le corps des requêtes
app.use(express.urlencoded({ extended: true }));
app.use('/auth', authRoutes); // Toutes les routes dans authRoutes seront préfixées par /api/auth
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err.message || err); // Log complet de l'erreur serveur
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not defined in .env file. Authentication will fail.');
  }
});
