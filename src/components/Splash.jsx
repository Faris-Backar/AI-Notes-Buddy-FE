import { useState, useEffect } from 'react';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="animate-bounce mb-4">
          <svg width="96" height="96" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="2" fill="none" />
            <path d="M30 50L45 65L70 35" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        
        {/* App Name */}
        <h1 className="text-4xl font-bold tracking-wider">MY APP</h1>
        
        {/* Loading Text */}
        <p className="text-lg">Loading your experience...</p>
        
        {/* Progress Bar */}
        <div className="w-64 h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Progress Percentage */}
        <p className="text-sm">{progress}%</p>
      </div>
    </div>
  );
}