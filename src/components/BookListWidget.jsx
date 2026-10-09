import React from 'react';
import { X, Book, CheckCircle, Clock } from 'lucide-react';

export default function BookListWidget({ isOpen, onClose, books, onBookClick }) {
  const readBooks = books.filter(b => b.status === 'READ');
  const unreadBooks = books.filter(b => b.status === 'OWNED_UNREAD');

  return (
    <div className={`add-book-widget glass ${isOpen ? 'open' : ''}`}>
      <button onClick={onClose} style={{ position: 'absolute', top: 15, right: 15, color: 'var(--text-dark)' }}>
        <X size={24} />
      </button>
      
      <h2 style={{ marginBottom: 20, fontSize: 24, fontWeight: 600 }}>Kitaplığım</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '60vh', overflowY: 'auto', paddingRight: 5 }}>
        
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, marginBottom: 10, color: '#4CAF50' }}>
            <CheckCircle size={20} /> Okuduklarım ({readBooks.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {readBooks.map(book => (
              <div 
                key={book.id} 
                onClick={() => onBookClick(book)}
                style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 10, background: 'rgba(255,255,255,0.4)', borderRadius: 10, cursor: 'pointer' }}
              >
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt="Cover" style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                ) : (
                  <div style={{ width: 40, height: 60, background: '#ccc', borderRadius: 4 }} />
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{book.title}</div>
                  <div style={{ fontSize: 14, opacity: 0.8 }}>{book.author}</div>
                </div>
              </div>
            ))}
            {readBooks.length === 0 && <p style={{ opacity: 0.6, fontSize: 14 }}>Henüz okuduğunuz bir kitap yok.</p>}
          </div>
        </div>

        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, marginBottom: 10, color: '#2196F3' }}>
            <Clock size={20} /> Okunacaklarım ({unreadBooks.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {unreadBooks.map(book => (
              <div 
                key={book.id} 
                onClick={() => onBookClick(book)}
                style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 10, background: 'rgba(255,255,255,0.4)', borderRadius: 10, cursor: 'pointer' }}
              >
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt="Cover" style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                ) : (
                  <div style={{ width: 40, height: 60, background: '#ccc', borderRadius: 4 }} />
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{book.title}</div>
                  <div style={{ fontSize: 14, opacity: 0.8 }}>{book.author}</div>
                </div>
              </div>
            ))}
            {unreadBooks.length === 0 && <p style={{ opacity: 0.6, fontSize: 14 }}>Henüz eklenecek bir kitap yok.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}
