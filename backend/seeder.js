const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const User = require('./models/User');
const Question = require('./models/Question');
const Category = require('./models/Category');

const clearDatabase = () => {
  const promises = [
    User.deleteMany({}),
    Question.deleteMany({}),
    Category.deleteMany({}),
  ];
  return Promise.all(promises);
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await clearDatabase();

    const response = await axios.get('https://test-data-gules.vercel.app/data.json');
    const sourceCategories = response.data.data;

    if (!Array.isArray(sourceCategories)) {
      throw new Error('Fetched data is not in the expected format.');
    }

    const allQuestionDocs = sourceCategories
      .flatMap(category => category.ques || [])
      .filter(item => item.title && item.yt_link)
      .map(item => ({
        title: item.title,
        url: item.yt_link
      }));

    const insertedQuestions = await Question.insertMany(allQuestionDocs);
    const questionMap = new Map(insertedQuestions.map(q => [q.url, q._id]));

    const categoryDocs = sourceCategories
      .map(category => {
        const questionIds = (category.ques || [])
          .map(item => questionMap.get(item.yt_link))
          .filter(id => id);

        return {
          title: category.title,
          questions: questionIds
        };
      })
      .filter(c => c.questions.length > 0);

    await Category.insertMany(categoryDocs);

    await User.create({
      name: 'Admin Uday',
      email: 'admin@example.com',
      password: 'Uday123'
    });

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding script failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();