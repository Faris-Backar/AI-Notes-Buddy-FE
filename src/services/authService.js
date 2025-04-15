// Get current user
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('google_token');
    if (!token) return null;

    // Verify token with Google API
    const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json());

    return {
      uid: userInfo.sub,
      displayName: userInfo.name,
      email: userInfo.email,
      photoURL: userInfo.picture,
      emailVerified: userInfo.email_verified
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Sign out
export const logOut = () => {
  try {
    localStorage.removeItem('google_token');
    return Promise.resolve();
  } catch (error) {
    console.error('Error signing out:', error);
    return Promise.reject(error);
  }
};

// Subscribe to auth changes
export const subscribeToAuthChanges = (callback) => {
  let lastUser = null;
  let isChecking = false;

  const checkAuth = async () => {
    if (isChecking) return;
    isChecking = true;

    try {
      const user = await getCurrentUser();
      // Only call callback if user state has changed
      if (JSON.stringify(user) !== JSON.stringify(lastUser)) {
        lastUser = user;
        callback(user);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      isChecking = false;
    }
  };

  // Check auth state periodically, but less frequently
  const interval = setInterval(checkAuth, 5000); // Check every 5 seconds instead of 1
  return () => clearInterval(interval);
};

// Get ID token for API requests
export const getIdToken = async () => {
  try {
    const token = localStorage.getItem('google_token');
    if (!token) {
      console.error('No token found in localStorage');
      return null;
    }

    // Verify token is still valid
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      console.error('Token validation failed:', response.status);
      localStorage.removeItem('google_token');
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

// Store token
export const storeToken = (token) => {
  localStorage.setItem('google_token', token);
}; 