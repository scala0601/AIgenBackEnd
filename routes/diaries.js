const express = require('express');
const router = express.Router();
const Diary = require('../models/Diary');

// 자동 저장 API
//http://localhost:5000/api/save
router.post('/save', async (req, res) => {
  const { title, content, emotion, playlist, userId } = req.body;

  try {
    const diary = new Diary({ title, content, emotion, playlist, userId });
    await diary.save();
    res.status(201).json({ message: 'Diary and playlist saved successfully', diary });
  } catch (error) {
    console.error('Error saving diary and playlist:', error);
    res.status(500).json({ message: 'Failed to save diary and playlist' });
  }
});

// 일기 목록 불러오기 (플레이리스트 포함)
router.get('/list/:userId', async (req, res) => {
  try {
    const diaries = await Diary.find({ userId: req.params.userId });
    res.status(200).json(diaries);
  } catch (error) {
    console.error('Error fetching diaries:', error);
    res.status(500).json({ message: 'Failed to fetch diaries' });
  }
});

module.exports = router;
