import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

function Home() {
  const handleGoalsClick = () => {
    window.location.href = `./goals.html`;
  };
  const handleAssistsClick = () => {
    window.location.href = `./assists.html`;
  }

  const handleTrophiesClick = () => {
    window.location.href = `./trophies.html`;
  }

  return (
    <section
      className='section1'
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <h2>Welcome To My Football Challenges</h2>
      <div
        className='line'
        style={{
          width: '100vw',
          height: '0.4vh',
          backgroundColor: 'red',
          margin: '2vh 0',
        }}
      ></div>

      <div
        className="div1"
        style={{
          width: '90vw',
          height: '65vh',
          backgroundColor: 'black',
          display: 'flex',
          gap: '5vw',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2vh',
        }}
      >
        <div onClick={handleGoalsClick} className="div11" style={{ textAlign: 'center', fontSize: '3vw', color: 'white', textDecoration: 'none' }}>
          <img
            src="/objects/goals.jpg"
            alt="Goals"
            style={{ height: '40vh', width: '26vw', marginBottom: '1vh' }}
          />
          <p style={{ lineHeight: '6vh' }}>
            100 000 GOALS
            <br />
            CHALLENGE
          </p>
        </div>

        <div onClick={handleAssistsClick} className="div12" style={{ textAlign: 'center', fontSize: '3vw', color: 'white', textDecoration: 'none' }}>
          <img
            src="/objects/assists.png"
            alt="Assists"
            style={{ height: '40vh', width: '26vw', marginBottom: '1vh' }}
          />
          <p style={{ lineHeight: '6vh' }}>
            10 000 ASSISTS
            <br />
            CHALLENGE
          </p>
        </div>

        <div onClick={handleTrophiesClick} className="div13" style={{ textAlign: 'center', fontSize: '3vw', color: 'white', textDecoration: 'none' }}>
          <img
            src="/objects/trophies.png"
            alt="Trophies"
            style={{ height: '40vh', width: '26vw', marginBottom: '1vh' }}
          />
          <p style={{ lineHeight: '6vh' }}>
            1 000 TROPHIES
            <br />
            CHALLENGE
          </p>
        </div>
      </div>
    </section>
  );
}

export default Home;
