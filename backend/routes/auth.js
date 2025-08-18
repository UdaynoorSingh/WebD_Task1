const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth:{
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateVeriToken = ()=>{
  return crypto.randomBytes(32).toString('hex');
};

const sendVerificationEmail = async (email, token, name)=>{
  if(!process.env.EMAIL_USER || !process.env.EMAIL_PASS){
    console.error('Email configuration incomplete!');
    return false;
  }

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const mailOptions ={
    from: process.env.EMAIL_USER,
    to: email,
    subject:'Verify Your Email - DSA Menu',
    html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Welcome to DSA Menu!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering! Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>DSA Menu Team</p>
      </div>
    `
  };

  try{
    await transporter.sendMail(mailOptions);
    return true;
  } 
  catch(error){
    console.error('Email sending failed:', error);
    return false;
  }
};

router.post('/register', async (req, res) =>{
  try{
    const {name, email, password} = req.body;
    const exists = await User.findOne({email});

    if(exists) return res.status(400).json({error: 'User with this email already exists'});
    
    const veriToken = generateVeriToken();
    const veriExpires = new Date(Date.now() + 24*60*60*1000);

    const user = new User({
      name,
      email,
      password,
      veriToken,
      veriExpires
    });
    await user.save();

    const emailSent = await sendVerificationEmail(email, veriToken, name);
    if(!emailSent){
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        error: 'Failed to send verification email. Please check your email configuration and try again.'
      });
    }

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      userId: user._id
    });
  } 
  catch(error){
    console.error('Registration error:', error);
    res.status(500).json({error: 'Server error during registration'  });
  }
});

router.post('/login', async (req, res) =>{
  try{
    const {email, password} = req.body;
    const user = await User.findOne({email});

    if(!user) return res.status(401).json({error: 'Invalid credentials'});
    
    if(!user.isVerified){
      return res.status(401).json({
        error: 'Please verify your email before logging in. Check your inbox or request a new verification email.',
        needsVerification: true
      });
    }

    const isMatch = await user.comparePassword(password);

    if(!isMatch) return res.status(401).json({error: 'Invalid credentials'});

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

    res.json({
      message: 'Login successful',
      token,
      user:{
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } 
  catch(error){
    console.error('Login error:', error);
    res.status(500).json({error: 'Server error during login' });
  }
});

router.get('/verify-email', async (req, res)=>{
  try{
    const {token} = req.query;
    if(!token) return res.status(400).json({error: 'Verification token is required'});

    const user = await User.findOne({
      veriToken: token,
      veriExpires: {$gt: Date.now()}
    });

    if(!user) return res.status(400).json({error: 'Invalid or expired verification token' });

    user.isVerified = true;
    user.veriToken = undefined;
    user.veriExpires = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully! You can now login to your account.',
      verified: true
    });
  } 
  catch(error){
    console.error('Email verification error:', error);
    res.status(500).json({error: 'Server error during email verification'});
  }
});

router.post('/resend-verification', async (req, res)=>{
  try{
    const {email} = req.body;
    const user = await User.findOne({email});

    if(!user){
      return res.status(404).json({error: 'User not found'});
    }
    if(user.isVerified){
      return res.status(400).json({error: 'User is already verified'});
    }

    const veriToken = generateVeriToken();
    const veriExpires = new Date(Date.now() + 24*60*60*1000);

    user.veriToken = veriToken;
    user.veriExpires = veriExpires;
    await user.save();

    const emailSent = await sendVerificationEmail(email, veriToken, user.name);
    if(!emailSent) return res.status(500).json({error: 'Failed to send verification email. Please try again.'});

    res.json({
      message: 'Verification email sent successfully! Please check your inbox.'
    });
  } 
  catch(error){
    res.status(500).json({ error: 'Server error while resending verification email'});
  }
});

module.exports = router;