const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const contentRoutes = require('./routes/content');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const authLimiter = rateLimit({
  windowMs: 15*60*1000,
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/content', contentRoutes);

app.get('/health', (req, res) =>{
  res.status(200).json({ status:'OK', message: 'Server is running' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() =>{
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () =>{
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) =>{
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

app.use((err,req,res,next) =>{
  console.error(err.stack);
  res.status(500).json({error: 'Something went wrong!'});
});

app.use('*',(req, res) =>{
  res.status(404).json({error: 'Route not found'});
});
