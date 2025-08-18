const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next)=>{
  try{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
      token = req.headers.authorization.split(' ')[1];
    }

    if(!token) return res.status(401).json({error: 'Access denied.First provide me token'});
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if(!user) return res.status(401).json({error:'Token is not valid'});
    
    req.user = user;
    next();
  } 
  catch(error){
    if(error.name === 'JsonWebTokenError'){
      console.error('JWT verification failed');
    } 
    else if(error.name === 'TokenExpiredError'){
      console.error('JWT token expired');
    }
    return res.status(401).json({
      error: 'Token is not valid.'
    });
  }
};

module.exports = {protect};
