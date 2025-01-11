const { google } = require('googleapis');
require('dotenv').config();

// Configure OAuth 2.0 client
const oauth2Client = new google.auth.OAuth2(
  process.env.LOGIN_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

/**
 * Sets credentials with the access token
 * @param {string} token - The access token received from the frontend
 */
const setAuthToken = (token) => {
  oauth2Client.setCredentials({ access_token: token });
};

/**
 * Create a YouTube Music playlist based on recommended songs
 * @param {string} playlistTitle - Title of the new playlist
 * @param {Array} songIds - Array of YouTube video IDs representing songs
 * @returns {Promise<Object>} - The created playlist data
 */
const createPlaylist = async (playlistTitle, songIds) => {
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // Step 1: Create a new playlist
  const playlistResponse = await youtube.playlists.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: playlistTitle,
        description: 'Playlist generated based on your diary entry.',
      },
      status: {
        privacyStatus: 'private',
      },
    },
  });

  const playlistId = playlistResponse.data.id;

  // Step 2: Add songs to the playlist
  for (const songId of songIds) {
    await youtube.playlistItems.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          playlistId: playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: songId,
          },
        },
      },
    });
  }

  return playlistResponse.data;
};

module.exports = {
  setAuthToken,
  createPlaylist,
};
