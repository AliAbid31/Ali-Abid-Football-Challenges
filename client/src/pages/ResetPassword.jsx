import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { API_BASE_URL } from './apiConfig';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ 
      ...prev, 
      [e.target.name]: e.target.value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('The passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newPassword: formData.newPassword 
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage('Password reset successfully!');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(data.error || 'Reset failed');
      }
    } catch (err) {
      setError('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className='sectionlogin'>
      <div className='auth-form'>
        <p className='form-title'>Password Reset !</p>
        
        {error && <div className='error-message'>{error}</div>}
        {message && <div className='success-message'>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="New Password"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm New Password"
            required
          />
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="back-btn"
            >
              <FaArrowLeft /> Retour
            </button>
            <button 
              type="submit" 
              className="submit-btn-login"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ResetPassword;