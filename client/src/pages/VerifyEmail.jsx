import React, {useState, useEffect} from 'react';
import {useSearchParams, Link, useNavigate} from 'react-router-dom';
import api from '../services/api';

export default function VerifyEmail(){
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    const verifyEmail = async ()=>{
      const token = searchParams.get('token');
      
      if(!token){
        setError('Verification token is missing');
        setLoading(false);
        return;
      }

      try{
        const {data} = await api.get(`/auth/verify-email?token=${token}`);
        setSuccess(data.message);
        
        setTimeout(() =>{
          navigate('/login',{ 
            state:{ 
              message: 'Email verified successfully! You can now login to your account.' 
            } 
          });
        }, 3000);

      } 
      catch(err){
        const errorMessage = err.response?.data?.error || 'Email verification failed. Please try again.';
        setError(errorMessage);
      } 
      finally{
        setLoading(false);
      }
    };

    verifyEmail();
  },[searchParams, navigate]);

  if(loading){
    return (
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Verifying Email</h1>
              <p className="muted">Please wait while we verify your email address...</p>
            </div>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div className="container">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Email Verification</h1>
          </div>

          {error && (
            <div className="error-message">
              <h3>Verification Failed</h3>
              <p>{error}</p>
              <div className="auth-actions">
                <Link to="/register" className="button"> Register Again </Link>
                <Link to="/login" className="button ghost">Go to Login</Link>
              </div>
            </div>
          )}

          {success && (
            <div className="success-message">
              <h3>Verification Successful!</h3>
              <p>{success}</p>
              <p className="muted">Redirecting to login page...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
