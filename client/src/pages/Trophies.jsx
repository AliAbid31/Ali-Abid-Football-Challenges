import React, { useEffect, useState, useRef, useCallback } from 'react';
import { clubs } from '../data/clubs.js'; // Utilisation de clubs.js
import './Trophies.css'; // Assurez-vous d'avoir un fichier Trophies.css
import { API_BASE_URL } from './apiConfig';

const TrophiesChallenge = () => {
  // --- Références DOM ---
  const imageContainerRef = useRef(null);
  const textContainerRef = useRef(null);
  const trophiesDisplayRef = useRef(null); // Renommé
  const helpRef = useRef(null);
  const helpIconRef = useRef(null);
  const trophiesSpecificLeaderboardListRef = useRef(null); // Renommé

  // --- États ---
  const [totalTrophies, setTotalTrophies] = useState(0); // Renommé
  const [currentClub, setCurrentClub] = useState(null); // Renommé
  const [lockedInputsCount, setLockedInputsCount] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // --- Variables ---
  const rotationIntervalRef = useRef(null);
  const rotationCountRef = useRef(0);
  const MAX_ROTATIONS = 15;
  const textInputsRef = useRef([]);

  const gameInputsConfig = [
    { property: 'PLs', mult: 1, placeholder: "Premier-Leagues" },
    { property: 'PLs', mult: 2, placeholder: "2xPremier-Leagues" },
    { property: 'PLs', mult: 3, placeholder: "3xPremier-Leagues" },
    { property: 'Laliga', mult: 1, placeholder: "Laligas" },
    { property: 'Laliga', mult: 2, placeholder: "2xLaligas" },

    { property: 'Bundesliga', mult: 1, placeholder: "Bundesligas" },
    { property: 'Bundesliga', mult: 2, placeholder: "2xBundesligas" },
    { property: 'SerieA', mult: 1, placeholder: "SerieA" },
    { property: 'SerieA', mult: 2, placeholder: "2xSerieA" },
    { property: 'Ligue1', mult: 1, placeholder: "Ligue1" },

    { property: 'Ligue1', mult: 2, placeholder: "2xLigue1" },
    { property: 'ChampionsLeagues', mult: 1, placeholder: "Champions Leagues" },
    { property: 'ChampionsLeagues', mult: 2, placeholder: "2xChampions Leagues" },
    { property: 'Leagues', mult: 1, placeholder: "Leagues" }, // Nombre total de championnats nationaux
    { property: 'Leagues', mult: 2, placeholder: "2xLeagues" },

    { property: 'Leagues', mult: 3, placeholder: "3xLeagues" },
    { property: 'Leagues', mult: 4, placeholder: "4xLeagues" },
    { property: 'DomesticCups', mult: 1, placeholder: "Domestic Cups" },
    { property: 'DomesticCups', mult: 2, placeholder: "2xDomestic Cups" },
    { property: 'DomesticCups', mult: 3, placeholder: "3xDomestic Cups" },

    { property: 'InternationalCups', mult: 1, placeholder: "International Cups" },
    { property: 'InternationalCups', mult: 2, placeholder: "2xInternational Cups" },
    { property: 'Total', mult: 1, placeholder: "Total" }, // Total de tous les trophées
    { property: 'Total', mult: 1, placeholder: "Total" },
    { property: 'Total', mult: 1, placeholder: "Total" },
  ];
  const CHALLENGE_GOAL = 1000; // Objectif pour le challenge Trophies

  // --- Fonctions ---
  const startRotation = useCallback(() => {
    if (lockedInputsCount >= gameInputsConfig.length) {
        setIsRotating(false);
        return;
    }
    setIsRotating(true);
    rotationCountRef.current = 0;
    clearInterval(rotationIntervalRef.current);

    if (!clubs || !Array.isArray(clubs) || clubs.length === 0 || !imageContainerRef.current || !textContainerRef.current) {
      console.error("[startRotation] Préconditions non remplies (clubs, DOM elements?).");
      if(textContainerRef.current) textContainerRef.current.textContent = "Erreur Init!";
      setIsRotating(false);
      return;
    }

    rotationIntervalRef.current = setInterval(() => {
      const randomNumber = Math.floor(Math.random() * clubs.length);
      const newClubData = clubs[randomNumber];

      if (newClubData && typeof newClubData.name2 === 'string' && typeof newClubData.name === 'string') {
        imageContainerRef.current.src = `/modified_logos/${newClubData.name2}_60x60.png`;
        textContainerRef.current.textContent = newClubData.name;
      } else {
        imageContainerRef.current.src = '';
        textContainerRef.current.textContent = "?";
      }

      rotationCountRef.current++;
      if (rotationCountRef.current >= MAX_ROTATIONS) {
        clearInterval(rotationIntervalRef.current);
        setCurrentClub(newClubData); // Mettre à jour le club final ici
        setIsRotating(false);
        console.log("[startRotation] Rotation terminée. Club final:", newClubData ? newClubData.name : "Aucun");
      }
    }, 150);
  }, [lockedInputsCount, gameInputsConfig.length]);

  const handleInputClick = (clickedInput, index) => {
    if (clickedInput.dataset.locked === 'true' || isRotating) return;

    if (!currentClub) {
      alert("Veuillez attendre la fin de la sélection du club.");
      return;
    }

    const config = gameInputsConfig[index];
    const clubTrophies = parseInt(currentClub[config.property] || 0, 10); // Utilise la propriété de config, default à 0
    const multiplier = parseInt(config.mult, 10);

    if (isNaN(clubTrophies) || isNaN(multiplier)) {
      alert("Erreur de calcul des trophées (données invalides pour le club ou multiplicateur).");
      startRotation();
      return;
    }

    const trophiesToAdd = clubTrophies * multiplier;
    if (!Number.isFinite(trophiesToAdd)) {
      alert("Erreur de calcul final des trophées.");
      startRotation();
      return;
    }

    const newTotalTrophies = totalTrophies + trophiesToAdd;
    setTotalTrophies(newTotalTrophies);

    clickedInput.value = `${config.placeholder} (${currentClub.name}): ${trophiesToAdd.toLocaleString()}`;
    clickedInput.dataset.locked = 'true';

    const newLockedCount = lockedInputsCount + 1;
    setLockedInputsCount(newLockedCount);

    const allInputsProcessed = newLockedCount >= gameInputsConfig.length;
    if (allInputsProcessed) {
      setIsRotating(false);
      if (newTotalTrophies >= CHALLENGE_GOAL) {
        updateUserScoreOnChallengeComplete(newTotalTrophies);
      }
    } else {
      startRotation();
    }
  };

  const fetchAndDisplayTrophiesPageLeaderboard = useCallback(async () => { // Renommé
    if(!trophiesSpecificLeaderboardListRef.current) return;
    trophiesSpecificLeaderboardListRef.current.innerHTML = '<li class="leaderboard-loading">Chargement...</li>';
    try {
      const response = await fetch(`${API_BASE_URL}/auth/challenges/leaderboard/trophies`); // Endpoint pour trophies
      if (!response.ok) {
        trophiesSpecificLeaderboardListRef.current.innerHTML = `<li class="leaderboard-empty-message">Erreur (${response.status})</li>`;
        return;
      }
      const leaderboardData = await response.json();
      trophiesSpecificLeaderboardListRef.current.innerHTML = '';
      const topScores = leaderboardData.filter(entry => entry.score >= CHALLENGE_GOAL).slice(0, 3);
      if (topScores.length > 0) {
        topScores.forEach((entry) => {
          const li = document.createElement('li');
          li.innerHTML = `<span class="username">${escapeHTML(entry.username)}</span> <span class="score">${entry.score.toLocaleString()} trophées</span>`;
          trophiesSpecificLeaderboardListRef.current.appendChild(li);
        });
      } else {
        trophiesSpecificLeaderboardListRef.current.innerHTML = `<li class="leaderboard-empty-message">No Score for the moment >${CHALLENGE_GOAL.toLocaleString()}</li>`;
      }
    } catch (error) {
      if (trophiesSpecificLeaderboardListRef.current) {
          trophiesSpecificLeaderboardListRef.current.innerHTML = '<li class="leaderboard-empty-message">Erreur réseau</li>';
      }
    }
  }, [CHALLENGE_GOAL]);

  const updateUserScoreOnChallengeComplete = useCallback(async (finalScore) => {
    const token = localStorage.getItem('token');
    if (!token) { alert("Connectez-vous pour enregistrer le score !"); return; }
    const payload = { score: finalScore, challengeType: "trophies" }; // Type de challenge trophies
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
        alert(`Score enregistré! Nouveau score Trophées: ${responseData.newScore || finalScore}`);
        fetchAndDisplayTrophiesPageLeaderboard();
      } else {
        alert(`Échec enregistrement: ${responseData.error || responseData.message || response.status}`);
      }
    } catch (networkError) { alert("Erreur réseau. Voir console."); console.error(networkError); }
  }, [fetchAndDisplayTrophiesPageLeaderboard]);

  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ""));
    return div.innerHTML;
  };

  const restartGame = () => window.location.reload();

  // --- Effets ---
  useEffect(() => {
    fetchAndDisplayTrophiesPageLeaderboard();
    startRotation();
    return () => clearInterval(rotationIntervalRef.current);
  }, [fetchAndDisplayTrophiesPageLeaderboard, startRotation]);

  useEffect(() => {
    if (!trophiesDisplayRef.current || !textInputsRef.current.length) return;

    trophiesDisplayRef.current.textContent = `Trophies : ${totalTrophies.toLocaleString()}`;
    const allInputsFilled = lockedInputsCount >= gameInputsConfig.length;

    if (allInputsFilled) {
      setIsRotating(false);
      if (totalTrophies >= CHALLENGE_GOAL) {
        trophiesDisplayRef.current.style.color = 'lime';
        trophiesDisplayRef.current.textContent = `Trophies: ${totalTrophies.toLocaleString()} - CHALLENGE COMPLETED!`;
        textInputsRef.current.forEach(input => {
          if (input) { input.style.borderColor = 'lime'; input.style.color = 'lime'; }
        });
      } else {
        trophiesDisplayRef.current.style.color = '#ff4136';
        trophiesDisplayRef.current.textContent = `Trophies: ${totalTrophies.toLocaleString()} - You Lost!`;
        textInputsRef.current.forEach(input => {
          if (input) { input.style.borderColor = '#ff4136'; input.style.color = '#ff4136'; }
        });
      }
    } else {
      trophiesDisplayRef.current.style.color = 'aquamarine';
    }
  }, [totalTrophies, lockedInputsCount, gameInputsConfig.length, CHALLENGE_GOAL]);

  // --- Rendu ---
  return (
    <section className="container trophies-challenge-container">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      <div className="div1 challenge-title">
        <h1>{CHALLENGE_GOAL.toLocaleString()} TROPHIES CHALLENGE</h1>
      </div>

      <div className="divp" style={{background: 'none', transition: 'none', transform: 'none',}}>
        <div
          ref={helpIconRef}
          className="help-trigger"
          title="Help"
          onClick={() => setShowHelp(!showHelp)}
          style={{background: 'none', transition: 'none', transform: 'none', color: showHelp  ? 'pink' : '#00aaff',}}
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
            The goal is to reach 1,000 trophies before all inputs are used.<br />
            Good luck!
          </p>
        )}
      </div>

      <div className="challenge-leaderboard-container">
        <h3>Top Trophies Scores (Objectif: {CHALLENGE_GOAL.toLocaleString()}+)</h3>
        <ol ref={trophiesSpecificLeaderboardListRef} className="challenge-leaderboard-list">
          <li className="leaderboard-loading">Chargement...</li>
        </ol>
      </div>

      <div className="div2">
        <button type="button" onClick={restartGame}>
        <i className="fas fa-sync-alt" style={{ color: '#00aaff', fontSize: '1.2em' }}></i>
        <span style={{ marginLeft: '8px' }}>Restart</span>
        </button>
      </div>


      <div className="image-container player-display"> {/* Réutilisation de la classe player-display */}
        <img
          ref={imageContainerRef}
          src="/modified_logos/RealMadrid_60x60.png" // Image par défaut ou du premier club
          alt="Club Crest"
          className="player-image"
          style={{background: 'none',
            animation: 'none',
            textShadow: 'none',
            transition: 'none',
            transform: 'none',
            pointerEvents: 'none'}} // Réutilisation de la classe
        />
        <p ref={textContainerRef} className="player-name" style={{ background: 'none',
            animation: 'none',
            textShadow: 'none',
            transition: 'none',
            transform: 'none',
            pointerEvents: 'none'}}>
          {/* Nom du club */}
        </p>
      </div>

      <div className="trophies-inputs"> {/* Classe spécifique pour le layout des trophées */}
        {gameInputsConfig.map((item, index) => (
          <input
            key={index}
            ref={el => { if (el) textInputsRef.current[index] = el; }}
            data-property={item.property}
            data-mult={item.mult}
            type="text"
            placeholder={item.placeholder}
            readOnly
            onClick={(e) => handleInputClick(e.target, index)}
            className="game-input" // La classe principale pour le style
            data-locked="false"
          />
        ))}
      </div>

      <p ref={trophiesDisplayRef} className="trophies-number" style={{ background: 'none',
            animation: 'none',
            textShadow: 'none',
            transition: 'none',
            transform: 'none',
            pointerEvents: 'none'}}>
        Trophies : 0
      </p>
    </section>
  );
};

export default TrophiesChallenge;
