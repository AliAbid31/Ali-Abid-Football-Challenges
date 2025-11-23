import React, { useState, useEffect, useCallback } from 'react';
import './Home.css';
import { FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './apiConfig';
import axios from "axios";
import { useContext } from "react";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('welcome');
  const [formData, setFormData] = useState({ username: '', email: '', password: ''});
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingLeaderboards, setIsLoadingLeaderboards] = useState(true);

  const [leaderboard, setLeaderboard] = useState({
    goals: [],
    assists: [],
    trophies: []
  });
  const navigate = useNavigate();


  // --- FONCTION DE DECONNEXION ---
  const handleLogout = useCallback(() => {
    console.log("handleLogout - CALLED");
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setAuthMode('welcome');
  }, []);

  // --- useEffect pour valider le token ET charger les infos utilisateur ---
  useEffect(() => {
    // ... (logique existante, semble correcte)
    console.log("useEffect [validateTokenAndSetUser] - MOUNT or update");
    const validateTokenAndSetUser = async () => {
      console.log("validateTokenAndSetUser FFF - START");
      setIsLoadingUser(true);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log("validateTokenAndSetUser - Token found, fetching /me");
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            console.log("validateTokenAndSetUser - /me OK, userData:", userData);
            setIsLoggedIn(true);
            setCurrentUser({
              username: userData.username,
              goalsScore: userData.goalsScore || 0,
              assistsScore: userData.assistsScore || 0,
              trophiesScore: userData.trophiesScore || 0
            });
          } else {
            console.log("validateTokenAndSetUser - /me FAILED, status:", res.status);
            const errorText = await res.text();
            console.log("validateTokenAndSetUser - /me FAILED, response text:", errorText);
            handleLogout();
          }
        } catch (err) {
          console.error("validateTokenAndSetUser - fetch /me ERROR:", err);
          handleLogout();
        }
      } else {
        console.log("validateTokenAndSetUser - No token found, ensuring logged out state.");
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      setIsLoadingUser(false);
      console.log("validateTokenAndSetUser - END, isLoadingUser set to false. isLoggedIn:", isLoggedIn);
    };
    validateTokenAndSetUser();
  }, [handleLogout]);

  useEffect(() => {
    console.log("useEffect [fetchAllLeaderboards] - MOUNT or isLoadingUser changed. Current isLoadingUser:", isLoadingUser);
    const fetchAllLeaderboards = async () => {
      console.log("fetchAllLeaderboards - START");
      setIsLoadingLeaderboards(true);
      try {
        const types = ['goals', 'assists', 'trophies'];
        const newLeaderboardState = { goals: [], assists: [], trophies: [] };
        for (const type of types) {
          console.log(`fetchAllLeaderboards - Fetching ${type} leaderboard`);
          const res = await fetch(`${API_BASE_URL}/auth/challenges/leaderboard/${type}`);
          if (res.ok) {
            newLeaderboardState[type] = await res.json();
            console.log(`fetchAllLeaderboards - ${type} OK`);
          } else {
            console.error(`fetchAllLeaderboards - Failed to fetch ${type} leaderboard, status:`, res.status);
            const errorText = await res.text();
            console.error(`fetchAllLeaderboards - ${type} FAILED, response text:`, errorText);
            newLeaderboardState[type] = [];
          }
        }
        setLeaderboard(newLeaderboardState);
      } catch (errFetchLeaderboard) {
        console.error("fetchAllLeaderboards - ERROR:", errFetchLeaderboard);
        setLeaderboard({ goals: [], assists: [], trophies: [] });
      }
      setIsLoadingLeaderboards(false);
      console.log("fetchAllLeaderboards - END, isLoadingLeaderboards set to false");
    };

    if (!isLoadingUser) {
      console.log("useEffect [fetchAllLeaderboards] - isLoadingUser is false, calling fetchAllLeaderboards.");
      fetchAllLeaderboards();
    } else {
      console.log("useEffect [fetchAllLeaderboards] - isLoadingUser is true, not fetching leaderboards yet.");
    }
  }, [isLoadingUser]);

  // --- FONCTIONS DE GESTION ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    // ... (logique existante, semble correcte)
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password) {
      setError("Le nom d'utilisateur et le mot de passe sont requis.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, password: formData.password })
      });
      const data = await res.json();
      if (!res.ok) { throw new Error(data.error || `Échec de la connexion : ${res.statusText || res.status}`); }
      localStorage.setItem('token', data.token);
      setIsLoggedIn(true);
      setCurrentUser({
        username: data.username,
        goalsScore: data.goalsScore || 0,
        assistsScore: data.assistsScore || 0,
        trophiesScore: data.trophiesScore || 0
      });
      setFormData({ username: '', password: '' });
      console.log("handleLogin - SUCCESS");
    } catch (err) {
      console.error('handleLogin - ERROR:', err);
      setError(err.message);
    }
  };
  const handleRegister = async (e) => {
    // ... (logique existante, semble correcte)
    e.preventDefault();
    setError('');
    if (!formData.username || !formData.password || !formData.email) {
        setError("Le nom d'utilisateur et le mot de passe sont requis.");
        return;
    }
    if (formData.password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.username, email: formData.email,  password: formData.password })
      });
      const data = await res.json();
      if (!res.ok) { throw new Error(data.error || `Échec de l'inscription : ${res.statusText || res.status}`);}
      setAuthMode('login');
      alert(data.message || 'Inscription réussie ! Veuillez vous connecter.');
      setFormData({ username: '', email: '', password: '' });
    } catch (err) {
      console.error('handleRegister - ERROR:', err);
      setError(err.message || "Erreur inconnue lors de l'inscription");
    }
  };

  const handleBack = () => {
    setAuthMode('welcome');
    setFormData({ username: '', password: '' });
    setError('');
  };


  // --- AFFICHAGE CONDITIONNEL ---
  if (isLoadingUser || isLoadingLeaderboards) {
    console.log("RENDERING - Loading screen because isLoadingUser:", isLoadingUser, "or isLoadingLeaderboards:", isLoadingLeaderboards);
    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            height: '100vh', width: '100vw', fontSize: '3rem',
            color: 'white', background: '#1a1a2e', // Un fond sombre différent pour le loading
            fontFamily: "'VT323', monospace",
            textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff'
        }}>
            Loading...
        </div>
    );
  }

  if (!isLoggedIn) {
    console.log("RENDERING - Not logged in section. authMode:", authMode);
    return (
      <section className='sectionlogin'>
        {authMode === 'welcome' && (
          <div className='auth-welcome'> {/* Appliquera les styles et animations de .auth-welcome */}
            <h2>Welcome To My Football Challenges</h2> {/* Sera stylé par .auth-welcome h2 */}
            <div className='line'></div> {/* Sera stylé par .auth-welcome .line */}
            <div className="button-group"> {/* Appliquera les styles de .button-group */}
              <button
                onClick={() => { setError(''); setAuthMode('login'); console.log("Clicked Login button, authMode set to login"); }}
                className="login-btn" /* Styles du bouton de login */
              >
                Login
              </button>
              <button
                onClick={() => { setError(''); setAuthMode('register'); console.log("Clicked Register button, authMode set to register"); }}
                className="register-btn" /* Styles du bouton d'enregistrement */
              >
                Register
              </button>
            </div>
          </div>
        )}
        {(authMode === 'login') && (
          <div className='auth-form'>
            <p className='form-title'>Login</p>
            {error && (<div className='error-message'>{error}</div>)}
            <form onSubmit={handleLogin}>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                autoComplete="username"
                required
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
              <div className="form-actions">
                <button type="button" onClick={handleBack} className="back-btn">
                  <FaArrowLeft /> Back
                </button>
                <button type="submit" className="submit-btn-login">
                  Login
                </button>
              </div>
              <div className='forgot-password'>
                <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
              </div>
            </form>
          </div>
        )}
        {(authMode === 'register') && (
          <div className='auth-form'>
            <p className='form-title'>Register</p>
            {error && (<div className='error-message'>{error}</div>)}
            <form onSubmit={handleRegister}>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                autoComplete="username"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                autoComplete="email"
                required
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                autoComplete="new-password"
                required
              />
              <div className="form-actions"> 
                <button type="button" onClick={handleBack} className="back-btn">
                  <FaArrowLeft /> Back
                </button>
                <button type="submit" className="submit-btn-register">
                  Register
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    );
  }

  console.log("RENDERING - Logged in section. currentUser:", currentUser?.username);
  return (
    <section className='section1'>
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
  <Link to="/goals-challenge" className="div11" style={{ textAlign: 'center', fontSize: '3vw', color: 'white', textDecoration: 'none' }}>
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
  </Link>

  <Link to="/assists-challenge" className="div12" style={{ textAlign: 'center', fontSize: '3vw', color: 'white', textDecoration: 'none' }}>
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
  </Link>

  <Link to="/trophies-challenge" className="div13" style={{ textAlign: 'center', fontSize: '3vw', color: 'white', textDecoration: 'none' }}>
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
  </Link>
</div>
      <button
        onClick={handleLogout}
        style={{
          marginTop: '20px', padding: '10px 20px', fontSize: '1rem',
          fontFamily: "'VT323', monospace", cursor: 'pointer',
          backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px'
        }}
      >
        Logout
      </button>
    </section>
  );
}

export default Home;
