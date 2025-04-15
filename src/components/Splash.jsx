import { useState, useEffect } from 'react';
import '../styles/splash.css';

export default function Splash({ onFinished }) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished();
    }, 3000);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + 5;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 150);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onFinished]);

 
  return (
    <div className="splash-screen">
      <div className="loader-container">
        <div className="notes-icon">
          <div className="paper"></div>
          <div className="lines">
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
          </div>
          <div className="circle-spinner"></div>
        </div>
      </div>
      <h1 className="app-title">AI Notes Buddy</h1>
      <p className="loading-text">Loading your smart assistant...</p>
    </div>
  );
}
