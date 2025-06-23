import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { generateRandomString, generateCodeChallenge } from './spotifyAuth'
import Callback from './Callback'

const clientId = '7971cc14dfda44ecacce2f3eaa899395';
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
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#121212', 
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
          padding: '20px 0',
          boxShadow: '0 4px 20px rgba(29, 185, 84, 0.3)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div>
                <h1 style={{ 
                  margin: 0, 
                  fontSize: '2.5rem', 
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}>
                  Splitify
                </h1>
                <p style={{ 
                  margin: '5px 0 0 0', 
                  fontSize: '1.1rem',
                  opacity: 0.9
                }}>
                  Welcome back, <strong>{userProfile?.display_name || 'User'}</strong>!
                </p>
              </div>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #333',
                borderTop: '4px solid #1DB954',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>Loading Your Playlists</h2>
              <p style={{ color: '#b3b3b3', fontSize: '1.1rem' }}>This will just take a moment...</p>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ 
                  fontSize: '2rem', 
                  margin: '0 0 10px 0',
                  background: 'linear-gradient(45deg, #1DB954, #1ed760)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Choose Your Playlist
                </h2>
                <p style={{ 
                  color: '#b3b3b3', 
                  fontSize: '1.1rem',
                  margin: '0'
                }}>
                  Select a playlist to split into sub-playlists based on song characteristics
                </p>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: '20px',
                marginBottom: '40px'
              }}>
                {playlists.map((playlist) => (
                  <div 
                    key={playlist.id}
                    onClick={() => handlePlaylistSelect(playlist)}
                    style={{
                      backgroundColor: selectedPlaylist?.id === playlist.id ? '#282828' : '#181818',
                      borderRadius: '12px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: selectedPlaylist?.id === playlist.id ? '2px solid #1DB954' : '2px solid transparent',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-4px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {selectedPlaylist?.id === playlist.id && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#1DB954',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        ✓
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                      {playlist.images[0] ? (
                        <img 
                          src={playlist.images[0].url} 
                          alt={playlist.name}
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            flexShrink: 0
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '80px',
                          height: '80px',
                          backgroundColor: '#333',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px'
                        }}>
                          🎵
                        </div>
                      )}
                      
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {playlist.name}
                        </h3>
                        <p style={{ 
                          margin: '0 0 5px 0', 
                          color: '#b3b3b3',
                          fontSize: '0.9rem'
                        }}>
                          {playlist.tracks.total} tracks
                        </p>
                        <p style={{ 
                          margin: 0, 
                          color: '#888',
                          fontSize: '0.85rem'
                        }}>
                          by {playlist.owner.display_name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPlaylist && (
                <div style={{ textAlign: 'center' }}>
                  <button 
                    style={{ 
                      padding: '18px 36px', 
                      backgroundColor: '#1DB954', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '30px', 
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(29, 185, 84, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(29, 185, 84, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(29, 185, 84, 0.3)';
                    }}
                  >
                    🎯 Split "{selectedPlaylist.name}" into Sub-playlists
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        maxWidth: '500px'
      }}>
        <div style={{
          backgroundColor: '#181818',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid #333'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px'
          }}>
            🎵
          </div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            margin: '0 0 15px 0',
            background: 'linear-gradient(45deg, #1DB954, #1ed760)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Splitify
          </h1>
          <p style={{ 
            color: '#b3b3b3', 
            fontSize: '1.1rem',
            margin: '0 0 30px 0',
            lineHeight: '1.6'
          }}>
            Transform your playlists into perfectly organized sub-playlists based on song characteristics like mood, energy, and style.
          </p>
          <button 
            onClick={handleLogin}
            style={{ 
              padding: '16px 32px', 
              backgroundColor: '#1DB954', 
              color: 'white', 
              border: 'none', 
              borderRadius: '30px', 
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(29, 185, 84, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(29, 185, 84, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(29, 185, 84, 0.3)';
            }}
          >
            🎧 Connect with Spotify
          </button>
        </div>
      </div>
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
