import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {FiSun, FiMoon, FiSearch, FiUser, FiLogOut, FiLogIn} from 'react-icons/fi';

export default function Navbar({
  user,
  onLogout,
  onSearch,
  onSort,
  theme,
  onToggleTheme,
}) {
  const [term, setTerm] = useState('');
  const [sort, setSort] = useState('title_asc');

  const handleSearch = (e)=>{
    const value = e.target.value;
    setTerm(value);
    onSearch(value);
  };
  const handleSort = (e)=>{
    setSort(e.target.value);
    onSort(e.target.value);
  };

  return(
    <div className="navbar">
      <div className="navbar-inner container">
        <div className="brand">DSA Menu</div>
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input className="input" value={term} onChange={handleSearch} placeholder="Search questions..." />
        </div>
        <select className="select" value={sort} onChange={handleSort}>
          <option value="title_asc">Title (A-Z)</option>
          <option value="title_desc">Title (Z-A)</option>
        </select>
        <button className="icon-btn" onClick={onToggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>
        {user ? (
          <>
            <div className="user-info">
              <FiUser size={16} />
              <span className="muted">{user.name}</span>
            </div>
            <button className="button" onClick={onLogout}>
              <FiLogOut size={16} />
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="button">
            <FiLogIn size={16} />
            Login
          </Link>
        )}
      </div>
    </div>
  );
}

