export async function fetchAllPlaylistTracks(accessToken, playlistId) {
  let tracks = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: 'Bearer ' + accessToken }
    });
    const data = await response.json();
    tracks = tracks.concat(data.items.filter(item => item.track && item.track.id));
    url = data.next;
  }
  return tracks.map(item => item.track);
}

export async function fetchAudioFeatures(accessToken, trackIds) {
  let features = [];
  for (let i = 0; i < trackIds.length; i += 100) {
    const batch = trackIds.slice(i, i + 100);
    const response = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${batch.join(',')}`,
      { headers: { Authorization: 'Bearer ' + accessToken } }
    );
    const data = await response.json();
    features = features.concat(data.audio_features.filter(f => f));
  }
  return features;
}
