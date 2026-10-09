import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

function DraggableNote({ note, onUpdate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `note-${note.id}`,
  });

  const style = {
    left: note.x,
    top: note.y,
    width: '180px',
    height: '180px',
    // Apply transform while dragging, but keep it fixed otherwise
    ...(transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: 100,
    } : {})
  };

  return (
    <div 
      ref={setNodeRef} 
      className="memo-note" 
      style={style} 
      {...listeners} 
      {...attributes}
    >
      <img src={`/assets/${note.type}.png`} className="memo-img" alt="Note Paper" />
      
      <div className="memo-content">
        <textarea 
          className="memo-input"
          value={note.text}
          onChange={(e) => onUpdate(note.id, e.target.value)}
          placeholder="Write a note..."
          onDragStart={(e) => e.preventDefault()}
        />
      </div>
      
      {/* Delete button visible on hover */}
      <button 
        className="delete-note-btn" 
        onClick={() => onDelete(note.id)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: -5, right: -5, background: 'rgba(255,0,0,0.7)', 
          color: 'white', borderRadius: '50%', width: 24, height: 24, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, opacity: 0, transition: 'opacity 0.2s', zIndex: 10
        }}
      >
        ✕
      </button>
      <style>{`.memo-note:hover .delete-note-btn { opacity: 1 !important; }`}</style>
    </div>
  );
}

function WishlistNote({ book, index, onClick }) {
  // Use index to spread them out neatly across the board so they don't overlap
  const row = Math.floor(index / 3);
  const col = index % 3;
  
  // Base coordinates + some slight randomness
  const x = 50 + col * 140 + (Math.random() * 20 - 10);
  const y = 80 + row * 150 + (Math.random() * 20 - 10);
  const randomRotation = (Math.random() * 10) - 5;

  return (
    <div 
      className="memo-note" 
      style={{ left: x, top: y, width: '160px', height: '160px', transform: `rotate(${randomRotation}deg)` }}
      onClick={() => onClick(book)}
    >
      <img src="/assets/m-not.png" className="memo-img" alt="Wishlist Paper" />
      <div className="memo-content" style={{ cursor: 'pointer', pointerEvents: 'none' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{book.title}</span>
      </div>
    </div>
  );
}

export default function Corkboard({ notes, wishlist, onAddNote, onUpdateNote, onDeleteNote, onBookClick, onAddDecoration, onOpenAddWidget, isFullscreen }) {
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  
  const noteTypes = ['m-not', 'm-not1', 'm-not2', 'm-not3', 'm-not4'];
  const stickerTypes = ['m-sus', 'm-sus1', 'm-sus2', 'm-sus3', 'm-sus4', 'm-sus5', 'm-sus6', 'm-sus7', 'm-sus8', 'm-sus9', 'm-sus10', 'm-sus11', 'm-sus12', 'm-sus13'];

  return (
    <div className={`corkboard-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      <img src="/assets/mantarpano.png" className="corkboard-img" alt="Corkboard" />
      
      {/* Draggable standard notes */}
      {notes.map(note => (
        <DraggableNote key={note.id} note={note} onUpdate={onUpdateNote} onDelete={onDeleteNote} />
      ))}

      {/* Wishlist rendered as pinned notes */}
      {wishlist.map((book, idx) => (
        <WishlistNote key={book.id} book={book} index={idx} onClick={onBookClick} />
      ))}
      
      {isFullscreen && (
        <div className="corkboard-toolbar glass">
          <div className="toolbar-section">
            <span style={{ fontWeight: 600, fontSize: 14 }}>Not Kağıtları</span>
            <div className="toolbar-items">
              {noteTypes.map(type => (
                <button 
                  key={type}
                  onClick={() => onAddNote(type)}
                  className="toolbar-btn"
                  title="Bu not kağıdını ekle"
                >
                  <img src={`/assets/${type}.png`} alt="note type" />
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: 2, background: 'rgba(0,0,0,0.1)', margin: '0 10px' }} />

          <div className="toolbar-section">
            <span style={{ fontWeight: 600, fontSize: 14 }}>Pano Süsleri</span>
            <div className="toolbar-items">
              {stickerTypes.map(type => (
                <button 
                  key={type}
                  onClick={() => onAddDecoration(`${type}.png`)}
                  className="toolbar-btn"
                  title="Bu süsü ekle"
                >
                  <img src={`/assets/${type}.png`} alt="sticker type" />
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ width: 2, background: 'rgba(0,0,0,0.1)', margin: '0 10px' }} />
          
          <div className="toolbar-section" style={{ justifyContent: 'center', gap: 10 }}>
            <button 
              className="glass"
              onClick={onOpenAddWidget}
              style={{
                padding: '12px 20px', borderRadius: '15px', fontWeight: 'bold',
                background: 'var(--primary-color)', color: 'white', cursor: 'pointer', border: 'none'
              }}
            >
              Liste
            </button>
            <button 
              className="glass"
              onClick={() => setIsGalleryOpen(true)}
              style={{
                padding: '12px 20px', borderRadius: '15px', fontWeight: 'bold',
                background: 'rgba(255,255,255,0.6)', cursor: 'pointer', border: '1px solid var(--border-glass-light)'
              }}
            >
              Alınacak Kitapların Kapakları
            </button>
          </div>
        </div>
      )}


      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="gallery-overlay" onClick={() => setIsGalleryOpen(false)}>
          <div className="gallery-modal glass" onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '28px', color: 'var(--text-dark)' }}>Alınacak Kitaplar</h2>
            
            {wishlist.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.7, padding: '40px 0' }}>Hiç alınacak kitabınız yok.</p>
            ) : (
              <div className="gallery-grid">
                {wishlist.map(book => (
                  <div key={book.id} className="gallery-item" onClick={() => { onBookClick(book); setIsGalleryOpen(false); }}>
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} />
                    ) : (
                      <div className="no-cover-placeholder">No Cover</div>
                    )}
                    <p className="gallery-title">{book.title}</p>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              className="glass" 
              onClick={() => setIsGalleryOpen(false)}
              style={{ padding: '10px 20px', borderRadius: '10px', marginTop: '20px', float: 'right' }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
