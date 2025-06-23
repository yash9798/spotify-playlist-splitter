// src/spotifyAuth.js

// Generate a random string for PKCE
export function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Base64 encode
function base64encode(string) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Generate code challenge from code verifier
export async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return base64encode(digest);
}
