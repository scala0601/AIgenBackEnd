const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');

// 일기 저장 엔드포인트
router.post('/diary', async (req, res) => {
  try {
    const { title, content, date, emotion } = req.body;
    const newDiary = new Diary({ title, content, date, emotion });
    const savedDiary = await newDiary.save();
    res.status(201).json({ message: '일기 저장 성공', diary: savedDiary});
  } catch (err) {
    res.status(500).json({ error: '일기를 저장하는 데 실패했습니다.' });
  }
});

// GET: 모든 일기 조회
router.get('/diaries', async (req, res) => {
  try {
      const diaries = await Diary.find();  // MongoDB에서 모든 일기 조회
      res.status(200).json({ diaries });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});

// 날짜를 이용해서 일기 조회 
router.get('/diary/:date', async (req, res) => {
  const { date } = req.params;  // URL에서 날짜를 받음 (형식: YYYY-MM-DD)

  // 날짜 포맷을 Date 객체로 변환
  const searchDate = new Date(date);

  try {
      // 날짜에 해당하는 일기 찾기 (같은 날짜의 일기만)
      const diaries = await Diary.find({
          date: {
              $gte: searchDate.setHours(0, 0, 0, 0),  // 날짜의 00시로 설정 (시작 시간)
              $lt: searchDate.setHours(23, 59, 59, 999) // 날짜의 23시 59분 59초로 설정 (끝 시간)
          }
      });

      if (diaries.length === 0) {
          return res.status(404).json({ message: '해당 날짜의 일기가 없습니다.' });
      }

      res.status(200).json({ diaries });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});
module.exports = router;
