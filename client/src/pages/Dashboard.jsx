import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {FiHome, FiLogOut, FiCheckCircle, FiBookmark, FiTrendingUp, FiCalendar} from 'react-icons/fi';
import api from '../services/api';

export default function Dashboard(){
  const [data, setdata] = useState(null);
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState('');
  const navigate = useNavigate();

  useEffect(()=>{
    const checkAuth = ()=>{
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if(!token || !user){
        navigate('/');
        return;
      }
    };

    const loadDashboard = async ()=>{
      try{
        setloading(true);
        seterror('');
        
        const {data} = await api.get('/user/dashboard');
        setdata(data);
      } 
      catch(err){
        if(err?.response?.status === 401){
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
          return;
        }
        seterror(err?.response?.data?.error || 'Failed to load dashboard data');
      } 
      finally{
        setloading(false);
      }
    };

    checkAuth();
    loadDashboard();
  },[navigate]);

  const handleLogout = ()=>{
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if(loading){
    return(
      <div className="container">
        <div className="card" style={{textAlign: 'center', padding: '40px 20px'}}>
          <div className="muted">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  if(error){
    return(
      <div className="container">
        <div className="card" style={{textAlign: 'center', padding: '40px 20px'}}>
          <div className="muted" style={{color: 'tomato', marginBottom: '20px'}}>{error}</div>
          <button className="button" onClick={()=> window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if(!data) return null;

  const totalQuestions = data.totalQuestions || 0;
  const progressPercentage = totalQuestions > 0 ? Math.round((data.completedCount/totalQuestions)*100) : 0;

  return(
    <div className="container">
      <div className="card" style={{marginTop: 16}}>
        <div className="row" style={{justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
          <div className="section-title">
            <FiTrendingUp size={20} style={{marginRight: '8px', verticalAlign: 'middle'}}/>
            Your Progress Dashboard
          </div>
          <div style={{display:'flex', gap:'12px'}}>
            <button className="button ghost" onClick={() => navigate('/')}>
              <FiHome size={16} style={{marginRight: '6px'}} />
              Back to Home
            </button>
            <button className="button ghost" onClick={handleLogout}>
              <FiLogOut size={16} style={{marginRight: '6px'}} />
              Logout
            </button>
          </div>
        </div>
        <div style={{marginTop: 24}}>
          <div className="row" style={{justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap'}}>
            <div className="muted">
              <FiTrendingUp size={16} style={{marginRight: '6px', verticalAlign: 'middle'}}/>
              Overall Progress
            </div>
            <div className="badge" title={`${progressPercentage}%`}>{progressPercentage}%</div>
          </div>
          <div className="progress-bar-bg" title={`Completed: ${data.completedCount}/${totalQuestions}`}>
            <div className="progress-bar-fill" style={{width:`${progressPercentage}%`}}></div>
          </div>
          <div className="row" style={{justifyContent: 'space-between', fontSize: '1rem', flexWrap: 'wrap', marginTop: 6}}>
            <span className="muted">
              <FiCheckCircle size={14} style={{marginRight: '4px', verticalAlign: 'middle'}} />
              Completed: {data.completedCount}
            </span>
            <span className="muted">
              <FiBookmark size={14} style={{marginRight: '4px', verticalAlign: 'middle'}} />
              Bookmarked: {data.bookmarkedCount || 0}
            </span>
            <span className="muted">Total: {totalQuestions}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: 16}}>
        <div className="section-title">
          <FiCheckCircle size={20} style={{marginRight: '8px', verticalAlign: 'middle' }}/>
          Completed Questions
        </div>
        {data.completedQuestions?.length > 0 ? (
          <div>
            {data.completedQuestions.map((item) => (
              <div key={item._id} style={{ 
                padding: '12px 0', 
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'}}>
                <div>
                  <a href={item.question.url} target="_blank" rel="noreferrer"style={{color: 'var(--text)', textDecoration: 'none'}}>
                    {item.question.title}
                  </a>
                </div>
                <div className="muted" style={{fontSize: '12px', display: 'flex', alignItems: 'center'}}>
                  <FiCalendar size={12} style={{marginRight: '4px'}} />
                  {new Date(item.completedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="muted" style={{textAlign: 'center', padding: '20px'}}>
            No completed questions yet. Start solving problems to track your progress!
          </div>
        )}
      </div>

      <div className="card" style={{marginTop: 16}}>
        <div className="section-title">
          <FiBookmark size={20} style={{marginRight:'8px', verticalAlign:'middle'}} />
          Bookmarked Questions
        </div>
        {data.bookmarkedQuestions?.length > 0 ? (
          <div>
            {data.bookmarkedQuestions.map((item) =>(
              <div key={item._id} style={{ 
                padding: '12px 0', 
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <a  href={item.question.url}  target="_blank"  rel="noreferrer" style={{color: 'var(--text)', textDecoration: 'none'}}>
                    {item.question.title}
                  </a>
                </div>
                <div className="muted" style={{fontSize: '12px', display: 'flex', alignItems: 'center'}}>
                  <FiCalendar size={12} style={{marginRight:'4px'}} />
                  {new Date(item.bookmarkedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="muted" style={{textAlign: 'center', padding: '20px'}}>
            No bookmarked questions yet. Bookmark interesting problems to save them for later!
          </div>
        )}
      </div>
    </div>
  );
}