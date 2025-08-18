const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/content', require('./routes/content'));
app.use('/api/v1/user', require('./routes/user'));

app.get('/api/v1/health', (req, res) =>{
  res.json({status: 'OK', message: 'DSA Menu API is running'});
});

app.use((err, req, res, next) =>{
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) =>{
  res.status(404).json({error: 'Route not found'});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
