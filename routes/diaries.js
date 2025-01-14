const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const { getYouTubePlaylist } = require('../services/youtubeService2');
const { analyzeEmotion } = require('../services/openaiService');
const passport = require('passport');

const cors = require('cors');
router.use(cors({
  origin: 'https://aiplaylistgenfront.onrender.com', // 프론트엔드 주소
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // 세션 쿠키와 같은 인증 정보를 포함할 수 있게 설정
}));

const session = require('express-session');
router.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,  // 로컬 개발 시 `false`, 프로덕션에서는 `true`
  }
}));
// 자동 저장 API
// POST: http://localhost:5000/api/save
passport.authenticate('session', { session: true });

const ensureAuthenticated = (req, res, next) => {
  console.log('세션에 저장된 사용자 정보:', req.session.user);
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized!!!' });
  }
};

router.post(
  '/save', ensureAuthenticated,
  
  async (req, res) => {
    const { date, title, content, genre } = req.body;
    const userId = req.session.user; // 세션에서 사용자 정보

    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    try {
      // 감정 분석 및 플레이리스트 생성
      const emotion = await analyzeEmotion(content);
      const playlist = await getYouTubePlaylist(genre, emotion);
      const updatedDiary = await Diary.findOneAndUpdate(
        { date: new Date(date), userId: userId }, // 조건: 동일한 날짜와 사용자 ID
        { title, content, genre, emotion, playlist }, // 덮어쓸 데이터
        { new: true, upsert: true } // 새로운 데이터를 반환하며, 없으면 생성
      );
      const newDiary = new Diary({
        title,
        content,
        genre,
        date,
        emotion,
        userId,
        playlist,
      });

      //await newDiary.save();
      res.status(200).json({ message: '일기가 저장되었습니다.' });
    } catch (error) {
      console.error('Error saving diary:', error);
      res.status(500).json({ message: '일기 저장 실패', error: error.message });
    }
  }
);

// 일기 목록 불러오기 (플레이리스트 포함)
// GET: http://localhost:5000/api/list
router.get(
  '/fetch', ensureAuthenticated,
  //passport.authenticate('session', { session: false }),
  async (req, res) => {
    const userId = req.session.user;
    const date  = req.query.date;

    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const diary = await Diary.findOne({
        date: { $gte: startOfDay, $lte: endOfDay },
        userId,
      });
      if (diary) {
        res.status(200).json(diary);
      } else {
        res.status(404).json({ message: '해당 날짜의 일기가 없습니다.' });
      }
    } catch (error) {
      console.error('Error fetching diary:', error);
      res.status(500).json({ message: '일기 데이터를 가져오는 데 실패했습니다.' });
    }
  }
);

router.get(
  '/fetchAll', ensureAuthenticated,
  //passport.authenticate('session', { session: false }),
  async (req, res) => {
    try {
      const userId = req.session.user;  // 세션에서 사용자 ID 가져오기
      if (!userId) {
        return res.status(401).json({ message: '로그인이 필요합니다.' });
      }
  
      // 해당 유저의 모든 일기 데이터를 가져오기
      const diaries = await Diary.find({ userId });
  
      // 일기 데이터를 날짜별로 정리
      const diaryData = diaries.reduce((acc, diary) => {
        const formattedDate = diary.date.toISOString().split('T')[0]; // 'yyyy-mm-dd' 형식으로 날짜 포맷
        acc[formattedDate] = {
          albumImage: diary.playlist[0]?.thumbnail || '',  // 첫 번째 앨범 이미지, 없으면 빈 문자열
          emotion: diary.emotion || '',  // 감정 정보, 없으면 빈 문자열
        };
        return acc;
      }, {});
  
      // 날짜별로 정리된 일기 데이터를 반환
      res.status(200).json(diaryData);
    } catch (error) {
      console.error('Error fetching all diaries:', error);
      res.status(500).json({ message: '일기 데이터를 가져오는 데 실패했습니다.' });
    }
});

module.exports = router;
