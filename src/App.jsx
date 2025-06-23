import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { generateRandomString, generateCodeChallenge } from './spotifyAuth'
import Callback from './Callback'

const clientId = 'YOUR_SPOTIFY_CLIENT_ID';
const redirectUri = 'https://spotify-playlist-splitter-beta.vercel.app/callback';
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
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const tokenExpiresAt = localStorage.getItem('token_expires_at');
    
    if (accessToken && tokenExpiresAt && Date.now() < parseInt(tokenExpiresAt)) {
      setIsLoggedIn(true);
      fetchUserProfile(accessToken);
      fetchPlaylists(accessToken);
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

  const fetchPlaylists = async (token) => {
    try {
      setLoading(true);
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      const data = await response.json();
      setPlaylists(data.items);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem('code_verifier', codeVerifier);

    const args = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    });

    window.location = 'https://accounts.spotify.com/authorize?' + args;
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    setIsLoggedIn(false);
    setUserProfile(null);
    setPlaylists([]);
    setSelectedPlaylist(null);
  };

  const handlePlaylistSelect = (playlist) => {
    setSelectedPlaylist(playlist);
  };

  if (isLoggedIn) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Spotify Playlist Splitter</h1>
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#1DB954', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <p>Welcome, <strong>{userProfile?.display_name || 'User'}</strong>!</p>
        </div>

        {loading ? (
          <p>Loading your playlists...</p>
        ) : (
          <div>
            <h2>Select a Playlist to Split</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {playlists.map((playlist) => (
                <div 
                  key={playlist.id}
                  onClick={() => handlePlaylistSelect(playlist)}
                  style={{
                    border: selectedPlaylist?.id === playlist.id ? '2px solid #1DB954' : '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    cursor: 'pointer',
                    backgroundColor: selectedPlaylist?.id === playlist.id ? '#f0f8f0' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <h3 style={{ margin: '0 0 10px 0' }}>{playlist.name}</h3>
                  <p style={{ margin: '0', color: '#666' }}>
                    {playlist.tracks.total} tracks • {playlist.owner.display_name}
                  </p>
                  {playlist.images[0] && (
                    <img 
                      src={playlist.images[0].url} 
                      alt={playlist.name}
                      style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginTop: '10px' }}
                    />
                  )}
                </div>
              ))}
            </div>

            {selectedPlaylist && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button 
                  style={{ 
                    padding: '15px 30px', 
                    backgroundColor: '#1DB954', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Split "{selectedPlaylist.name}" into Sub-playlists
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Spotify Playlist Splitter</h1>
      <p>Split your playlists into sub-playlists based on song characteristics</p>
      <button 
        onClick={handleLogin}
        style={{ 
          padding: '15px 30px', 
          backgroundColor: '#1DB954', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Log in with Spotify
      </button>
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
