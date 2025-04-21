import React, { useEffect, useState } from 'react';
import { players } from '../data/players';
import './Goals.css';

export default function GoalsChallenge() {
    
    const restartButton = document.querySelector('button');
    const textInputs = document.querySelectorAll('.inputs input');
    const imageContainer = document.querySelector('.image-container img');
    const textContainer = document.querySelector('.image-container p');
    const goalDisplay = document.querySelector('.goals-number');
    const help = document.querySelector('.help');
    const helpIcon = document.querySelector('.divp i');
    helpIcon.addEventListener('click', () => {
      help.classList.toggle('show');
      if (help.classList.contains('show')) {
        helpIcon.style.color = '#E1219E';
        help.style.display = 'block';
      } else {
        helpIcon.style.color = '#00aaff';
        help.style.display = 'none';
      }
    });

    let totalGoals = 0;
    let currentPlayer = null;
    let lockedInputs = 0;
    let rotationInterval;
    let rotationCount = 0;
    const MAX_ROTATIONS = 15;
    function startRotation() {
      rotationCount = 0;
      clearInterval(rotationInterval);
      
      rotationInterval = setInterval(() => {
        const randomNumber = Math.floor(Math.random() * players.length);
        currentPlayer = players[randomNumber];
        
        imageContainer.src = '../../public/icons_processed/processed_' + currentPlayer.name2 + '.png';
        textContainer.textContent = currentPlayer.name;
        
        rotationCount++;
        
        if (rotationCount >= MAX_ROTATIONS) {
          clearInterval(rotationInterval);
        }
      }, 200);

    }

    function handleInputClick(input) {
      if (input.dataset.locked === 'true') return;

      const multiplier = parseInt(input.dataset.mult);
      const playerGoals = parseInt(currentPlayer.goals);
      const goalsToAdd = playerGoals * multiplier;

      totalGoals += goalsToAdd;
      goalDisplay.textContent = `Goals : ${totalGoals}`;

      input.value = `${input.placeholder} ${currentPlayer.name} : ${goalsToAdd}`;
      input.style.textAlign = 'center';
      input.style.fontWeight = 'bold';

      input.dataset.locked = 'true';
      lockedInputs++;

      input.style.border = '0.15rem solid grey';
      input.style.background = 'rgba(0, 255, 170, 0.1)';
      input.style.color = '#6190C2';

// Vérification quand tous les inputs sont remplis
      if (lockedInputs === textInputs.length) {
        if (totalGoals >= 100000) {
          goalDisplay.textContent = `Goals : ${totalGoals} - Congratulations!`;
          goalDisplay.style.color = 'green';
          textInputs.forEach(input => {
            input.style.border = '0.15rem solid green';
            input.style.color = 'green';
          })
        } else {
          goalDisplay.textContent = `Goals : ${totalGoals} - You Lost!`;
          goalDisplay.style.color = 'red';
          textInputs.forEach(input => {
            input.style.border = '0.15rem solid red';
            input.style.color = 'red';
          })
        }
      } else {
        startRotation();
      }
    }

    textInputs.forEach(input => {
      input.addEventListener('click', () => handleInputClick(input));
    });

    restartButton.addEventListener('click', () => location.reload());

    startRotation();

  return (
    <section className="container">
      <div className="div1">
        <h1>100 000 GOALS CHALLENGE</h1>
      </div>
      <div className="divp">
        <i 
          className="bi bi-question-circle" 
          title="Help"
          style={{ color: "#00aaff" }}
        >
          Help
        </i>
        <p className="help" style={{ color: "#147668", fontFamily: "'Courier New', monospace" }}>
          <span style={{ color: "#147668" }}>Concept:</span><br />
          Click on the inputs to add goals.<br />
          Each input has a multiplier (1x, 2x, 3x, etc.).<br />
          The goal is to reach 100,000 goals.<br />
          Good luck!<br />
        </p>
      </div>

      <div className="div2">
        <button type="button" onClick={handleRestart}>
          <i className="fas fa-rotate-right icone"></i>
          Restart
        </button>
      </div>

      <div className="image-container">
        <img src="/icons_processed/processed_Ronaldo.png" alt="Player" />
        <p>{currentPlayer?.name || ''}</p>
      </div>

      <div className="inputs">
        {multipliers.map((mult, index) => (
          <input
            key={index}
            type="text"
            placeholder={placeholders[index]}
            data-mult={mult}
            value={inputStates[index].value}
            readOnly
            onClick={() => handleInputClick(index, mult)}
            style={{
              border: inputStates[index].locked
                ? result === 'win'
                  ? '0.15rem solid green'
                  : result === 'lose'
                  ? '0.15rem solid red'
                  : '0.15rem solid grey'
                : '',
              color: inputStates[index].locked
                ? result === 'win'
                  ? 'green'
                  : result === 'lose'
                  ? 'red'
                  : '#6190C2'
                : '',
              backgroundColor: inputStates[index].locked
                ? 'rgba(0, 255, 170, 0.1)'
                : '',
              cursor: inputStates[index].locked ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              fontWeight: inputStates[index].locked ? 'bold' : 'normal',
            }}
          />
        ))}
      </div>
      <p className="goals-number">
        Goals: {totalGoals}
        {result === 'win' && ' - Congratulations!'}
        {result === 'lose' && ' - You Lost!'}
      </p>
    </section>
  );
}
import default GoalsChallenge;
