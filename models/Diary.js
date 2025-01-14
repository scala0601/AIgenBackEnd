const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  title: {type: String, required: true},
  content: {
    type: String,
    required: true,
  },
  genre: {type: String, default: null},
  date: {
    type: Date,
    default: Date.now,
  },
  emotion: {
    type: String,
    default: null,
  },

  userId: {
    type: Array,
    default: []  // 이 모델이 사용자와 관계를 맺고 있다고 가정
  },
  playlist: { type: Array, default: [] }
});

module.exports = mongoose.model('Diary', diarySchema);
