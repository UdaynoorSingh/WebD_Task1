const express = require('express');
const { protect } = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');
const Question = require('../models/Question');
const router = express.Router();

const updateProgressList = async (userId, questionId, action, listType) => {
  const isAdding = action === 'add' || action === 'complete';
  const listKey = listType === 'bookmarks' ? 'bookmarkedQuestions' : 'completedQuestions';

  let progress = await UserProgress.findOne({ user: userId });
  if (!progress) {
    progress = new UserProgress({ user: userId });
  }

  const list = progress[listKey];
  const itemIndex = list.findIndex(item => item.question.toString() === questionId);

  if (isAdding && itemIndex === -1) {
    list.push({ question: questionId });
  } else if (!isAdding && itemIndex > -1) {
    list.splice(itemIndex, 1);
  }

  await progress.save();
  return progress;
};

router.post('/progress', protect, async (req, res) => {
  try {
    const { questionId, action } = req.body;
    const progress = await updateProgressList(req.user._id, questionId, action, 'progress');
    res.json({
      message: 'Progress updated successfully',
      completedCount: progress.completedQuestions.length
    });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ error: 'Server error updating progress' });
  }
});

router.post('/bookmarks', protect, async (req, res) => {
  try {
    const { questionId, action } = req.body;
    const progress = await updateProgressList(req.user._id, questionId, action, 'bookmarks');
    res.json({
      message: 'Bookmark updated successfully',
      bookmarkedCount: progress.bookmarkedQuestions.length
    });
  } catch (error) {
    console.error('Bookmark update error:', error);
    res.status(500).json({ error: 'Server error updating bookmark' });
  }
});

router.get('/bookmarks', protect, async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ user: req.user._id })
      .populate({
        path: 'bookmarkedQuestions.question',
        select: 'title url'
      });

    res.json({ bookmarks: progress ? progress.bookmarkedQuestions : [] });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Server error getting bookmarks' });
  }
});

router.get('/dashboard', protect, async (req, res) => {
  try {
    const [progress, totalQuestions] = await Promise.all([
      UserProgress.findOne({ user: req.user._id })
        .populate({ path: 'completedQuestions.question', select: 'title url' })
        .populate({ path: 'bookmarkedQuestions.question', select: 'title url' }),
      Question.countDocuments()
    ]);

    if (!progress) {
      return res.json({
        completedCount: 0,
        bookmarkedCount: 0,
        completedQuestions: [],
        bookmarkedQuestions: [],
        totalQuestions
      });
    }

    res.json({
      completedCount: progress.completedQuestions.length,
      bookmarkedCount: progress.bookmarkedQuestions.length,
      completedQuestions: progress.completedQuestions,
      bookmarkedQuestions: progress.bookmarkedQuestions,
      totalQuestions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error getting dashboard' });
  }
});

module.exports = router;