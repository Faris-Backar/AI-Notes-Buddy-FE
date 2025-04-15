import { useGoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { storeToken } from '../services/authService';

const GoogleSignIn = ({ onSuccess, onError, loading }) => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        storeToken(tokenResponse.access_token);
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        }).then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch user info from Google');
          }
          return res.json();
        });

        const userData = {
          uid: userInfo.sub,
          displayName: userInfo.name,
          email: userInfo.email,
          photoURL: userInfo.picture
        };

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenResponse.access_token}`
          },
          body: JSON.stringify(userData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || 'Failed to create user in backend');
        }

        onSuccess({
          ...userData,
          emailVerified: userInfo.email_verified
        });
      } catch (error) {
        console.error('Error during sign in:', error);
        onError(error.message || 'An error occurred during sign in');
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      onError(error.message || 'Failed to sign in with Google');
    }
  });

  return (
    <button 
      onClick={login} 
      disabled={loading}
      className="signin-button"
    >
      {loading ? (
        <Loader2 className="spinner" />
      ) : (
        <img 
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
          alt="Google" 
        />
      )}
      {loading ? 'Signing in...' : 'Continue with Google'}
    </button>
  );
};

export default GoogleSignIn; 