import React from 'react';
import { useDraggable } from '@dnd-kit/core';

function DraggableBook({ book, onClick }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `book-${book.id}`,
  });

  // Determine if it's horizontal (OWNED_UNREAD) or vertical (READ)
  const isHorizontal = book.status === 'OWNED_UNREAD';

  // Apply default coordinates if missing
  const x = book.x !== undefined ? book.x : 50;
  const y = book.y !== undefined ? book.y : 50;

  const style = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    zIndex: 20, // Above shelf, below dragging items/modals
    cursor: 'grab',
    ...(transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: 100,
    } : {})
  };

  const coverStyle = book.coverUrl 
    ? { backgroundImage: `url(${book.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'left center' } 
    : { background: book.color || `hsl(${(book.title.length * 15) % 360}, 60%, 30%)` };

  return (
    <div 
      ref={setNodeRef}
      className={`book-spine ${isHorizontal ? 'horizontal' : 'vertical'} ${book.status === 'OWNED_UNREAD' ? 'unread' : ''}`}
      style={{ ...style, ...coverStyle }}
      title={book.title}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Only trigger click if we haven't moved (dnd-kit handles this mostly, but just in case)
        onClick(book);
      }}
    >
      <div className="spine-overlay"></div>
      <span className="spine-title">{book.title}</span>
    </div>
  );
}

export default function Bookshelf({ books, onBookClick }) {
  return (
    <div className="bookshelf-wrapper">
      <img src="/assets/kitaplık.png" className="bookshelf-img" alt="Bookshelf Frame" />
      
      {/* Render all books absolutely positioned */}
      {books.map((book) => (
        <DraggableBook key={book.id} book={book} onClick={onBookClick} />
      ))}
    </div>
  );
}
