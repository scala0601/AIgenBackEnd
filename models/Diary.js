const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  title: {type: String, required: true},
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  emotion: {
    type: String,
    default: null,
  },
  playlist: { type: Array, default: [] },
  genre: {type: String, default: null},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'  // 이 모델이 사용자와 관계를 맺고 있다고 가정
  }
});

module.exports = mongoose.model('Diary', diarySchema);
