import React from 'react'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { generateRandomString, generateCodeChallenge } from './spotifyAuth'

const clientId = '7971cc14dfda44ecacce2f3eaa899395' // <-- Replace with your actual Client ID
const redirectUri = window.location.hostname === 'localhost' 
  ? 'http://localhost:5173/callback'
  : 'https://your-app-name.vercel.app/callback'
const scope = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-private',
  'user-read-email'
].join(' ')

function App() {
  const [count, setCount] = useState(0)

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

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <button onClick={handleLogin}>Log in with Spotify</button>
    </>
  )
}

export default App
