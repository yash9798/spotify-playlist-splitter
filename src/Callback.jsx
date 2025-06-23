import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const clientId = '7971cc14dfda44ecacce2f3eaa899395'; // Replace with your actual Client ID
const clientSecret = 'a31071e85c42459c96c8b0b1f3506b8f'; // Replace with your actual Client Secret

function Callback() {
  const [status, setStatus] = useState('Processing...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          setStatus('Error: No authorization code received');
          return;
        }

        // Get the code verifier from localStorage
        const codeVerifier = localStorage.getItem('code_verifier');
        
        if (!codeVerifier) {
          setStatus('Error: No code verifier found');
          return;
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: window.location.origin + '/callback',
            code_verifier: codeVerifier
          })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          setStatus('Error: ' + tokenData.error_description);
          return;
        }

        // Store the tokens
        localStorage.setItem('access_token', tokenData.access_token);
        localStorage.setItem('refresh_token', tokenData.refresh_token);
        localStorage.setItem('token_expires_at', Date.now() + (tokenData.expires_in * 1000));

        // Clean up
        localStorage.removeItem('code_verifier');

        setStatus('Login successful! Redirecting...');
        
        // Redirect to main app
        setTimeout(() => {
          navigate('/');
        }, 2000);

      } catch (error) {
        console.error('Error during callback:', error);
        setStatus('Error: ' + error.message);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h2>Spotify Authentication</h2>
      <p>{status}</p>
    </div>
  );
}

export default Callback;
