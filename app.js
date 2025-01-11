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
require('dotenv').config();


app.use(cors());
app.use(express.json());

app.use('/api', diaryRoutes);
app.use('/login', authRoutes);

// 미들웨어 설정
app.use(bodyParser.json());

app.use(session({
  secret: 'your_secret_key',  // 안전한 비밀 키
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,  // 개발 환경에서는 false, 프로덕션에서는 true (HTTPS)
    maxAge: 24 * 60 * 60 * 1000  // 세션 유효 시간: 24시간
  }
}));

app.use(passport.initialize());
app.use(passport.session());  // 반드시 express-session 다음에 사용

// 구글 인증을 위한 Passport 설정
passport.serializeUser((user, done) => {
  done(null, user.email);  // user 객체의 고유 식별자 저장
});

passport.deserializeUser((email, done) => {
  // DB에서 사용자 검색 후 반환
  User.findOne({ email }, (err, user) => {
    done(err, user);
  });
});

// MongoDB 연결
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB에 연결되었습니다.'))
  .catch((err) => console.error('MongoDB 연결 실패:', err));



// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
