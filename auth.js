const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./models/User');  // User 모델을 만들어서 사용

const app = express();

// 세션 설정
app.use(session({
  secret: 'your_secret_key',  // 안전한 비밀 키
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,  // 개발 환경에서는 false, 프로덕션에서는 true (HTTPS)
    maxAge: 24 * 60 * 60 * 1000  // 세션 유효 시간: 24시간
  }
}));

// passport 초기화
app.use(passport.initialize());
app.use(passport.session());

// 구글 OAuth2 설정
passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: 'https://aigenbackend.onrender.com/login/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
    // 사용자의 구글 프로필 정보를 데이터베이스에서 확인 후 저장
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
        user = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value
        });
        await user.save();
    }
    return done(null, user);
}));

// 세션에 사용자 정보 저장
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
});

// 구글 로그인 라우터
app.get('/login/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 구글 로그인 콜백 라우터
app.post('/login/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/');
    }
);

// 로그아웃 라우터
app.get('/logout', (req, res) => {
    req.logout((err) => {
        res.redirect('/');
    });
});

// 홈 화면 (로그인 여부 확인)
app.get('/', (req, res) => {
    if (!req.user) {
        return res.send('<a href="/auth/google">Google 로그인</a>');
    }
    res.send(`
        <h1>안녕하세요, ${req.user.displayName}</h1>
        <p><a href="/logout">로그아웃</a></p>
    `);
});

// 서버 실행
app.listen(3000, () => {
    console.log('서버가 http://localhost:3000 에서 실행 중입니다.');
});
