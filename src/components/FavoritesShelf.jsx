import React from 'react';
import { Star } from 'lucide-react';

export default function FavoritesShelf({ favoriteBooks, onBookClick }) {
  
  // Deterministic generator based on string to keep dimensions consistent per book
  const getDimension = (str, min, max) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const normalized = Math.abs(hash) / 2147483647; // 32-bit int max
    return min + normalized * (max - min);
  };

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <Star size={32} color="#FFD700" fill="#FFD700" style={{ marginBottom: '10px' }} />
        <h1>My All-Time Favorites</h1>
        <p>A curated collection of favorite reads</p>
      </div>

      <div className="minimal-shelf-wrapper">
        <div className="favorites-books-row">
          {favoriteBooks.map((book) => {
            const h = getDimension(book.id || book.title, 160, 200);
            const w = getDimension(book.id || book.title + "w", 28, 38);
            
            return (
              <div 
                key={book.id} 
                className="favorite-book"
                onClick={() => onBookClick(book)}
                style={{
                  height: `${h}px`,
                  width: `${w}px`
                }}
              >
                <div className="favorite-spine-bg" style={{
                  background: book.coverUrl ? `url(${book.coverUrl}) center/cover` : undefined,
                  filter: book.coverUrl ? 'brightness(0.8)' : 'none'
                }}></div>
                <span className="favorite-spine-title" style={{ textShadow: book.coverUrl ? '0 1px 3px rgba(0,0,0,0.8)' : 'none', color: book.coverUrl ? 'white' : 'var(--text-dark)' }}>{book.title}</span>
                
                {/* Tooltip on hover */}
                <div className="book-tooltip glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  {book.coverUrl && <img src={book.coverUrl} alt="Cover" style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 4, marginBottom: 5 }} />}
                  <strong>{book.title}</strong>
                  <span>{book.author}</span>
                  {book.rating > 0 && (
                    <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                      {Array(book.rating).fill(0).map((_, i) => (
                        <Star key={i} size={12} color="#FFD700" fill="#FFD700" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="minimal-shelf"></div>
      </div>
    </div>
  );
}
