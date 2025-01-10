const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');

// OpenAI API 설정
const openaiConfig = require('../config/openaiConfig');
const openai = new OpenAIApi(openaiConfig);

// 감정 분석 및 플레이리스트 추천
const analyzeDiaryEmotion = async (req, res) => {
  const { diaryContent } = req.body;

  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `이 일기의 감정을 분석하여 '긍정적', '부정적', '중립적'으로 알려주세요. 일기 내용: "${diaryContent}"`,
      max_tokens: 50,
      temperature: 0.7,
    });

    const emotion = response.data.choices[0].text.trim();
    res.json({ emotion });
  } catch (error) {
    console.error('감정 분석 오류:', error);
    res.status(500).send('서버 오류');
  }
};

const getPlaylistByEmotion = async (req, res) => {
  const { emotion, selectedGenre } = req.body;

  try {
    let playlistKeyword = selectedGenre || (emotion === '긍정적' ? 'happy music' : 'calm music');
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: playlistKeyword,
        type: 'playlist',
        key: 'YOUR_YOUTUBE_API_KEY',
      },
    });

    const playlist = response.data.items[0];
    res.json({ playlist: playlist.snippet.title });
  } catch (error) {
    console.error('플레이리스트 추천 오류:', error);
    res.status(500).send('서버 오류');
  }
};

module.exports = {
  analyzeDiaryEmotion,
  getPlaylistByEmotion,
};
