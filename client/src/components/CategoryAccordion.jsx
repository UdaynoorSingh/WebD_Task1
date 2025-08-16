import React, { useState } from 'react';

export default function CategoryAccordion({
  categories,
  onToggleBookmark,
  onToggleComplete,
  bookmarks = new Set(),
  completed = new Set(),
}) {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="accordion">
      {categories.map((cat) => (
        <div className="accordion-item" key={cat._id}>
          <div className="accordion-header" onClick={() => setOpenId(openId === cat._id ? null : cat._id)}>
            <div className="row" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="accordion-title">{cat.title}</div>
              <span className="muted" style={{ marginLeft: 'auto', marginRight: '5px', fontWeight: 500 }}>{cat.questions.length}</span>
            </div>
            <div>{openId === cat._id ? '▴' : '▾'}</div>
          </div>
          <div className="accordion-body" style={{ height: openId === cat._id ? undefined : 0 }}>
            {openId === cat._id && (
              <div>
                {cat.questions.map((q) => (
                  <div className="question" key={q._id}>
                    <a href={q.url} target="_blank" rel="noreferrer">{q.title}</a>
                    <label className="row">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={completed.has(q._id)}
                        onChange={() => onToggleComplete(q._id, !completed.has(q._id))}
                      />
                      <span className="muted">Done</span>
                    </label>
                    <button className="icon-btn" onClick={() => onToggleBookmark(q._id, !bookmarks.has(q._id))}>
                      {bookmarks.has(q._id) ? '★' : '☆'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

