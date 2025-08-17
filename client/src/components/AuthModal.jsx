import React, {useState} from 'react';
import api from '../services/api';

export default function AuthModal({ open, onClose, onSuccess }){
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if(!open) return null;

  const reset = ()=>{
    setName(''); 
    setEmail(''); 
    setPassword(''); 
    setError('');
  }

  const validateForm = ()=>{
    if(tab === 'register'){
      if(!name.trim()){
        setError('Name is required');
        return false;
      }
      if(name.trim().length < 2){
        setError('Name must be at least 2 characters');
        return false;
      }
    }
    
    if(!email.trim()){
      setError('Email is required');
      return false;
    }
    
    if(!email.includes('@')){
      setError('Please enter a valid email address');
      return false;
    }
    
    if(!password){
      setError('Password is required');
      return false;
    }
    
    if(password.length < 6){
      setError('Password must be at least 6 characters');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();
    setError('');
    
    if(!validateForm()){
      return;
    }
    
    setLoading(true);
    try{
      if(tab==='register'){
        const {data} = await api.post('/auth/register',{ 
          name: name.trim(), 
          email: email.trim().toLowerCase(), 
          password 
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ 
          _id: data._id, 
          name: data.name, 
          email: data.email 
        }));
        onSuccess({_id: data._id, name: data.name, email: data.email});
        reset(); 
        onClose();
      } 
      else{
        const {data} = await api.post('/auth/login',{ 
          email: email.trim().toLowerCase(), 
          password 
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({ 
          _id: data._id, 
          name: data.name, 
          email: data.email 
        }));
        onSuccess({_id: data._id, name: data.name, email: data.email });
        reset(); 
        onClose();
      }
    } 
    catch(err){
      const errorMessage = err?.response?.data?.error || 'Something went wrong. Please try again.';
      setError(errorMessage);
    } 
    finally{
      setLoading(false);
    }
  };

  const handleTabChange =(newTab)=>{
    setTab(newTab);
    reset();
  };

  return(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="tabs">
          <div className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => handleTabChange('login')}>
            Login
          </div>
          <div className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => handleTabChange('register')}>
            Register
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="card" style={{background: 'transparent', border: 'none', padding: 0}}>
          {tab==='register' && (
            <div style={{ marginBottom: 10 }}>
              <label className="section-title">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)}  placeholder="Enter your full name"required />
            </div>
          )}
          
          <div style={{ marginBottom: 10 }}>
            <label className="section-title">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address"required />
          </div>
          
          <div style={{ marginBottom: 10 }}>
            <label className="section-title">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={tab === 'register' ? 'At least 6 characters' : 'Enter your password'}required />
          </div>
          
          {error && (
            <div className="muted" style={{color: 'tomato', marginBottom: 10, fontSize: '14px'}}>{error}</div>
          )}
          
          <div className="row" style={{justifyContent: 'flex-end', gap: '10px'}}>
            <button type="button" className="button ghost" onClick={onClose}>
              Cancel
            </button>
            <button disabled={loading} className="button" type="submit">
              {loading ? 'Please wait...' : (tab === 'login' ? 'Login' : 'Register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

