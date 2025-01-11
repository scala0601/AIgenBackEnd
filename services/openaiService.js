const openai = require('openai');  // OpenAI 라이브러리

// OpenAI API 키 설정
const openaiAPIKey = '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';

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
