const express = require('express');
const PasswordReset = require('../models/PasswordReset');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const bcrypt = require('bcryptjs'); // ou bcrypt

router.post('/register', async (req, res, next) => {
  const { username, email, password } = req.body;
  console.log('📧 Register attempt - Email:', email);

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }]  
    });
    
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // SUPPRIMEZ le hachage ici - le middleware s'en occupe
    const newUser = new User({ 
      username, 
      email, 
      password // ← Envoyez le mot de passe en clair, le middleware le hachera
    }); 
    
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
});

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

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Password reset attempt for non-existent email: ${email}`);
      return res.status(200).json({ message: 'If a user with this email exists, an email will be sent.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000; 

    await new PasswordReset({ email, token, expires }).save();
    console.log(`Reset token created for ${email}`);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
      from: `Team <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset - Football Challenges',
      html: `
        <p>Hello ${user.username},</p>
        <p>You asked to reset your password.</p>
        <p>Please click on the link sent below to choice a new password. This link will expire in one hour.</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Password Reset</a>
        <p>If you did not initiate this request, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${user.email}`);

    res.status(200).json({ message: 'If a user with this email exists, an email will be sent.' });

  } catch (error) {
    console.error('❌ Error in /forgot-password:', error);
    res.status(500).json({ error: 'internal server Error' });
  }
});


router.post('/reset-password/:token', async (req, res) => {
  try {
    const resetRequest = await PasswordReset.findOne({
      token: req.params.token,
      expires: { $gt: Date.now() }
    });

    if (!resetRequest) {
      return res.status(400).json({ error: 'Lien invalide ou expiré' });
    }

    const { newPassword } = req.body;

    const user = await User.findOne({ email: resetRequest.email });

    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }
    
    user.password = newPassword;
    await user.save();

    await PasswordReset.deleteOne({ token: req.params.token });
    
    res.status(200).json({ message: 'Password Updated successfully' });

  } catch (error) {
    console.error('Error in /reset-password:', error);
    res.status(500).json({ error: 'Error in the server' });
  }
});

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
  const { challengeType, score } = req.body; 
  const userId = req.user.id; 

  console.log(`BACKEND: PUT /api/auth/challenges/score - User: ${userId}, Type: ${challengeType}, Score Submitted (totalGoals): ${score}`);
  console.log(`BACKEND: User ID from token: ${userId}`); // CORRIGÉ

  if (!['goals', 'assists', 'trophies'].includes(challengeType)) {
    console.warn(`BACKEND: Invalid challenge type received: ${challengeType}`); 
    return res.status(400).json({ error: 'Invalid challenge type' });
  }
  if (typeof score !== 'number' || !Number.isFinite(score)) {
    console.warn(`BACKEND: Invalid score value received: ${score}, Type: ${typeof score}`); 
    return res.status(400).json({ error: 'Invalid score value submitted' });
  }
  if (score < 0) {
     console.warn(`BACKEND: Negative score received: ${score}`);
     return res.status(400).json({ error: 'Score cannot be negative' });
  }


  try {
    const user = await User.findById(userId); 
    if (!user) {
      console.warn(`BACKEND: User not found with ID: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    let updatedScoreField;
    let scoreUpdated = false;

    if (challengeType === 'goals') {
      updatedScoreField = 'goalsScore'; 
      console.log(`BACKEND (goals): Checking score. User: ${user.username} (${userId}), Submitted (totalGoals): ${score}, Existing ${updatedScoreField}: ${user[updatedScoreField]}`);
      if (score >= 1 && (!user[updatedScoreField] || score > user[updatedScoreField])) {
        console.log('hhhhhh');
        user[updatedScoreField] = score;
        scoreUpdated = true;
        console.log(`BACKEND (goals): ${updatedScoreField} will be updated to ${score} for user ${user.username}`);
      } else {
        console.log(`BACKEND (goals): ${updatedScoreField} will NOT be updated for user ${user.username}. Condition not met (Submitted: ${score}, Existing: ${user[updatedScoreField]})`);
      }

    } else if (challengeType === 'assists') {
      updatedScoreField = 'assistsScore';
      const assistWinCondition = 10000; 
      console.log(`BACKEND (assists): Checking score. User: ${user.username} (${userId}), Submitted: ${score}, Existing ${updatedScoreField}: ${user[updatedScoreField]}`);
      if (score >= assistWinCondition && (!user[updatedScoreField] || score > user[updatedScoreField])) {
        user[updatedScoreField] = score;
        scoreUpdated = true;
        console.log(`BACKEND (assists): ${updatedScoreField} will be updated to ${score} for user ${user.username}`);
      } else {
         console.log(`BACKEND (assists): ${updatedScoreField} will NOT be updated for user ${user.username}. Condition not met (Submitted: ${score}, Existing: ${user[updatedScoreField]})`);
      }

    } else if (challengeType === 'trophies') {
      updatedScoreField = 'trophiesScore';
      const trophyWinCondition = 1000; 
       console.log(`BACKEND (trophies): Checking score. User: ${user.username} (${userId}), Submitted: ${score}, Existing ${updatedScoreField}: ${user[updatedScoreField]}`);
      if (score >= trophyWinCondition && (!user[updatedScoreField] || score > user[updatedScoreField])) {
        user[updatedScoreField] = score;
        scoreUpdated = true;
        console.log(`BACKEND (trophies): ${updatedScoreField} will be updated to ${score} for user ${user.username}`);
      } else {
         console.log(`BACKEND (trophies): ${updatedScoreField} will NOT be updated for user ${user.username}. Condition not met (Submitted: ${score}, Existing: ${user[updatedScoreField]})`);
      }
    }
    if (scoreUpdated) {
      console.log(`BACKEND: Attempting to save user ${user.username} (${userId})...`);
      await user.save(); 
      console.log(`BACKEND: Score successfully updated for ${user.username}. New ${updatedScoreField}: ${user[updatedScoreField]}`);
      res.json({
        message: `Meilleur score pour ${challengeType} mis à jour!`,
        challengeType,
        newScore: user[updatedScoreField], 
        goalsScore: user.goalsScore,
        assistsScore: user.assistsScore,
        trophiesScore: user.trophiesScore
      });
    } else {
      console.log(`BACKEND: Score not updated in DB for ${user.username} (${userId}) because 'scoreUpdated' is false.`);
      res.json({ 
        message: `Score pour ${challengeType} non mis à jour (le score soumis n'est pas meilleur ou ne remplit pas les conditions).`,
        challengeType,
        currentScore: user[updatedScoreField], 
        goalsScore: user.goalsScore,
        assistsScore: user.assistsScore,
        trophiesScore: user.trophiesScore
      });
    }
  } catch (error) {
    console.error(`BACKEND Error in PUT /challenges/score for user ${userId}:`, error.message || error);
    if (error.name === 'ValidationError') {
        console.error("Validation Errors:", error.errors);
        return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    next(error);
  }
});
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
  const { challengeType } = req.body; 
  const userId = req.user.id;

  console.log(`BACKEND: POST /api/auth/challenges/score (from Home.jsx) - User: ${userId}, Type: ${challengeType}`);

  if (!['goals', 'assists', 'trophies'].includes(challengeType)) {
      return res.status(400).json({ error: 'Invalid challenge type' });
  }

  try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      let updated = false;
      if (challengeType === 'goals') {
          user.goalsScore = (user.goalsScore || 0) + 1; 
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
