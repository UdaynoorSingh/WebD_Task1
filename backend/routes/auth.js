const express =require('express');
const jwt=require('jsonwebtoken');
const User=require('../models/User');
const router=express.Router();

const gen_token=(id) =>{
  return jwt.sign({id}, process.env.JWT_SECRET,{
    expiresIn: '28d',
  });
};

router.post('/register', async (req,res)=>{
  try{
    const {name,email,password} = req.body;

    if(!name || !email || !password) return res.status(400).json({error: 'All fields are required'});
    
    if(password.length<6) return res.status(400).json({error: 'choose the password must be atleast 6 character long'});

    if(!email.includes('@')) return res.status(400).json({error: 'Please provide a valid email address'});
    

    const userexist = await User.findOne({email });
    if(userexist) return res.status(400).json({error: 'User already exists with this email'});

    const user = await User.create({name,email,password});

    if(user){
      res.status(201).json({_id: user._id,name: user.name,email: user.email,token: gen_token(user._id)});
    }
  } 
  catch(error){
    console.error('Registration error:', error);
    
    if(error.name === 'ValidationError'){
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      error: 'Server error during registration' 
    });
  }
});

router.post('/login', async (req,res) =>{
  try{
    const {email,password} = req.body;

    if(!email || !password) return res.status(400).json({error: 'Email and password both are required'});
    
    const user = await User.findOne({email});
    if(!user) return res.status(401).json({error: 'Invalid credentials' });
    
    const isMatching = await user.comparePassword(password);
    if(!isMatching) return res.status(401).json({error: 'Invalid credentials'});
    

    res.json({_id: user._id,name: user.name,email: user.email,token: gen_token(user._id)});
  } 
  catch(error){
    console.error('Login errorr:', error);
    res.status(500).json({ 
      error: 'Servers error during login' 
    });
  }
});

module.exports = router;