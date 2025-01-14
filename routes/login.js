const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();
const loginKey=process.env.LOGIN_CLIENT_ID;
const session = require('express-session');
const client = new OAuth2Client(loginKey);
const cors = require('cors');
const passport=require('passport');

// 구글 인증 처리
router.use(express.json());

router.use(session({
  secret: 'your_secret_key',  // 안전한 비밀 키
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,  // 개발 환경에서는 false, 프로덕션에서는 true (HTTPS)
    maxAge: 24 * 60 * 60 * 1000  // 세션 유효 시간: 24시간
  }
}));

router.use(cors({
    origin: 'http://localhost:5173',  // 프론트엔드의 주소로 변경
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,  // credentials: 'include'로 세션을 포함한 요청을 허용

}));

router.post('/google/callback', async (req, res) => {
    try {
        const token = req.body.token;  // 토큰이 잘 전달되는지 로그로 확인
        if (!token) {
            console.error('Token not provided');
            return res.status(400).json({ message: 'Token not provided' });
        }
        // 구글 토큰 검증
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: loginKey,  // 자신의 클라이언트 ID로 대체
        });
        
        const payload = ticket.getPayload();  // 사용자 정보 가져오기
        const user = {
            email: payload.email,
            name: payload.name,
        };

        // 세션에 사용자 정보 저장
        req.session.user = user;

        passport.serializeUser((user, done) => {
            done(null, user.email);
        });

        // 로그인 후 메인 화면으로 리디렉션
        res.json({ success: true, user: user });  // 프론트엔드 홈 화면 URL로 리디렉션
    } catch (error) {
        console.error('Google Authentication Error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
});

router.get('/status', (req, res) => {
    const user = req.session.user;  // 세션에서 사용자 정보를 가져옵니다.
  
    if (!user) {
        return res.status(401).json({ message: '로그인되지 않았습니다.' });
    }

    return res.json(user);
});
  

// 로그아웃 처리
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Could not log out");
        }
        res.redirect('http://localhost:5173');  // 홈 화면으로 리디렉션
    });
});

module.exports = router;
