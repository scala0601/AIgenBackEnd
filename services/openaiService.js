const OpenAI = require('openai');

require('dotenv').config();                                 /* 작성한 .env의 API Key 값을 불러오기 위해 작성합니다.*/

async function analyzeEmotion(content) {
  const openai=new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  })
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '다음의 일기를 분석해서 감정을 한 단어로 요약하세요: 행복, 우울, 분노, 잔잔, 놀람.',
        },
        {
          role: 'user',
          content: `다음 텍스트의 감정을 분석해주세요:\n\n"${content}"`,
        },
      ],
      max_tokens: 10,
    });

    // 응답에서 감정 추출
    const emotion = response.choices[0].message.content.trim();
    return emotion;
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    return '잔잔';  // 기본 감정값 설정
  }
}

module.exports = {analyzeEmotion};
