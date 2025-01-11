const openai = require('openai');  // OpenAI 라이브러리
require('dotenv').config();

// OpenAI API 키 설정
const openaiAPIKey = process.env.OPENAI_KEY;

const analyzeEmotion = async (diaryText) => {
  try {
    const response = await openai.Completion.create({
      model: 'text-davinci-003',  // 모델 선택
      prompt: `Analyze the emotion in the following diary entry: "${diaryText}"`,
      max_tokens: 100,
      temperature: 0.7,
      apiKey: openaiAPIKey,
    });

    const emotion = response.choices[0].text.trim();
    return emotion;
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    throw new Error('Emotion analysis failed');
  }
};

module.exports = { analyzeEmotion };
