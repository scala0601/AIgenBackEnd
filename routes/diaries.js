const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');
const { getYouTubePlaylist } = require('../services/youtubeService2');
const { analyzeEmotion } = require('../services/openaiService');
const passport = require('passport');

// 자동 저장 API
// POST: http://localhost:5000/api/save
//passport.authenticate('session', { session: false }),
router.post(
  '/save',
  
  async (req, res) => {
    const { title, content, genre } = req.body;
    const userId = "catyelin0601@gmail.com";
    //const userId = req.session.user ? req.session.user.email : null; // 세션에서 사용자 이메일 사용

    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    try {
      // 감정 분석 및 플레이리스트 생성
      const emotion = await analyzeEmotion(content);
      const playlist = await getYouTubePlaylist(genre, emotion);

      const newDiary = new Diary({
        title,
        content,
        date: new Date(),
        genre,
        emotion,
        userId,
        playlist,
      });

      await newDiary.save();
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
  '/list',
  passport.authenticate('session', { session: false }),
  async (req, res) => {
    const userId = req.session.user ? req.session.user.email : null;

    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }

    try {
      const diaries = await Diary.find({ userId }).sort({ date: -1 }); // 최신순 정렬
      res.status(200).json(diaries);
    } catch (error) {
      console.error('Error fetching diaries:', error);
      res.status(500).json({ message: '일기 불러오기 실패', error: error.message });
    }
  }
);

module.exports = router;
