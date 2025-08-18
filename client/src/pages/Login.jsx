import React, {useState, useEffect} from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import {FiMail, FiLock, FiLogIn, FiCheckCircle, FiAlertCircle} from 'react-icons/fi';
import api from '../services/api';

export default function Login(){
  const [formdata, setformdata] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() =>{
    const token = localStorage.getItem('token');
    if(token){
      navigate('/');
    }
  },[navigate]);

  useEffect(() =>{
    if(location.state?.message){
      setSuccess(location.state.message);
    }
  },[location]);

  const handleChange=(e)=>{
    setformdata({
      ...formdata,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setLoading(true);
    setError('');

    try{
      const {data} = await api.post('/auth/login',formdata);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setSuccess('Login successful! Redirecting...');
      
      setTimeout(()=>{
        navigate('/');
      },1000);

    } 
    catch(err){
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      
      if(err.response?.data?.needsVerification){
        setError('Please verify your email before logging in');
      }
    } 
    finally{
      setLoading(false);
    }
  };

  const handleResendVerification = async ()=>{
    if(!formdata.email){
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    try{
      await api.post('/auth/resend-verification', {email: formdata.email});
      setSuccess('Verification email sent! Please check your inbox.');
    } 
    catch(err){
      setError(err.response?.data?.error || 'Failed to resend verification email');
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
            <h1>Welcome Back</h1>
            <p className="muted">Sign in to your DSA Menu account</p>
          </div>

          {error && (
            <div className="error-message">
              <FiAlertCircle size={16} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
              {error}
              {error.includes('verify your email') && (
                <button  className="link-button"  onClick={handleResendVerification} disabled={loading}>
                  Resend verification email
                </button>
              )}
            </div>
          )}

          {success && (
            <div className="success-message">
              <FiCheckCircle size={16} style={{marginRight: '8px', verticalAlign: 'middle'}} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
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
                  placeholder="Enter your email"
                  required
                  className="form-input"/>
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
                  placeholder="Enter your password"
                  required
                  className="form-input" />
              </div>
            </div>

            <button  type="submit"  className="auth-button"  disabled={loading}>
              <FiLogIn size={16} style={{marginRight: '8px'}} />
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="muted">
              Don't have an account?{' '}
              <Link to="/register" className="link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
