import React, { useState } from 'react';

export default function Navbar({
  user,
  onLogout,
  onOpenAuth,
  onSearch,
  onSort,
  theme,
  onToggleTheme,
}) {
  const [term, setTerm] = useState('');
  const [sort, setSort] = useState('title_asc');

  const handleSearch = (e) => {
    const value = e.target.value;
    setTerm(value);
    onSearch(value);
  };
  const handleSort = (e) => {
    setSort(e.target.value);
    onSort(e.target.value);
  };

  return (
    <div className="navbar">
      <div className="navbar-inner container">
        <div className="brand">DSA Menu</div>
        <input className="input" value={term} onChange={handleSearch} placeholder="Search questions..." />
        <select className="select" value={sort} onChange={handleSort}>
          <option value="title_asc">Title (A-Z)</option>
          <option value="title_desc">Title (Z-A)</option>
        </select>
        <button className="icon-btn" onClick={onToggleTheme}>{theme === 'light' ? '🌞' : '🌙'}</button>
        {user ? (
          <>
            <span className="muted">{user.name}</span>
            <button className="button" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button className="button" onClick={onOpenAuth}>Login</button>
        )}
      </div>
    </div>
  );
}

