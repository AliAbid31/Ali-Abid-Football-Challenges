const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Obtenir le token du header Authorization
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Le token est souvent envoyé comme "Bearer <token>"
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ msg: 'Token format is "Bearer <token>"' });
  }
  const token = tokenParts[1];

  if (!token) { // Double vérification si le split a échoué bizarrement
    return res.status(401).json({ msg: 'No token found after Bearer, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Ajoute les infos de l'utilisateur (id, username) à la requête
    next();
  } catch (err) {
    console.error('Token verification error:', err.message); // Pour le débogage serveur
    res.status(401).json({ msg: 'Token is not valid' });
  }
};