import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {FiUser, FiMail, FiLock, FiUserPlus, FiCheckCircle, FiAlertCircle} from 'react-icons/fi';
import api from '../services/api';

export default function Register(){
  const [formdata, setFormdata] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if(token){
      navigate('/');
    }
  },[navigate]);

  const handleChange = (e)=>{
    setFormdata({
      ...formdata,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = ()=>{
    if(formdata.password !== formdata.confirmPassword){
      setError('Passwords do not match');
      return false;
    }
    
    if(formdata.password.length < 6){
      setError('Password must be at least 6 characters long');
      return false;
    }

    if(formdata.name.trim().length < 2){ 
      setError('Name must be at least 2 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();
    
    if(!validateForm()) return;
    
  setLoading(true);
  setError('');

    try{
      const {data} = await api.post('/auth/register',{
        name: formdata.name.trim(),
        email: formdata.email.toLowerCase(),
        password: formdata.password
      });
      
      setSuccess(data.message);
      
      setTimeout(() =>{
        navigate('/login',{ 
          state:{ 
            message: 'Registration successful! Please check your email and verify your account before logging in.' 
          } 
        });
      }, 3000);

    } 
    catch(err){
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
    } 
    finally{
      setLoading(false);
    }
  };

  return(
    <div className="container">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p className="muted">Join DSA Menu and start your coding journey</p>
          </div>

          {error && (
            <div className="error-message">
              <FiAlertCircle size={16} style={{marginRight: '8px', verticalAlign: 'middle' }}/>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <FiCheckCircle size={16} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
              {success}
              <p className="muted" style={{marginTop: '10px'}}>
                Redirecting to login page...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <FiUser size={16} className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formdata.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="form-input"
                  minLength="2" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <FiMail size={16} className="input-icon"/>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formdata.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                  className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <FiLock size={16} className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formdata.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 6 characters)"
                  required
                  className="form-input"
                  minLength="6" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <FiLock size={16} className="input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formdata.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className="form-input"
                  minLength="6"/>
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              <FiUserPlus size={16} style={{marginRight: '8px'}} />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="muted">
              Already have an account?{' '}
              <Link to="/login" className="link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
