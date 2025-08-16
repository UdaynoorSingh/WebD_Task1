import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import api from './services/api';
import Navbar from './components/Navbar';
import CategoryAccordion from './components/CategoryAccordion';
import AuthModal from './components/AuthModal';
import Dashboard from './pages/Dashboard';

function Home() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [theme, setTheme] = useState(() => (document.documentElement.classList.contains('light') ? 'light' : 'dark'));

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('title_asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  const [data, setData] = useState({ categories: [], pagination: { totalPages: 1, currentPage: 1 }});
  const [loading, setLoading] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);

  const [bookmarked, setBookmarked] = useState(new Set());
  const [completed, setCompleted] = useState(new Set());

  // Fetch user progress/bookmarks on load
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user) return;
      try {
        const { data } = await api.get('/user/dashboard');
        setCompleted(new Set((data.completedQuestions || []).map(q => q.question._id || q.question)));
        setBookmarked(new Set((data.bookmarkedQuestions || []).map(q => q.question._id || q.question)));
      } catch {}
    };
    fetchUserProgress();
  }, [user]);

  // Debounce search 300ms
  const searchTimeout = useRef();
  const handleSearch = (val) => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setQuery(val);
      setPage(1);
    }, 300);
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/content', {
        params: { search: query, page, limit, sortBy }
      });
      setData(data);
    } catch (e) {
      // noop simple UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContent(); }, [query, page, limit, sortBy]);

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const onToggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'light') {
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
    }
  };

  const toggleBookmark = async (qid, add) => {
    if (!user) { setAuthOpen(true); return; }
    try {
      await api.post('/user/bookmarks', { questionId: qid, action: add ? 'add' : 'remove' });
      setBookmarked((prev) => {
        const next = new Set(prev);
        if (add) next.add(qid); else next.delete(qid);
        return next;
      });
    } catch {}
  };

  const toggleComplete = async (qid, done) => {
    if (!user) { setAuthOpen(true); return; }
    try {
      await api.post('/user/progress', { questionId: qid, action: done ? 'complete' : 'uncomplete' });
      setCompleted((prev) => {
        const next = new Set(prev);
        if (done) next.add(qid); else next.delete(qid);
        return next;
      });
    } catch {}
  };

  return (
    <>
      <Navbar
        user={user}
        onLogout={onLogout}
        onOpenAuth={()=>setAuthOpen(true)}
        onSearch={handleSearch}
        onSort={(v)=> setSortBy(v)}
        theme={theme}
         onToggleTheme={onToggleTheme} 
      />

      <div className="container" style={{ marginTop: 16 }}>
        <div className="grid-2">
          <div>
            <div className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="section-title">Categories</div>
                <div className="muted">{data?.pagination?.totalQuestions || 0} total questions</div>
              </div>
              {loading ? (
                <div className="muted" style={{ padding: 12 }}>Loading...</div>
              ) : (
                <CategoryAccordion
                  categories={data.categories || []}
                  onToggleBookmark={toggleBookmark}
                  onToggleComplete={toggleComplete}
                  bookmarks={bookmarked}
                  completed={completed}
                />
              )}
            </div>

            <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
              <div className="pagination">
                <button className="button ghost" disabled={page<=1} onClick={()=>setPage((p)=>Math.max(1,p-1))}>Prev</button>
                <span className="muted">Page {data?.pagination?.currentPage || page} / {data?.pagination?.totalPages || 1}</span>
                <button className="button" disabled={page>=(data?.pagination?.totalPages||1)} onClick={()=>setPage((p)=>p+1)}>Next</button>
              </div>
            </div>
          </div>

          <div className="sidebar">
            <div className="card">
              {user ? (
                <Link className="button" to="/dashboard">Open Dashboard</Link>
              ) : (
                <>
                  <div className="muted">Login to track progress and bookmarks.</div>
                  <button className="button" onClick={()=>setAuthOpen(true)}>Login / Register</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={()=>setAuthOpen(false)} onSuccess={(u)=>setUser(u)} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

