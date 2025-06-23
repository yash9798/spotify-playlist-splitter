import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { generateRandomString, generateCodeChallenge } from './spotifyAuth'
import Callback from './Callback'

const clientId = '7971cc14dfda44ecacce2f3eaa899395'; // Replace with your actual Client ID
const redirectUri = 'https://spotify-playlist-splitter-beta.vercel.app/callback'; // Replace with your Vercel URL
const scope = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email'
].join(' ')

function MainApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('access_token');
    const tokenExpiresAt = localStorage.getItem('token_expires_at');
    
    if (accessToken && tokenExpiresAt && Date.now() < parseInt(tokenExpiresAt)) {
      setIsLoggedIn(true);
      fetchUserProfile(accessToken);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      const data = await response.json();
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLogin = async () => {
    const codeVerifier = generateRandomString(128)
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    localStorage.setItem('code_verifier', codeVerifier)

    const args = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    })

    window.location = 'https://accounts.spotify.com/authorize?' + args
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    setIsLoggedIn(false);
    setUserProfile(null);
  };

  if (isLoggedIn) {
    return (
      <div>
        <h1>Spotify Playlist Splitter</h1>
        <p>Welcome, {userProfile?.display_name || 'User'}!</p>
        <button onClick={handleLogout}>Logout</button>
        {/* We'll add playlist functionality here later */}
        <p>Playlist splitting functionality coming soon...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Spotify Playlist Splitter</h1>
      <button onClick={handleLogin}>Log in with Spotify</button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </Router>
  );
}

export default App
