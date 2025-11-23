import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from './apiConfig';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage('If a user with this email exists, an email will be sent.');
      } else {
        setError(data.error || 'Un error has occurred');
      }
    } catch (err) {
      setError('Connexion error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='sectionlogin'>
      <div className='auth-form'>
        <p className='form-title'>Forgot Password ?</p>
        
        {error && <div className='error-message' style={{color: 'red'}}>{error}</div>}
        {message && <div className='success-message' style={{color: 'green'}}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Adresse email"
            autoComplete="email"
            required
          />
          
          <div className="form-actions">
            <Link to="/" className="back-btn">
              <FaArrowLeft /> Back
            </Link>
            <button 
              type="submit" 
              className="submit-btn-login"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send The Link'}
            </button>
          </div>
        </form>
        
        <div className='forgot-password'>
          <Link to="/" className="forgot-password-link">Back To Home Page</Link>
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;