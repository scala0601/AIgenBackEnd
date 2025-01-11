const { analyzeEmotion } = require('../services/openaiService');
const { getPlaylistByEmotion } = require('../services/youtubeService');

const getPlaylist = async (req, res) => {
  const { diaryText, genre } = req.body;

  try {
    // OpenAI로 감정 분석
    const emotion = await analyzeEmotion(diaryText);
    console.log('Detected emotion:', emotion);

    // 감정에 맞는 플레이리스트 추천
    const playlist = await getPlaylistByEmotion(emotion, genre);

    // 클라이언트에 응답
    res.json({ emotion, playlist });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = { getPlaylist };
