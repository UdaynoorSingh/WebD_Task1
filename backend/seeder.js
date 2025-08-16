const mongoose = require('mongoose');
const axios = require('axios');

require('dotenv').config();

const User = require('./models/User');
const Question = require('./models/Question');
const Category = require('./models/Category');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err =>{
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const fetchData = async ()=>{
  try{
    console.log('Fetching data from API...');
    const response = await axios.get('https://test-data-gules.vercel.app/data.json');
    return response.data;
  } 
  catch(error){
    console.error('Error fetching data:', error.message);
    process.exit(1);
  }
};

const clearData = async ()=>{
  try{
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Question.deleteMany({});
    await Category.deleteMany({});
    console.log('Data cleared successfully');
  } 
  catch(error){
    console.error('Error clearing data:', error.message);
  }
};

const seedData = async ()=>{
  try{
    console.log('Starting database seeding...');
    
    const dataRaw = await fetchData();
    let data = dataRaw;
    if(!Array.isArray(dataRaw)){
      const arrayKey = Object.keys(dataRaw).find(key => Array.isArray(dataRaw[key]));
      if(arrayKey){
        data = dataRaw[arrayKey];
        console.log(`Using data property: ${arrayKey}`);
      } 
      else{
        throw new Error('Fetched data is not iterable and contains no array property.');
      }
    }
    
    await clearData();
    
    console.log('Creating questions...');
    const questions = [];
    for (const category of data) {
      if (Array.isArray(category.ques)) {
        for (const item of category.ques) {
          if (!item.title || !item.yt_link) continue; 
          const question = new Question({
            title: item.title,
            url: item.yt_link
          });
          questions.push(question);
        }
      }
    }
    
    await Question.insertMany(questions);
    console.log(`Created ${questions.length} questions`);
    
    // --- Category creation: map each category to its questions ---
    const categories = [];
    for (const category of data) {
      if (!Array.isArray(category.ques) || !category.title) continue;
      // Find the questions for this category
      const questionIds = [];
      for (const item of category.ques) {
        if (!item.title || !item.yt_link) continue; // skip invalid entries
        const q = questions.find(q => q.title === item.title && q.url === item.yt_link);
        if (q) questionIds.push(q._id);
      }
      if (questionIds.length > 0) {
        categories.push(new Category({
          title: category.title,
          questions: questionIds
        }));
      }
    }
    await Category.insertMany(categories);
    console.log(`Created ${categories.length} categories`);
    
    console.log('👤 Creating default admin user...');
    const adminUser = new User({
      name: 'Admin Uday',
      email: 'admin@example.com',
      password: 'Uday123'
    });
    
    await adminUser.save();
    
    console.log('Database seeding completed successfully!');
    console.log(`Summary:`);
    console.log(`   - Questions: ${questions.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Users: 1`);
    
    process.exit(0);
  } 
  catch(error){
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
