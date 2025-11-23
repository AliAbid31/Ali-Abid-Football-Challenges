import React, { useEffect, useState, useRef, useCallback } from 'react'; // Ajout de useCallback
import { players } from '../data/players.js';
import './Assists.css';
import { API_BASE_URL } from './apiConfig';

const AssistsChallenge = () => {
  // --- Références DOM ---
  const imageContainerRef = useRef(null);
  const textContainerRef = useRef(null);
  const assistDisplayRef = useRef(null);
  const helpRef = useRef(null);
  const helpIconRef = useRef(null);
  const assistsSpecificLeaderboardListRef = useRef(null);

  // --- États ---
  const [totalAssists, setTotalAssists] = useState(0); // Renommé pour clarté
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [lockedInputsCount, setLockedInputsCount] = useState(0); // Renommé pour clarté
  const [showHelp, setShowHelp] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // --- Variables ---
  const rotationIntervalRef = useRef(null);
  const rotationCountRef = useRef(0);
  const MAX_ROTATIONS = 15; // ou 10 si vous préférez plus rapide
  const textInputsRef = useRef([]); // Pour stocker les références aux inputs

  // --- Fonctions ---

  // startRotation, fetchAndDisplayAssistsPageLeaderboard, updateUserScoreOnChallengeComplete, escapeHTML, restartGame
  // sont susceptibles d'être correctes, mais revoyons startRotation pour la gestion de isRotating

  const startRotation = useCallback(() => {
    // Vérifier si tous les inputs sont déjà bloqués
    if (lockedInputsCount >= textInputsRef.current.filter(Boolean).length) {
        console.log("[startRotation] Tous les inputs sont bloqués, rotation non démarrée.");
        setIsRotating(false); // S'assurer que isRotating est false
        return;
    }

    setIsRotating(true);
    console.log("[startRotation] Démarrage de la rotation.");
    rotationCountRef.current = 0;
    clearInterval(rotationIntervalRef.current); // Nettoyer l'intervalle précédent

    if (!players || !Array.isArray(players) || players.length === 0 || !imageContainerRef.current || !textContainerRef.current) {
      console.error("[startRotation] Préconditions non remplies (players, DOM elements?).");
      if(textContainerRef.current) textContainerRef.current.textContent = "Erreur Init!";
      setIsRotating(false); // Arrêter la rotation en cas d'erreur
      return;
    }

    rotationIntervalRef.current = setInterval(() => {
      if (players.length === 0) {
        clearInterval(rotationIntervalRef.current);
        setIsRotating(false);
        return;
      }

      const randomNumber = Math.floor(Math.random() * players.length);
      const newPlayer = players[randomNumber];
      // setCurrentPlayer(newPlayer); // On met à jour currentPlayer seulement à la fin de la rotation

      if (newPlayer && typeof newPlayer.name2 === 'string' && typeof newPlayer.name === 'string') {
        imageContainerRef.current.src = '/icons_processed/processed_' + newPlayer.name2 + '.png';
        textContainerRef.current.textContent = newPlayer.name;
      } else {
        console.error("[startRotation interval] Données joueur invalides pendant la rotation.", newPlayer);
        imageContainerRef.current.src = ''; // Image par défaut ou vide
        textContainerRef.current.textContent = "?";
      }

      rotationCountRef.current++;
      if (rotationCountRef.current >= MAX_ROTATIONS) {
        clearInterval(rotationIntervalRef.current);
        setCurrentPlayer(newPlayer); // Mettre à jour le joueur final ici
        setIsRotating(false);
        console.log("[startRotation] Rotation terminée. Joueur final:", newPlayer ? newPlayer.name : "Aucun");
      }
    }, 200); // Intervalle un peu plus rapide pour la rotation visuelle
  }, [lockedInputsCount]); // Dépend de lockedInputsCount pour savoir s'il faut démarrer

  const handleInputClick = (clickedInput, index) => {
    console.log(`[handleInputClick] Clic sur input ${index}, placeholder: ${clickedInput.placeholder}, locked: ${clickedInput.dataset.locked}, isRotating: ${isRotating}`);
    if (clickedInput.dataset.locked === 'true' || isRotating) {
      console.log("[handleInputClick] Action ignorée (input bloqué ou rotation en cours).");
      return;
    }

    if (!currentPlayer || typeof currentPlayer.assists === 'undefined' || currentPlayer.assists === null) {
      console.error("[handleInputClick] ERREUR: Données joueur (currentPlayer) invalides ou assists manquantes.", currentPlayer);
      alert("Erreur: Le joueur actuel n'a pas de statistiques d'assists valides. Veuillez réessayer.");
      startRotation(); // Relancer une rotation pour obtenir un nouveau joueur
      return;
    }

    const multiplier = parseInt(clickedInput.dataset.mult, 10);
    const playerAssists = parseInt(currentPlayer.assists, 10);

    console.log(`[handleInputClick] Joueur: ${currentPlayer.name}, Assists du joueur: ${playerAssists}, Multiplicateur: ${multiplier}`);

    if (isNaN(playerAssists) || isNaN(multiplier)) {
      console.error("[handleInputClick] ERREUR: playerAssists ou multiplier est NaN.", { playerAssists, multiplier });
      alert("Erreur de calcul des assists (données invalides).");
      startRotation(); // Tenter de corriger en obtenant un nouveau joueur
      return;
    }

    const assistsToAdd = playerAssists * multiplier;
    console.log("[handleInputClick] Assists à ajouter:", assistsToAdd);

    if (!Number.isFinite(assistsToAdd)) { // Vérifie NaN et Infinity
      console.error("[handleInputClick] ERREUR: assistsToAdd n'est pas un nombre fini.", assistsToAdd);
      alert("Erreur de calcul final des assists.");
      startRotation();
      return;
    }
    
    const newTotalAssists = totalAssists + assistsToAdd;
    setTotalAssists(newTotalAssists);
    console.log("[handleInputClick] Nouveau total d'assists:", newTotalAssists);

    clickedInput.value = `${clickedInput.placeholder} (${currentPlayer.name}): ${assistsToAdd.toLocaleString()}`;
    clickedInput.dataset.locked = 'true'; // Marquer comme bloqué
    
    const newLockedCount = lockedInputsCount + 1;
    setLockedInputsCount(newLockedCount); // Mettre à jour l'état du nombre d'inputs bloqués
    console.log("[handleInputClick] Nombre d'inputs bloqués:", newLockedCount);

    // Vérifier si tous les inputs sont maintenant bloqués
    const allInputsProcessed = newLockedCount >= textInputsRef.current.filter(Boolean).length;

    if (allInputsProcessed) {
      console.log("[handleInputClick] FIN DE PARTIE. Score final:", newTotalAssists);
      setIsRotating(false); // S'assurer que la rotation est arrêtée
      if (newTotalAssists >= 10000) { // Objectif du challenge Assists
        console.log("[handleInputClick] Victoire! Score atteint. Appel de updateUserScoreOnChallengeComplete...");
        updateUserScoreOnChallengeComplete(newTotalAssists);
      } else {
        console.log("[handleInputClick] Défaite. Score non atteint.");
        // La mise à jour de l'UI pour la défaite est gérée dans le useEffect [totalAssists, lockedInputsCount]
      }
    } else {
      console.log("[handleInputClick] Partie non terminée, lancement d'une nouvelle rotation.");
      startRotation(); // Lancer une nouvelle rotation pour le prochain input
    }
  };

  const fetchAndDisplayAssistsPageLeaderboard = useCallback(async () => {
    // ... (code existant, semble correct, mais s'assurer que les refs sont vérifiées)
    console.log("[fetchLeaderboard] Appelée");
    if(!assistsSpecificLeaderboardListRef.current) {
      console.error("[fetchLeaderboard] assistsSpecificLeaderboardListRef.current est null.");
      return;
    }
    assistsSpecificLeaderboardListRef.current.innerHTML = '<li class="leaderboard-loading">Chargement...</li>';
    try {
      const response = await fetch(`${API_BASE_URL}/auth/challenges/leaderboard/assists`);
      if (!response.ok) {
        assistsSpecificLeaderboardListRef.current.innerHTML = `<li class="leaderboard-empty-message">Erreur chargement (${response.status})</li>`;
        return;
      }
      const leaderboardData = await response.json();
      assistsSpecificLeaderboardListRef.current.innerHTML = '';
      const topScores = leaderboardData.filter(entry => entry.score >= 10000).slice(0, 3); // Objectif assists
      if (topScores.length > 0) {
        topScores.forEach((entry) => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="username">${escapeHTML(entry.username)}</span> <span class="score">${entry.score.toLocaleString()} assists</span>`;
          assistsSpecificLeaderboardListRef.current.appendChild(li);
        });
      } else {
        assistsSpecificLeaderboardListRef.current.innerHTML = '<li class="leaderboard-empty-message">No Score for the moment >10 000</li>'; // Objectif assists
      }
    } catch (error) {
      console.error("[fetchLeaderboard] Erreur:", error);
      if (assistsSpecificLeaderboardListRef.current) { // Vérifier à nouveau avant d'écrire
          assistsSpecificLeaderboardListRef.current.innerHTML = '<li class="leaderboard-empty-message">Erreur réseau</li>';
      }
    }
  }, []); // Ajout de useCallback pour la stabilité si utilisée dans useEffect

  const updateUserScoreOnChallengeComplete = useCallback(async (finalScore) => {
    // ... (code existant, semble correct, s'assurer que la logique de fetch est robuste)
    console.log("[updateUserScore] Score final:", finalScore);
    const token = localStorage.getItem('token');
    if (!token) { alert("Connectez-vous pour enregistrer le score !"); return; }
    const payload = { score: finalScore, challengeType: "assists" };
    try {
      const response = await fetch(`${API_BASE_URL}/auth/challenges/score`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      let responseData = { message: "Réponse non-JSON" };
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            responseData = await response.json();
        } else {
            responseData.message = await response.text();
        }
      } catch (e) { console.error("Erreur parsing réponse:", e); }

      if (response.ok) {
        alert(`Score enregistré! Nouveau score Assists: ${responseData.newScore || finalScore}`);
        fetchAndDisplayAssistsPageLeaderboard();
      } else {
        alert(`Échec enregistrement: ${responseData.error || responseData.message || response.status}`);
      }
    } catch (networkError) { alert("Erreur réseau. Voir console."); console.error(networkError); }
  }, [fetchAndDisplayAssistsPageLeaderboard]); // Dépend de fetchAndDisplayAssistsPageLeaderboard

  const escapeHTML = (str) => {
    // ... (code existant)
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ""));
    return div.innerHTML;
  };

  const restartGame = () => {
    window.location.reload(); // Simple, mais efficace. Pour une meilleure UX, réinitialiser les états.
  };

  // --- Effets ---
  useEffect(() => {
    console.log(">>>>>> COMPONENT MOUNTED <<<<<<");
    fetchAndDisplayAssistsPageLeaderboard();
    startRotation();

    return () => {
      console.log(">>>>>> COMPONENT UNMOUNTED <<<<<<");
      clearInterval(rotationIntervalRef.current);
    };
  }, [fetchAndDisplayAssistsPageLeaderboard, startRotation]); // Ajouter startRotation aux dépendances

  useEffect(() => {
    if (!assistDisplayRef.current || !textInputsRef.current) return;

    assistDisplayRef.current.textContent = `Assists : ${totalAssists.toLocaleString()}`;
    const allInputsFilled = lockedInputsCount >= textInputsRef.current.filter(Boolean).length;

    if (allInputsFilled) {
      console.log(`[useEffect UI Update] Tous les inputs remplis. totalAssists: ${totalAssists}`);
      setIsRotating(false); // S'assurer que la rotation est arrêtée
      if (totalAssists >= 10000) { // Objectif Assists
        assistDisplayRef.current.style.color = 'lime'; // Vert vif
        assistDisplayRef.current.textContent = `Assists: ${totalAssists.toLocaleString()} - CHALLENGE COMPLETED!`;
        textInputsRef.current.forEach(input => {
          if (input) {
            input.style.borderColor = 'lime';
            input.style.color = 'lime'; // Texte de l'input en vert
            // Peut-être ajouter un style pour le placeholder/valeur aussi
          }
        });
      } else {
        assistDisplayRef.current.style.color = '#ff4136'; // Rouge vif
        assistDisplayRef.current.textContent = `Assists: ${totalAssists.toLocaleString()} - You Lost!`;
        textInputsRef.current.forEach(input => {
          if (input) {
            input.style.borderColor = '#ff4136';
            input.style.color = '#ff4136'; // Texte de l'input en rouge
          }
        });
      }
    } else {
      assistDisplayRef.current.style.color = 'aquamarine'; // Couleur par défaut pendant le jeu
    }
  }, [totalAssists, lockedInputsCount]);


  // --- Rendu ---
  return (
    <section className="container assists-challenge-container"> {/* Classe spécifique pour la page assists */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      <div className="div1 challenge-title"> {/* Classe pour le titre */}
        <h1>10 000 ASSISTS CHALLENGE</h1>
      </div>

      <div className="divp" style={{background: 'none', transition: 'none', transform: 'none',}}>
        <div
          ref={helpIconRef}
          className="help-trigger"
          title="Help"
          onClick={() => setShowHelp(!showHelp)}
          style={{background: 'none', transition: 'none', transform: 'none', color: showHelp  ? 'pink' : '#00aaff'}}
        >
          <i className="fas fa-question-circle" style={{ color: showHelp  ? 'pink' : '#00aaff'}}></i> 
          <span>Help</span>
        </div>
        {showHelp && (
          <p
            ref={helpRef}
            className="help-text"
            style={{background: 'none', transition: 'none', transform: 'none', pointerEvents: 'none'}}
          >
            <span>Concept:</span><br />
            Click on the inputs to add assists based on the player's stats.<br />
            Each input has a multiplier (Career, Double, xFive, etc.).<br />
            The goal is to reach 10,000 assists before all inputs are used.<br />
            Good luck!
          </p>
        )}
      </div>

      <div className="challenge-leaderboard-container">
        <h3>Top Assists Scores (Objectif: 10 000+)</h3> {/* Objectif spécifique aux assists */}
        <ol
            ref={assistsSpecificLeaderboardListRef}
            className="challenge-leaderboard-list"
        >
          {/* Les LIs seront ajoutés par JS */}
          <li className="leaderboard-loading">Chargement...</li>
        </ol>
      </div>

      <div className="div2">
        <button type="button" onClick={restartGame}>
        <i className="fas fa-sync-alt" style={{ color: '#00aaff', fontSize: '1.2em' }}></i>
        <span style={{ marginLeft: '8px' }}>Restart</span>
        </button>
      </div>

      <div className="image-container">
        <img 
          ref={imageContainerRef}
          src="/icons_processed/processed_Messi.png" 
          alt="Player Image" 
          style={{background: 'none',
            animation: 'none',
            textShadow: 'none',
            transition: 'none',
            transform: 'none',
            pointerEvents: 'none'}}
        />
        <p ref={textContainerRef} style={{
                  background: 'none',
                  animation: 'none',
                  textShadow: 'none',
                  transition: 'none',
                  transform: 'none',
                  pointerEvents: 'none'
        }}></p>
      </div>

      <div className="inputs game-inputs"> {/* Classe pour les inputs du jeu */}
        {[
          { mult: 1, placeholder: "Career" }, { mult: 1, placeholder: "Career" },
          { mult: 2, placeholder: "Double" }, { mult: 2, placeholder: "Double" },
          { mult: 3, placeholder: "Treple" }, { mult: 3, placeholder: "Treple" }, // Corrigé: Treble au lieu de Treple
          { mult: 4, placeholder: "Quadruple" }, { mult: 4, placeholder: "Quadruple" },
          { mult: 5, placeholder: "xFive" }, { mult: 5, placeholder: "xFive" },
          { mult: 7, placeholder: "xSeven" },
          { mult: 10, placeholder: "xTen" }
        ].map((item, index) => (
          <input
            key={index}
            ref={el => { if (el) textInputsRef.current[index] = el; }} // S'assurer que el existe
            data-mult={item.mult}
            type="text"
            placeholder={item.placeholder}
            readOnly
            onClick={(e) => handleInputClick(e.target, index)}
            className="game-input" // Classe pour chaque input
            data-locked="false" // Initialiser data-locked
          />
        ))}
      </div>

      <p
        ref={assistDisplayRef}
        className="assists-number score-display"
        style={{                  background: 'none',
            animation: 'none',
            textShadow: 'none',
            transition: 'none',
            transform: 'none',
            pointerEvents: 'none'}} // Classe pour l'affichage du score
      >
        Assists : 0
      </p>
    </section>
  );
};

export default AssistsChallenge;
