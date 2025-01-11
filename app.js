// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const diaryRoutes = require('./routes/diaries');
const app = express();
const PORT = process.env.PORT || 5000;
const passport = require('passport');
require('./auth');  // Passport 설정 파일 불러오기
const authRoutes = require('./routes/login');

// 환경 변수 설정
//require('dotenv').config();

app.use(cors());
app.use(express.json());

app.use('/api', diaryRoutes);

app.use(session({ secret: 'secret_key', resave: false, saveUninitialized: true }));

// 구글 인증을 위한 Passport 설정
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.use('/login', authRoutes);

// MongoDB 연결
mongoose.connect('mongodb+srv://catyelin0601:catyelin0601@cluster0.tyz7m.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB에 연결되었습니다.'))
  .catch((err) => console.error('MongoDB 연결 실패:', err));

// 미들웨어 설정
app.use(bodyParser.json());

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
