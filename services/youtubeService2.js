const { google } = require('googleapis');
require('dotenv').config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,  // .env 파일에 YouTube API 키 설정
});

async function getYouTubePlaylist(genre, emotion) {
  try {
    const searchQuery = `${emotion}한 ${genre} 음악`;
    
    const response = await youtube.search.list({
      q: searchQuery,
      part: 'snippet',
      maxResults: 5,  // 추천할 노래 수
      type: 'video',
      videoCategoryId: '10',
    });

    const playlists = response.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
    }));

    return playlists;
  } catch (error) {
    console.error('Error fetching YouTube playlist:', error);
    return [];
  }
}

module.exports = {
  getYouTubePlaylist,
};
