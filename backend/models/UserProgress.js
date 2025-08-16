const mongoose = require('mongoose');

const userProgress = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedQuestions:[{
    question:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    completedAt:{
      type: Date,
      default: Date.now
    }
  }],
  bookmarkedQuestions:[{
    question:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    bookmarkedAt:{
      type: Date,
      default: Date.now
    }
  }]
},{timestamps: true});

userProgress.index({user: 1}, {unique: true});

module.exports = mongoose.model('UserProgress', userProgress);
