// server/routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const blockedUsernamePatterns = [
    /Tbanyit/i, // Bloque si contient "Tbanyit" (insensible à la casse)
    /Benyat/i, 
    /Nik/i,
    /9a7b/i,
    /Benyet/i,
    /7at/i,
    // <-- AJOUTÉ : Bloque si contient "Benyat" (insensible à la casse)
    // Ajoute d'autres patterns ici si besoin, ex: /autreMotBloque/i
];

router.post('/register', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters long' });

  // Vérification de la liste noire
  for (const pattern of blockedUsernamePatterns) {
    if (pattern.test(username)) {
      console.log(`Tentative d'inscription bloquée pour username '${username}' correspondant au pattern: ${pattern}`);
      return res.status(403).json({ error: 'There is a problem in our Website.' }); // 403 Forbidden
    }
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    // ... gestion des erreurs existante ...
    next(error);
  }
});

// POST /login (sera /api/auth/login)
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid username' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { user: { id: user.id, username: user.username } };
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("FATAL ERROR: JWT_SECRET is not defined in .env file");
      return res.status(500).json({ error: 'Server configuration error' });
    }

    jwt.sign(payload, jwtSecret, { expiresIn: '24h' }, (err, token) => {
      if (err) { // Si jwt.sign a une erreur, la passer à next
        return next(err);
      }
      res.json({
        token,
        username: user.username,
        goalsScore: user.goalsScore,
        assistsScore: user.assistsScore,
        trophiesScore: user.trophiesScore,
        message: 'Logged in successfully'
      });
    });
  } catch (error) {
    next(error);
  }
});

// GET /me (sera /api/auth/me)
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    res.json({
      id: user.id,
      username: user.username,
      goalsScore: user.goalsScore,
      assistsScore: user.assistsScore,
      trophiesScore: user.trophiesScore
    });
  } catch (err) {
    next(err);
  }
});
router.put('/challenges/score', authMiddleware, async (req, res, next) => {
  // --- Récupération des données ---
  const { challengeType, score } = req.body; // OK. 'score' contient totalGoals.
  const userId = req.user.id; // OK, fourni par authMiddleware.

  // --- Logging Initial ---
  // CORRECTION 1: Le texte du log doit indiquer PUT
  // CORRECTION 2: Le deuxième log affichait 'score' au lieu de 'userId'
  console.log(`BACKEND: PUT /api/auth/challenges/score - User: ${userId}, Type: ${challengeType}, Score Submitted (totalGoals): ${score}`);
  console.log(`BACKEND: User ID from token: ${userId}`); // CORRIGÉ

  // --- Validations des entrées ---
  if (!['goals', 'assists', 'trophies'].includes(challengeType)) {
    console.warn(`BACKEND: Invalid challenge type received: ${challengeType}`); // Log l'erreur pour débogage
    return res.status(400).json({ error: 'Invalid challenge type' });
  }
  // Vérification que score est bien un nombre fini (gère NaN, Infinity)
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    console.warn(`BACKEND: Invalid score value received: ${score}, Type: ${typeof score}`); // Log l'erreur
    return res.status(400).json({ error: 'Invalid score value submitted' });
  }
  // Optionnel mais recommandé: Vérifier que le score n'est pas négatif
  if (score < 0) {
     console.warn(`BACKEND: Negative score received: ${score}`);
     return res.status(400).json({ error: 'Score cannot be negative' });
  }


  try {
    // --- Récupération de l'utilisateur ---
    const user = await User.findById(userId); // OK
    if (!user) {
      console.warn(`BACKEND: User not found with ID: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    let updatedScoreField;
    let scoreUpdated = false;

    // --- Logique de mise à jour par type de challenge ---
    if (challengeType === 'goals') {
      updatedScoreField = 'goalsScore'; // Définir le champ cible
      console.log(`BACKEND (goals): Checking score. User: ${user.username} (${userId}), Submitted (totalGoals): ${score}, Existing ${updatedScoreField}: ${user[updatedScoreField]}`);
      // Condition: Victoire ET (pas de score précédent OU meilleur score)
      if (score >= 1 && (!user[updatedScoreField] || score > user[updatedScoreField])) {
        console.log('hhhhhh');
        user[updatedScoreField] = score; // Mise à jour
        scoreUpdated = true;
        console.log(`BACKEND (goals): ${updatedScoreField} will be updated to ${score} for user ${user.username}`);
      } else {
        console.log(`BACKEND (goals): ${updatedScoreField} will NOT be updated for user ${user.username}. Condition not met (Submitted: ${score}, Existing: ${user[updatedScoreField]})`);
      }

    } else if (challengeType === 'assists') {
      updatedScoreField = 'assistsScore';
      const assistWinCondition = 10000; // Exemple de seuil pour assists
      console.log(`BACKEND (assists): Checking score. User: ${user.username} (${userId}), Submitted: ${score}, Existing ${updatedScoreField}: ${user[updatedScoreField]}`);
      // Adapter la condition si nécessaire (par exemple, seuil de victoire)
      if (score >= assistWinCondition && (!user[updatedScoreField] || score > user[updatedScoreField])) {
        user[updatedScoreField] = score;
        scoreUpdated = true;
        console.log(`BACKEND (assists): ${updatedScoreField} will be updated to ${score} for user ${user.username}`);
      } else {
         console.log(`BACKEND (assists): ${updatedScoreField} will NOT be updated for user ${user.username}. Condition not met (Submitted: ${score}, Existing: ${user[updatedScoreField]})`);
      }

    } else if (challengeType === 'trophies') {
      updatedScoreField = 'trophiesScore';
      const trophyWinCondition = 1000; // Exemple de seuil pour trophies
       console.log(`BACKEND (trophies): Checking score. User: ${user.username} (${userId}), Submitted: ${score}, Existing ${updatedScoreField}: ${user[updatedScoreField]}`);
      // Adapter la condition
      if (score >= trophyWinCondition && (!user[updatedScoreField] || score > user[updatedScoreField])) {
        user[updatedScoreField] = score;
        scoreUpdated = true;
        console.log(`BACKEND (trophies): ${updatedScoreField} will be updated to ${score} for user ${user.username}`);
      } else {
         console.log(`BACKEND (trophies): ${updatedScoreField} will NOT be updated for user ${user.username}. Condition not met (Submitted: ${score}, Existing: ${user[updatedScoreField]})`);
      }
    }
    // NOTE: Si un nouveau challengeType est ajouté, il faut ajouter un 'else if' ici.

    // --- Sauvegarde et Réponse ---
    if (scoreUpdated) {
      console.log(`BACKEND: Attempting to save user ${user.username} (${userId})...`);
      await user.save(); // Sauvegarde effective dans la base de données
      console.log(`BACKEND: Score successfully updated for ${user.username}. New ${updatedScoreField}: ${user[updatedScoreField]}`);
      res.json({ // Réponse de succès
        message: `Meilleur score pour ${challengeType} mis à jour!`,
        challengeType,
        newScore: user[updatedScoreField], // Important: renvoyer la valeur ACTUELLE de la BDD
        // Renvoyer tous les scores peut être utile au frontend
        goalsScore: user.goalsScore,
        assistsScore: user.assistsScore,
        trophiesScore: user.trophiesScore
      });
    } else {
      console.log(`BACKEND: Score not updated in DB for ${user.username} (${userId}) because 'scoreUpdated' is false.`);
      res.json({ // Réponse indiquant que la mise à jour n'était pas nécessaire
        message: `Score pour ${challengeType} non mis à jour (le score soumis n'est pas meilleur ou ne remplit pas les conditions).`,
        challengeType,
        currentScore: user[updatedScoreField], // Score actuel inchangé
        goalsScore: user.goalsScore,
        assistsScore: user.assistsScore,
        trophiesScore: user.trophiesScore
      });
    }
  } catch (error) {
    // --- Gestion des Erreurs ---
    // Log détaillé de l'erreur côté serveur
    console.error(`BACKEND Error in PUT /challenges/score for user ${userId}:`, error.message || error);
    // Si c'est une erreur de validation Mongoose, elle peut contenir plus de détails
    if (error.name === 'ValidationError') {
        // Vous pourriez extraire les messages spécifiques des champs ici
        console.error("Validation Errors:", error.errors);
        return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    // Passer l'erreur au gestionnaire d'erreurs global d'Express
    next(error);
  }
});
// GET /challenges/leaderboard/:challengeType (sera /api/auth/challenges/leaderboard/:challengeType)
// Garder uniquement cette version avec scoreThreshold
router.get('/challenges/leaderboard/:challengeType', async (req, res, next) => {
  const { challengeType } = req.params;
  console.log(`BACKEND: GET /api/auth/challenges/leaderboard/${challengeType}`); // Log
  let sortField;
  let scoreThreshold;

  if (challengeType === 'goals') {
    sortField = 'goalsScore';
    scoreThreshold = 100000;
  } else if (challengeType === 'assists') {
    sortField = 'assistsScore';
    scoreThreshold = 10000;
  } else if (challengeType === 'trophies') {
    sortField = 'trophiesScore';
    scoreThreshold = 1000;
  } else {
    return res.status(400).json({ error: 'Invalid challenge type for leaderboard' });
  }

  try {
    const topUsers = await User.find({ [sortField]: { $gte: scoreThreshold } })
      .sort({ [sortField]: -1 })
      .limit(3)
      .select(`username ${sortField}`);

    const leaderboardData = topUsers.map(user => ({
      username: user.username,
      score: user[sortField]
    }));
    console.log(`BACKEND: Leaderboard data for ${challengeType}:`, leaderboardData); // Log
    res.json(leaderboardData);
  } catch (error) {
    console.error(`BACKEND: Error fetching ${challengeType} leaderboard:`, error);
    next(error);
  }
});
router.post('/challenges/score', authMiddleware, async (req, res, next) => {
  const { challengeType } = req.body; // Récupère SEULEMENT challengeType
  const userId = req.user.id;

  console.log(`BACKEND: POST /api/auth/challenges/score (from Home.jsx) - User: ${userId}, Type: ${challengeType}`);

  if (!['goals', 'assists', 'trophies'].includes(challengeType)) {
      return res.status(400).json({ error: 'Invalid challenge type' });
  }

  try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      // --- ATTENTION : Logique différente de la route PUT ---
      // Cette route, appelée depuis Home.jsx, ne reçoit PAS de score.
      // Que doit-elle faire ? Incrémenter un compteur ?
      // Exemple : Incrémenter le score existant (si c'est l'intention)
      let updated = false;
      if (challengeType === 'goals') {
          user.goalsScore = (user.goalsScore || 0) + 1; // Incrémente juste
          updated = true;
      } else if (challengeType === 'assists') {
          user.assistsScore = (user.assistsScore || 0) + 1;
          updated = true;
      } else if (challengeType === 'trophies') {
          user.trophiesScore = (user.trophiesScore || 0) + 1;
          updated = true;
      }

      if (updated) {
          await user.save();
          console.log(`BACKEND: Score incremented for ${user.username} for challenge ${challengeType}`);
          // Renvoyer les scores mis à jour pour setCurrentUser
          res.json({
              message: `Score pour ${challengeType} incrémenté!`,
              goalsScore: user.goalsScore,
              assistsScore: user.assistsScore,
              trophiesScore: user.trophiesScore
          });
      } else {
           res.status(400).json({ error: 'Challenge type non géré pour l\'incrémentation' });
      }

  } catch (error) {
      console.error("BACKEND Error in POST /challenges/score (increment):", error);
      next(error);
  }
});

module.exports = router;
