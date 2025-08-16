const express = require('express');
const { protect } = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');
const Question = require('../models/Question');
const router = express.Router();

router.post('/progress', protect, async (req, res) => {
  try {
    const { questionId, action } = req.body; // action: 'complete' or 'uncomplete'
    const userId = req.user._id;

    let userProgress = await UserProgress.findOne({ user: userId });
    
    if (!userProgress) {
      userProgress = new UserProgress({ user: userId });
    }

    if (action === 'complete') {
      // Check if already completed
      const alreadyCompleted = userProgress.completedQuestions.find(
        item => item.question.toString() === questionId
      );
      
      if (!alreadyCompleted) {
        userProgress.completedQuestions.push({ question: questionId });
      }
    } else if (action === 'uncomplete') {
      // Remove from completed
      userProgress.completedQuestions = userProgress.completedQuestions.filter(
        item => item.question.toString() !== questionId
      );
    }

    await userProgress.save();
    
    res.json({ 
      message: 'Progress updated successfully',
      completedCount: userProgress.completedQuestions.length
    });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ error: 'Server error updating progress' });
  }
});

// @route   GET /api/v1/user/bookmarks
// @desc    Get user bookmarks
// @access  Private
router.get('/bookmarks', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const userProgress = await UserProgress.findOne({ user: userId })
      .populate({
        path: 'bookmarkedQuestions.question',
        select: 'title url difficulty'
      });

    if (!userProgress) {
      return res.json({ bookmarks: [] });
    }

    res.json({ bookmarks: userProgress.bookmarkedQuestions });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Server error getting bookmarks' });
  }
});

// @route   POST /api/v1/user/bookmarks
// @desc    Toggle bookmark for a question
// @access  Private
router.post('/bookmarks', protect, async (req, res) => {
  try {
    const { questionId, action } = req.body; // action: 'add' or 'remove'
    const userId = req.user._id;

    let userProgress = await UserProgress.findOne({ user: userId });
    
    if (!userProgress) {
      userProgress = new UserProgress({ user: userId });
    }

    if (action === 'add') {
      // Check if already bookmarked
      const alreadyBookmarked = userProgress.bookmarkedQuestions.find(
        item => item.question.toString() === questionId
      );
      
      if (!alreadyBookmarked) {
        userProgress.bookmarkedQuestions.push({ question: questionId });
      }
    } else if (action === 'remove') {
      // Remove from bookmarks
      userProgress.bookmarkedQuestions = userProgress.bookmarkedQuestions.filter(
        item => item.question.toString() !== questionId
      );
    }

    await userProgress.save();
    
    res.json({ 
      message: 'Bookmark updated successfully',
      bookmarkedCount: userProgress.bookmarkedQuestions.length
    });
  } catch (error) {
    console.error('Bookmark update error:', error);
    res.status(500).json({ error: 'Server error updating bookmark' });
  }
});

// @route   GET /api/v1/user/dashboard
// @desc    Get user dashboard data (progress and bookmarks)
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const userProgress = await UserProgress.findOne({ user: userId })
      .populate({
        path: 'completedQuestions.question',
        select: 'title url difficulty'
      })
      .populate({
        path: 'bookmarkedQuestions.question',
        select: 'title url difficulty'
      });

    const totalQuestions = await Question.countDocuments();

    if (!userProgress) {
      return res.json({
        completedCount: 0,
        bookmarkedCount: 0,
        completedQuestions: [],
        bookmarkedQuestions: [],
        totalQuestions
      });
    }

    res.json({
      completedCount: userProgress.completedQuestions.length,
      bookmarkedCount: userProgress.bookmarkedQuestions.length,
      completedQuestions: userProgress.completedQuestions,
      bookmarkedQuestions: userProgress.bookmarkedQuestions,
      totalQuestions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error getting dashboard' });
  }
});

module.exports = router;
