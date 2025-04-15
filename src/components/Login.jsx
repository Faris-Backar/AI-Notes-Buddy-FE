import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignIn from './GoogleSignIn';
import '../styles/login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { user, error: authError, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSuccess = async (userData) => {
    try {
      setLoading(true);
      await signIn(userData);
      navigate('/home');
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
    }
  };

  const handleError = (error) => {
    console.error('Sign in error:', error);
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>AI Notes Buddy</h1>
        <p>Your intelligent note-taking companion</p>

        <GoogleSignIn 
          onSuccess={handleSuccess}
          onError={handleError}
          loading={loading}
        />

        {authError && <p className="error">{authError}</p>}
      </div>
    </div>
  );
};

export default Login; 