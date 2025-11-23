import React, { useEffect, useState, useRef } from 'react';
import { players } from '../data/players.js';
import './Goals.css';
import { API_BASE_URL } from './apiConfig';

const GoalsChallenge = () => {
  const imageContainerRef = useRef(null);
  const textContainerRef = useRef(null);
  const goalDisplayRef = useRef(null);
  const helpRef = useRef(null);
  const helpIconRef = useRef(null);
  const goalsSpecificLeaderboardListRef = useRef(null);
  
  const [totalGoals, setTotalGoals] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [lockedInputs, setLockedInputs] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const rotationIntervalRef = useRef(null);
  const rotationCountRef = useRef(0);
  const MAX_ROTATIONS = 15;
  const textInputsRef = useRef([]);

  const startRotation = () => {
    setIsRotating(true);
    console.log("[startRotation] Appelée");
    rotationCountRef.current = 0;
    clearInterval(rotationIntervalRef.current);

    if (!players || !Array.isArray(players) || players.length === 0 || !imageContainerRef.current || !textContainerRef.current) {
      console.error("[startRotation] Préconditions non remplies (players, DOM elements?).");
      if(textContainerRef.current) textContainerRef.current.textContent = "Erreur Init!";
      return;
    }

    rotationIntervalRef.current = setInterval(() => {
      if (players.length === 0) { 
        clearInterval(rotationIntervalRef.current); 
        return; 
      }
      
      const randomNumber = Math.floor(Math.random() * players.length);
      const newPlayer = players[randomNumber];
      setCurrentPlayer(newPlayer);

      if (newPlayer && typeof newPlayer.name2 === 'string' && typeof newPlayer.name === 'string') {
        imageContainerRef.current.src = '/icons_processed/processed_' + newPlayer.name2 + '.png';
        textContainerRef.current.textContent = newPlayer.name;
      } else {
        console.error("[startRotation interval] Données joueur invalides.", newPlayer);
        textContainerRef.current.textContent = "?";
      }

      rotationCountRef.current++;
      if (rotationCountRef.current >= MAX_ROTATIONS) {
        setIsRotating(false);
        clearInterval(rotationIntervalRef.current);
        console.log("[startRotation] Rotation terminée. Joueur:", newPlayer ? newPlayer.name : "Aucun");
      }
    }, 200);
  };

  const updateUserScoreOnChallengeComplete = async (finalScore) => {
    console.log("[updateUserScoreOnChallengeComplete] APPELÉE. finalScore:", finalScore);
    const token = localStorage.getItem('token');
    console.log("[updateUserScoreOnChallengeComplete] Token:", token);
    
    if (!token) { 
      alert("Vous devez être connecté pour enregistrer votre score!"); 
      return; 
    }
    
    const payload = { score: finalScore, challengeType: "goals" }; // Utilisation du finalScore
    console.log("[updateUserScoreOnChallengeComplete] Payload:", payload);
    console.log("[updateUserScoreOnChallengeComplete] Tentative FETCH PUT...");
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/challenges/score`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        }, 
        body: JSON.stringify(payload)
      });
      
      console.log("[updateUserScoreOnChallengeComplete] Fetch Status:", response.status);
      
      let responseData;
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) { 
          responseData = await response.json(); 
        } else { 
          responseData = { message: await response.text() }; 
        }
        console.log("[updateUserScoreOnChallengeComplete] Réponse:", responseData);
      } catch (parseError) { 
        console.error("[updateUserScoreOnChallengeComplete] Erreur parsing:", parseError); 
        responseData = { message: "Réponse invalide" }; 
      }
      
      if (response.ok) {
        console.log("Score enregistré!"); 
        alert(`Score enregistré! Nouveau score: ${responseData.newScore || finalScore}`); // Affiche le bon score
        fetchAndDisplayGoalsPageLeaderboard();
      } else { 
        const errorMsg = responseData.error || responseData.message || `Erreur ${response.status}`; 
        console.error("Échec enregistrement:", errorMsg); 
        alert(`Échec enregistrement: ${errorMsg}`); 
      }
    } catch (networkError) { 
      console.error("[updateUserScoreOnChallengeComplete] Erreur réseau:", networkError); 
      alert("Erreur réseau. Voir console."); 
    }
    };
  const handleInputClick = (clickedInput, index) => {
    console.log("[handleInputClick] APPELÉE pour:", clickedInput.placeholder, "Locked:", clickedInput.dataset.locked);
    if (clickedInput.dataset.locked === 'true' || isRotating) { 
      console.log("[handleInputClick] Déjà locked."); 
      return; 
    }
    
    console.log("[handleInputClick] Joueur actuel:", currentPlayer);
    if (!currentPlayer || typeof currentPlayer.goals === 'undefined' || currentPlayer.goals === null) { 
      console.error("[handleInputClick] ERREUR: Données joueur invalides.", currentPlayer); 
      alert("Erreur données joueur!"); 
      return; 
    }
    
    const multiplier = parseInt(clickedInput.dataset.mult);
    const playerGoals = parseInt(currentPlayer.goals);
    console.log(`[handleInputClick] Mult: ${multiplier}, Goals: ${playerGoals}`);
    
    if (isNaN(playerGoals) || isNaN(multiplier)) { 
      console.error("[handleInputClick] ERREUR: goals ou multiplier NaN."); 
      alert("Erreur calcul!"); 
      return; 
    }
    
    const goalsToAdd = playerGoals * multiplier;
    console.log("[handleInputClick] Adding:", goalsToAdd);
    
    if (!Number.isFinite(goalsToAdd)) { 
      console.error("[handleInputClick] ERREUR: goalsToAdd NaN/Infinity."); 
      alert("Erreur calcul final!"); 
      return; 
    }
    
    const newTotalGoals = totalGoals + goalsToAdd;
    setTotalGoals(newTotalGoals);
    console.log("[handleInputClick] totalGoals:", newTotalGoals);
    
    clickedInput.value = `${clickedInput.placeholder} (${currentPlayer.name}) : ${goalsToAdd}`;
    clickedInput.dataset.locked = 'true';
    setLockedInputs(prev => prev + 1);
    console.log("[handleInputClick] lockedInputs:", lockedInputs + 1);

    const newLockedCount = lockedInputs + 1;
    if (newLockedCount === textInputsRef.current.length) {
      console.log("[handleInputClick] FIN DE PARTIE. totalGoals:", newTotalGoals);
      if (newTotalGoals >= 100000) {
        console.log("[handleInputClick] Victoire! Màj UI...");
        console.log("[handleInputClick] APPEL updateUserScoreOnChallengeComplete...");
        // On envoie le newTotalGoals qui inclut le dernier ajout
        updateUserScoreOnChallengeComplete(newTotalGoals);
      }
    } else {
      startRotation();
    }
    };
  const fetchAndDisplayGoalsPageLeaderboard = async () => {
    console.log("[fetchLeaderboard] Appelée");
    if(!goalsSpecificLeaderboardListRef.current) { 
      console.error("[fetchLeaderboard] Element introuvable."); 
      return; 
    }
    
    goalsSpecificLeaderboardListRef.current.innerHTML = '<li class="leaderboard-loading">Chargement...</li>';
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/challenges/leaderboard/goals`);
      console.log("[fetchLeaderboard] Statut:", response.status);
      
      if (!response.ok) { 
        goalsSpecificLeaderboardListRef.current.innerHTML = '<li class="leaderboard-empty-message">Erreur chargement</li>';
        return; 
      }
      
      const leaderboardData = await response.json();
      console.log("[fetchLeaderboard] Données:", leaderboardData);
      
      goalsSpecificLeaderboardListRef.current.innerHTML = '';
      
      const topScores = leaderboardData
        .filter(entry => entry.score > 100000)
        .slice(0, 3);
  
      if (topScores.length > 0) {
        topScores.forEach((entry, index) => {
          const li = document.createElement('li');
          li.innerHTML = `
            <span class="username">${escapeHTML(entry.username)}</span>
            <span class="score">${entry.score.toLocaleString()} goals</span>
          `;
          goalsSpecificLeaderboardListRef.current.appendChild(li);
        });
      } else {
        goalsSpecificLeaderboardListRef.current.innerHTML = '<li class="leaderboard-empty-message">No Score for the moment >100 000</li>';
      }
    } catch (error) {
      console.error("[fetchLeaderboard] Erreur:", error);
      goalsSpecificLeaderboardListRef.current.innerHTML = '<li class="leaderboard-empty-message">Erreur réseau</li>';
    }
  };

  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str || ""));
    return div.innerHTML;
  };

  const restartGame = () => {
    window.location.reload();
  };

  useEffect(() => {
    console.log(">>>>>> COMPONENT MOUNTED <<<<<<");
    fetchAndDisplayGoalsPageLeaderboard();
    startRotation();

    return () => {
      clearInterval(rotationIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    goalDisplayRef.current.style.background = 'none';
    goalDisplayRef.current.style.animation = 'none';
    if (goalDisplayRef.current) {
      goalDisplayRef.current.textContent = `Goals : ${totalGoals}`;
      
      if (lockedInputs === textInputsRef.current.length) {
        if (totalGoals >= 100000) {
          goalDisplayRef.current.style.color = 'green';
          textInputsRef.current.forEach(input => {
            input.style.border = '0.15rem solid green';
            input.style.color = 'green';
          });
        } else {
          goalDisplayRef.current.style.color = 'red';
          goalDisplayRef.current.textContent = `Goals : ${totalGoals} - You Lost!`;
          textInputsRef.current.forEach(input => {
            input.style.border = '0.15rem solid red';
            input.style.color = 'red';
          });
        }
      } else {
        goalDisplayRef.current.style.color = 'aquamarine';
      }
    }
  }, [totalGoals, lockedInputs]);

  return (
    <section className="container">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      <div className="div1">
        <h1>100 000 GOALS CHALLENGE</h1>
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
            The goal is to reach 100,000 goals before all inputs are used.<br />
            Good luck!
          </p>
        )}
      </div>
      <div className="challenge-leaderboard-container">
        <h3>Top Goals Scores (Objectif: 100 000+)</h3>
        <ol 
            ref={goalsSpecificLeaderboardListRef}
             className="challenge-leaderboard-list"
        >
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
          src="/icons_processed/processed_Ronaldo.png" 
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

      <div className="inputs">
        {[1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 7, 7, 8, 8, 10, 15, 20, 25, 30].map((mult, index) => {
          let placeholder;
          switch(mult) {
            case 1: placeholder = "Career"; break;
            case 2: placeholder = "Double"; break;
            case 3: placeholder = "Treple"; break;
            case 4: placeholder = "Quadruple"; break;
            case 5: placeholder = "xFive"; break;
            case 7: placeholder = "xSeven"; break;
            case 8: placeholder = "xEight"; break;
            case 10: placeholder = "xTen"; break;
            case 15: placeholder = "x15"; break;
            case 20: placeholder = "x20"; break;
            case 25: placeholder = "x25"; break;
            case 30: placeholder = "x30"; break;
            default: placeholder = "Career";
          }
          
          return (
            <input
              key={index}
              ref={el => textInputsRef.current[index] = el}
              data-mult={mult}
              type="text"
              placeholder={placeholder}
              readOnly
              onClick={(e) => handleInputClick(e.target, index)}
            />
          );
        })}
      </div>
      
      <p 
        ref={goalDisplayRef}
        style={{
          background: 'none',
          animation: 'none',
          textShadow: 'none',
          transition: 'none',
          transform: 'none',
          pointerEvents: 'none'
        }}
        className="goals-number"
      >
        Goals : {totalGoals}
      </p>
    </section>
  );
};

export default GoalsChallenge;
