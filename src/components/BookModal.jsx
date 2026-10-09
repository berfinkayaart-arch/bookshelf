import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

export default function BookModal({ book, onClose, onUpdate, onDelete }) {
  const [notes, setNotes] = useState(book.notes || '');
  const [rating, setRating] = useState(book.rating || 0);
  const [status, setStatus] = useState(book.status);
  const [isFavorite, setIsFavorite] = useState(book.isFavorite || false);

  const handleSave = () => {
    onUpdate({
      ...book,
      notes,
      rating,
      status,
      isFavorite
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("Bu kitabı silmek istediğinize emin misiniz?")) {
      onDelete(book.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 15, right: 15, color: 'var(--text-dark)' }}
        >
          <X size={24} />
        </button>
        
        <div style={{ flex: '0 0 180px' }}>
          {book.coverUrl ? (
             <img src={book.coverUrl} alt="Cover" style={{ width: '100%', borderRadius: 10, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }} />
          ) : (
             <div style={{ width: '100%', height: 260, background: '#e0e0e0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               No Cover
             </div>
          )}
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{book.title}</h2>
              <p style={{ fontSize: 18, opacity: 0.8, margin: 0 }}>{book.author}</p>
              {book.pageCount > 0 && <p style={{ fontSize: 14, opacity: 0.6, marginTop: 5 }}>{book.pageCount} pages</p>}
            </div>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFavorite ? '#FFD700' : 'var(--text-dark)' }}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              <Star size={28} fill={isFavorite ? '#FFD700' : 'none'} />
            </button>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 5 }}>Status</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              style={{
                width: '100%', padding: 10, borderRadius: 10, border: '1px solid var(--border-glass-light)',
                background: 'rgba(255,255,255,0.5)', outline: 'none'
              }}
            >
              <option value="READ">Read</option>
              <option value="OWNED_UNREAD">Owned (Unread)</option>
              <option value="WISHLIST">Wishlist</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 5 }}>Rating</label>
            <div style={{ display: 'flex', gap: 5 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  style={{ color: star <= rating ? '#FFD700' : '#ccc' }}
                >
                  <Star fill={star <= rating ? '#FFD700' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 5 }}>Analysis & Review</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Kitap analizinizi ve okuma notlarınızı buraya yazın..."
              style={{
                width: '100%', height: '100px', padding: 10, borderRadius: 10, border: '1px solid var(--border-glass-light)',
                background: 'rgba(255,255,255,0.5)', outline: 'none', resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button 
              onClick={handleDelete}
              style={{
                background: 'rgba(255,50,50,0.8)', color: 'white', fontWeight: 600,
                padding: '12px', borderRadius: '10px', flex: 1, border: 'none', cursor: 'pointer'
              }}
            >
              Kitabı Sil
            </button>
            <button 
              onClick={handleSave}
              style={{
                background: 'var(--primary-color)', color: 'white', fontWeight: 600,
                padding: '12px', borderRadius: '10px', flex: 2, border: 'none', cursor: 'pointer'
              }}
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
