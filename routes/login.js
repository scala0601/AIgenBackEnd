const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();
const loginKey=process.env.LOGIN_CLIENT_ID;
const client = new OAuth2Client(loginKey);

// 구글 인증 처리
router.get('/google/callback', async (req, res) => {
    try {
        const token = req.query.token;  // 토큰이 잘 전달되는지 로그로 확인
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
            picture: payload.picture
        };

        // 세션에 사용자 정보 저장
        req.session.user = user;

        // 로그인 후 메인 화면으로 리디렉션
        res.redirect('http://localhost:5173');  // 프론트엔드 홈 화면 URL로 리디렉션
    } catch (error) {
        console.error('Google Authentication Error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
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
