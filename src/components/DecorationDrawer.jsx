import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronUp, ChevronDown } from 'lucide-react';

const DECORATION_IMAGES = [
  'k-sus.png', 'k-sus1.png', 'k-sus2.png', 'k-sus3.png', 
  'k-sus4.png', 'k-sus5.png', 'k-sus6.png', 'k-sus7.png', 'sarmasik.png'
];

function DrawerItem({ type, onAdd }) {
  return (
    <div 
      style={{
        flex: '0 0 100px', height: '100px', background: 'rgba(255,255,255,0.2)',
        borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'transform 0.2s'
      }}
      onClick={() => onAdd(type)}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      title="Click to add to room"
    >
      <img src={`/assets/${type}`} style={{ maxHeight: '80px', maxWidth: '80px', objectFit: 'contain' }} alt="Decoration" />
    </div>
  );
}

export function PlacedDecoration({ decoration, onDelete }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `deco-${decoration.id}`,
  });

  const style = {
    position: 'absolute',
    left: `${decoration.x}%`,
    top: `${decoration.y}%`,
    zIndex: 30, // Above books, below modals
    cursor: 'grab',
    ...(transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      zIndex: 100,
    } : {})
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="placed-deco"
    >
      <img src={`/assets/${decoration.type}`} style={{ maxHeight: '150px', objectFit: 'contain', pointerEvents: 'none' }} alt="Decoration" />
      <button 
        className="delete-deco-btn" 
        onClick={(e) => { e.stopPropagation(); onDelete(decoration.id); }}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', top: -10, right: -10, background: 'rgba(255,0,0,0.7)', 
          color: 'white', borderRadius: '50%', width: 24, height: 24, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, opacity: 0, transition: 'opacity 0.2s', zIndex: 10
        }}
      >
        ✕
      </button>
      <style>{`.placed-deco:hover .delete-deco-btn { opacity: 1 !important; }`}</style>
    </div>
  );
}

export default function DecorationDrawer({ isOpen, toggleDrawer, onAddDecoration }) {
  return (
    <>
      <button 
        onClick={toggleDrawer}
        className="glass"
        style={{
          position: 'absolute', bottom: isOpen ? 250 : 20, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: 10,
          zIndex: 95, transition: 'bottom 0.4s ease', fontWeight: 600, color: 'var(--text-dark)'
        }}
      >
        {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        {isOpen ? 'Close Decorations' : 'Open Decorations'}
      </button>

      <div className={`decoration-drawer glass ${isOpen ? 'open' : ''}`}>
        {DECORATION_IMAGES.map(type => (
          <DrawerItem key={type} type={type} onAdd={onAddDecoration} />
        ))}
      </div>
    </>
  );
}
