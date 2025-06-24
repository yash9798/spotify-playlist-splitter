import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const clientId = '99e3e288557245dd9cb00a98f1b33494';
const clientSecret = 'c44969e56ed14dc2bb4662b606d50128';

function Callback() {
  const [status, setStatus] = useState('Processing...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('Callback component mounted');
      console.log('Client ID:', clientId);
      console.log('Redirect URI:', window.location.origin + '/callback');
      
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        console.log('Authorization code received:', !!code);
        
        if (!code) {
          setStatus('Error: No authorization code received');
          return;
        }

        const codeVerifier = localStorage.getItem('code_verifier');
        console.log('Code verifier found:', !!codeVerifier);
        
        if (!codeVerifier) {
          setStatus('Error: No code verifier found');
          return;
        }

        console.log('Starting token exchange...');
        
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

        console.log('Token response status:', tokenResponse.status);
        
        const tokenData = await tokenResponse.json();
        console.log('Token response:', tokenData);

        if (tokenData.error) {
          console.error('Token error:', tokenData.error, tokenData.error_description);
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
