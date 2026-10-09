import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Bookshelf from './components/Bookshelf';
import Corkboard from './components/Corkboard';
import AddBookWidget from './components/AddBookWidget';
import BookListWidget from './components/BookListWidget';
import BookModal from './components/BookModal';
import DecorationDrawer, { PlacedDecoration } from './components/DecorationDrawer';
import FavoritesShelf from './components/FavoritesShelf';
import { Moon, Sun, PlusCircle, ChevronRight, ChevronLeft, Home, Star, BookOpen } from 'lucide-react';
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';

const SAMPLE_BOOKS = [
  { id: 'sample-1', title: 'Harry Potter', author: 'J.K. Rowling', status: 'READ', rating: 5, isFavorite: true, pageCount: 309, notes: 'Büyülü bir başlangıç!' },
  { id: 'sample-2', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', status: 'READ', rating: 5, isFavorite: true, pageCount: 1178, notes: 'Epik fantastik kurgunun zirvesi.' },
  { id: 'sample-3', title: '1984', author: 'George Orwell', status: 'READ', rating: 4, isFavorite: false, pageCount: 328, notes: 'Korkutucu bir distopya.' },
  { id: 'sample-4', title: 'To Kill a Mockingbird', author: 'Harper Lee', status: 'OWNED_UNREAD', rating: 0, isFavorite: false, pageCount: 281, notes: '' },
  { id: 'sample-5', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', status: 'READ', rating: 3, isFavorite: false, pageCount: 180, notes: 'Klasik Amerikan edebiyatı.' },
  { id: 'sample-6', title: 'Pride and Prejudice', author: 'Jane Austen', status: 'READ', rating: 5, isFavorite: true, pageCount: 432, notes: 'Mükemmel karakter gelişimi.' },
  { id: 'sample-7', title: 'The Catcher in the Rye', author: 'J.D. Salinger', status: 'READ', rating: 3, isFavorite: false, pageCount: 277, notes: '' },
  { id: 'sample-8', title: 'Animal Farm', author: 'George Orwell', status: 'READ', rating: 4, isFavorite: false, pageCount: 112, notes: 'Harika bir politik hiciv.' },
  { id: 'sample-9', title: 'The Hobbit', author: 'J.R.R. Tolkien', status: 'READ', rating: 4, isFavorite: false, pageCount: 310, notes: '' },
  { id: 'sample-10', title: 'Little Women', author: 'Louisa May Alcott', status: 'OWNED_UNREAD', rating: 0, isFavorite: false, pageCount: 759, notes: '' },
  { id: 'sample-11', title: 'Fahrenheit 451', author: 'Ray Bradbury', status: 'WISHLIST', rating: 0, isFavorite: false, pageCount: 256, notes: '' },
  { id: 'sample-12', title: 'Jane Eyre', author: 'Charlotte Brontë', status: 'READ', rating: 5, isFavorite: true, pageCount: 500, notes: 'Gotik romantizm klasiği.' },
  { id: 'sample-13', title: 'The Alchemist', author: 'Paulo Coelho', status: 'READ', rating: 3, isFavorite: false, pageCount: 163, notes: '' },
  { id: 'sample-14', title: 'Brave New World', author: 'Aldous Huxley', status: 'WISHLIST', rating: 0, isFavorite: false, pageCount: 268, notes: '' },
  { id: 'sample-15', title: 'Sapiens', author: 'Yuval Noah Harari', status: 'READ', rating: 5, isFavorite: true, pageCount: 443, notes: 'İnsanlığın inanılmaz tarihi.' },
  { id: 'sample-16', title: 'Dune', author: 'Frank Herbert', status: 'OWNED_UNREAD', rating: 0, isFavorite: false, pageCount: 412, notes: '' },
  { id: 'sample-17', title: 'The Kite Runner', author: 'Khaled Hosseini', status: 'READ', rating: 4, isFavorite: false, pageCount: 371, notes: 'Çok duygusal.' },
  { id: 'sample-18', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', status: 'WISHLIST', rating: 0, isFavorite: false, pageCount: 671, notes: '' },
  { id: 'sample-19', title: 'The Hunger Games', author: 'Suzanne Collins', status: 'READ', rating: 4, isFavorite: false, pageCount: 374, notes: 'Akıcı ve sürükleyici.' },
  { id: 'sample-20', title: 'The Little Prince', author: 'Antoine de Saint-Exupéry', status: 'READ', rating: 5, isFavorite: false, pageCount: 96, notes: 'Her yaşa hitap eden bir masal.' },
].map((b, i) => ({ ...b, x: 10 + (i % 5) * 15, y: 15 + Math.floor(i / 5) * 15 }));


export default function App() {
  // 'LANDING', 'BOOKSHELF', 'CORKBOARD', 'FAVORITES'
  const [currentStep, setCurrentStep] = useState('LANDING');
  
  const [theme, setTheme] = useLocalStorage('cozy-theme', 'day');
  const [books, setBooks] = useLocalStorage('cozy-books', []);
  const [notes, setNotes] = useLocalStorage('cozy-notes', []);
  const [decorations, setDecorations] = useLocalStorage('cozy-decorations', []);
  
  // One-time migration to fix missing covers for users who clicked the "Load Sample Books" button


  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isListWidgetOpen, setIsListWidgetOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const toggleTheme = () => {
    setTheme(theme === 'day' ? 'night' : 'day');
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    if (!active) return;
    
    // Check if dragging a note (Corkboard is 500x700, but they were using raw pixels. Let's keep raw pixels for notes or convert them?)
    // Note: User only asked for Books and Decorations on bookshelf to use percentage. Let's stick to pixels for notes to be safe, or just do pixels for now? 
    // Wait, the prompt says "save its exact relative coordinates (x percentage, y percentage)".
    // Let's use percentages for books and decorations!
    
    if (active.id.startsWith('note-')) {
      setNotes((prevNotes) => prevNotes.map((note) => {
        if (`note-${note.id}` === active.id) {
          const corkboard = document.querySelector('.corkboard-wrapper');
          let scale = 1;
          if (corkboard && corkboard.offsetWidth > 0) {
            scale = corkboard.getBoundingClientRect().width / corkboard.offsetWidth;
          }
          return {
            ...note,
            x: note.x + (delta.x / scale),
            y: note.y + (delta.y / scale),
          };
        }
        return note;
      }));
    }

    if (active.id.startsWith('deco-')) {
      setDecorations((prevDecos) => prevDecos.map((deco) => {
        if (`deco-${deco.id}` === active.id) {
          // Assuming deco is now percentage, convert delta (pixels) to percentage based on 1200x900 container
          const currentX = deco.x !== undefined ? deco.x : 50;
          const currentY = deco.y !== undefined ? deco.y : 50;
          const bookshelf = document.querySelector('.bookshelf-wrapper');
          const width = bookshelf ? bookshelf.getBoundingClientRect().width : 1200;
          const height = bookshelf ? bookshelf.getBoundingClientRect().height : 900;
          
          return {
            ...deco,
            x: currentX + (delta.x / width) * 100,
            y: currentY + (delta.y / height) * 100,
          };
        }
        return deco;
      }));
    }

    if (active.id.startsWith('book-')) {
      setBooks((prevBooks) => prevBooks.map((book) => {
        if (`book-${book.id}` === active.id) {
          const currentX = book.x !== undefined ? book.x : 50;
          const currentY = book.y !== undefined ? book.y : 50;
          
          const bookshelf = document.querySelector('.bookshelf-wrapper');
          const width = bookshelf ? bookshelf.getBoundingClientRect().width : 1200;
          const height = bookshelf ? bookshelf.getBoundingClientRect().height : 900;
          
          let newX = currentX + (delta.x / width) * 100;
          let newY = currentY + (delta.y / height) * 100;
          
          // --- STRICT BOUNDARY CLAMPING ---
          // Prevent bleeding through the roof or sides
          newX = Math.max(5, Math.min(90, newX));
          newY = Math.max(8, Math.min(85, newY));

          return {
            ...book,
            x: newX,
            y: newY,
          };
        }
        return book;
      }));
    }
  };

  const addDecoration = (type) => {
    setDecorations([...decorations, {
      id: Date.now().toString(),
      type,
      x: 50, // 50%
      y: 50, // 50%
    }]);
  };

  const deleteDecoration = (id) => {
    setDecorations(decorations.filter(d => d.id !== id));
  };

  const addBook = (newBook) => {
    setBooks([...books, { ...newBook, id: Date.now().toString(), x: 50, y: 50 }]);
  };
  
  const updateBook = (updatedBook) => {
    setBooks(books.map(b => b.id === updatedBook.id ? updatedBook : b));
  };
  
  const deleteBook = (bookId) => {
    setBooks(books.filter(b => b.id !== bookId));
  };
  
  const addNote = (type) => {
    const newNote = {
      id: Date.now().toString(),
      text: '',
      type: type,
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50,
    };
    setNotes([...notes, newNote]);
  };
  
  const updateNote = (id, text) => {
    setNotes(notes.map(n => n.id === id ? { ...n, text } : n));
  };
  
  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className={`scene-container ${theme}`}>
      <div 
        className="bg-layer" 
        style={{ 
          background: currentStep === 'FAVORITES' 
            ? '#FAF8F5' 
            : `url(/assets/${currentStep === 'BOOKSHELF' ? 'kitaplıkarka.png' : (theme === 'day' ? 'acikarka.png' : 'koyuarka.png')})`,
          backgroundSize: currentStep === 'BOOKSHELF' ? '100% 100%' : 'cover'
        }}
      />
      
      <div className="controls-overlay">
        <button className="glass btn-icon" onClick={() => setCurrentStep('LANDING')} title="Ana Sayfa">
          <Home size={24} />
        </button>
        <button className="glass btn-icon" onClick={() => setCurrentStep('FAVORITES')} title="Favorilerim">
          <Star size={24} />
        </button>
        <button className="glass btn-icon" onClick={toggleTheme} title="Toggle Day/Night">
          {theme === 'day' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
        {currentStep === 'BOOKSHELF' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="glass btn-icon" onClick={() => setIsListWidgetOpen(!isListWidgetOpen)} title="Kitaplığım">
              <BookOpen size={24} />
            </button>
            <button className="glass btn-icon" onClick={() => setIsAddWidgetOpen(!isAddWidgetOpen)} title="Kitap Ekle">
              <PlusCircle size={24} />
            </button>
          </div>
        )}
      </div>

      <div className="scene-scaler">
        {currentStep === 'LANDING' && (
           <div className="landing-card glass">
             <h1>Hoş Geldin! Kendi dijital kitaplığını oluştur, okumalarını takip et ve odanı dilediğince süsle.</h1>
             <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
               <button className="enter-btn" onClick={() => setCurrentStep('BOOKSHELF')}>
                 Kütüphaneme Gir
               </button>
             </div>
           </div>
        )}

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {currentStep === 'BOOKSHELF' && (
            <Bookshelf 
              books={books.filter(b => b.status !== 'WISHLIST')} 
              onBookClick={setSelectedBook} 
            />
          )}

          {currentStep === 'CORKBOARD' && (
            <Corkboard 
              notes={notes} 
              wishlist={books.filter(b => b.status === 'WISHLIST')} 
              onAddNote={addNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
              onBookClick={setSelectedBook}
              onAddDecoration={addDecoration}
              onOpenAddWidget={() => setIsAddWidgetOpen(true)}
              isFullscreen={true}
            />
          )}

          {currentStep === 'BOOKSHELF' && decorations.filter(d => !d.type.startsWith('m-sus')).map(deco => (
            <PlacedDecoration key={deco.id} decoration={deco} onDelete={deleteDecoration} />
          ))}

          {currentStep === 'CORKBOARD' && decorations.filter(d => d.type.startsWith('m-sus')).map(deco => (
            <PlacedDecoration key={deco.id} decoration={deco} onDelete={deleteDecoration} />
          ))}

          {currentStep === 'FAVORITES' && (
            <FavoritesShelf 
              favoriteBooks={books.filter(b => b.isFavorite)} 
              onBookClick={setSelectedBook} 
            />
          )}
        </DndContext>
      </div>
      
      <AddBookWidget 
        isOpen={isAddWidgetOpen} 
        onClose={() => setIsAddWidgetOpen(false)} 
        onAddBook={addBook}
        mode={currentStep === 'CORKBOARD' ? 'wishlist' : 'bookshelf'}
      />

      <BookListWidget 
        isOpen={isListWidgetOpen}
        onClose={() => setIsListWidgetOpen(false)}
        books={books}
        onBookClick={(book) => {
          setSelectedBook(book);
          setIsListWidgetOpen(false);
        }}
      />

      {currentStep === 'BOOKSHELF' && (
        <>
          <DecorationDrawer 
            isOpen={isDrawerOpen}
            toggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
            onAddDecoration={addDecoration}
          />
          <button className="glass nav-arrow right" onClick={() => setCurrentStep('CORKBOARD')} title="Go to Corkboard">
            <ChevronRight />
          </button>
        </>
      )}

      {currentStep === 'CORKBOARD' && (
        <>
          <button className="glass nav-arrow left" onClick={() => setCurrentStep('BOOKSHELF')} title="Go to Bookshelf">
            <ChevronLeft />
          </button>
          <button className="glass nav-arrow right" onClick={() => setCurrentStep('FAVORITES')} title="Go to Favorites">
            <ChevronRight />
          </button>
        </>
      )}

      {currentStep === 'FAVORITES' && (
        <button className="glass nav-arrow left" onClick={() => setCurrentStep('CORKBOARD')} title="Go to Corkboard">
          <ChevronLeft />
        </button>
      )}

      {selectedBook && (
        <BookModal 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)}
          onUpdate={updateBook}
          onDelete={deleteBook}
        />
      )}
    </div>
  );
}
