const express = require('express');
const Category = require('../models/Category');
const Question = require('../models/Question');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sortBy = 'title_asc' } = req.query;

    let questionQuery = {};
    
    if (search) questionQuery.title = { $regex: search, $options: 'i' };

    let questions = await Question.find(questionQuery);
    
    const [sortField, sortOrder] = String(sortBy).split('_');
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    let categories = await Category.find().populate({ path: 'questions', match: questionQuery, select: 'title url' });

    categories = categories.filter(category => category.questions.length > 0);

    categories.forEach((cat) => {
      cat.questions.sort((a, b) => {
        return sortDirection * String(a.title).localeCompare(String(b.title));
      });
    });

    const totalCategories = categories.length;
    const totalPages = Math.ceil(totalCategories / limit) || 1;
    const currentPage = Math.max(1, Math.min(parseInt(page), totalPages));
    const startIndex = (currentPage - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    
    const paginatedCategories = categories.slice(startIndex, endIndex);

    const totalQuestions = questions.length;

    res.json({
      categories: paginatedCategories,
      pagination: {
        currentPage,
        totalPages,
        totalCategories,
        totalQuestions,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      },
      filters: {
        search: search || null,
        sortBy
      }
    });
  } catch (error) {
    console.error('Content fetch error:', error);
    res.status(500).json({ error: 'Server error fetching content' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().populate({
      path: 'questions',
      select: 'title url'
    });
    res.json(categories);
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

router.get('/questions', async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sortBy = 'title_asc' } = req.query;

    let query = {};
    
    if (search) query.title = { $regex: search, $options: 'i' };

    let questions = await Question.find(query);

    const [sortField, sortOrder] = String(sortBy).split('_');
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    questions.sort((a, b) => sortDirection * String(a.title).localeCompare(String(b.title)));

    const totalQuestions = questions.length;
    const totalPages = Math.ceil(totalQuestions / parseInt(limit)) || 1;
    const currentPage = Math.max(1, Math.min(parseInt(page), totalPages));
    const startIndex = (currentPage - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginated = questions.slice(startIndex, endIndex);

    res.json({
      questions: paginated,
      pagination: {
        currentPage,
        totalPages,
        totalQuestions,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      },
      filters: {
        search: search || null,
        sortBy
      }
    });
  } catch (error) {
    console.error('Questions fetch error:', error);
    res.status(500).json({ error: 'Server error fetching questions' });
  }
});

module.exports = router;