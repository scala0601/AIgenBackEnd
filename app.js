// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// MongoDB 연결
mongoose.connect('mongodb+srv://catyelin0601:kylkyl0778@cluster0.tyz7m.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB에 연결되었습니다.'))
  .catch((err) => console.error('MongoDB 연결 실패:', err));

// 미들웨어 설정
app.use(bodyParser.json());

// 라우터 연결
const diaryRoutes = require('./routes/diaries');
app.use('/api/diaries', diaryRoutes);

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
