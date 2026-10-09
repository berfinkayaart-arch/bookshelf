import React, { useState } from 'react';
import { Search, Plus, X, Loader, Upload } from 'lucide-react';

export default function AddBookWidget({ isOpen, onClose, onAddBook, mode = 'bookshelf' }) {
  const [activeTab, setActiveTab] = useState('API'); // 'API' or 'MANUAL'
  
  // API Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Manual Entry State
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualPages, setManualPages] = useState('');
  const [manualCoverBase64, setManualCoverBase64] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_HEIGHT = 400;
        const scaleSize = MAX_HEIGHT / img.height;
        canvas.height = MAX_HEIGHT;
        canvas.width = img.width * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setManualCoverBase64(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const searchBooks = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
      let parsedResults = [];
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          parsedResults = data.items.map(item => ({
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
            coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
            pageCount: item.volumeInfo.pageCount || 0,
          }));
        }
      }
      if (parsedResults.length === 0) {
        const olRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`);
        if (!olRes.ok) throw new Error('API Request failed for both services');
        const olData = await olRes.json();
        if (olData.docs && olData.docs.length > 0) {
          parsedResults = olData.docs.map(item => ({
            title: item.title,
            author: item.author_name ? item.author_name.join(', ') : 'Unknown Author',
            coverUrl: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : null,
            pageCount: item.number_of_pages_median || 0,
          }));
        }
      }
      if (parsedResults.length > 0) {
        setResults(parsedResults);
      } else {
        setResults([]);
        setErrorMsg('Kitap bulunamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      setResults([]);
      setErrorMsg('Arama sırasında bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (book, status) => {
    onAddBook({ ...book, status, rating: 0, notes: '' });
    setResults([]);
    setQuery('');
    setManualTitle('');
    setManualAuthor('');
    setManualPages('');
    setManualCoverBase64(null);
    setErrorMsg('');
    onClose();
  };

  const handleManualAdd = (e, status) => {
    e.preventDefault();
    if (!manualTitle) return;
    handleAdd({
      title: manualTitle,
      author: manualAuthor || 'Unknown Author',
      pageCount: parseInt(manualPages) || 0,
      coverUrl: manualCoverBase64
    }, status);
  };

  return (
    <div className={`add-book-widget glass ${isOpen ? 'open' : ''}`}>
      <button onClick={onClose} style={{ position: 'absolute', top: 15, right: 15, color: 'var(--text-dark)' }}>
        <X size={24} />
      </button>
      
      <h2 style={{ marginBottom: 15, fontSize: 24, fontWeight: 600 }}>Kitap Ekle</h2>
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button 
          onClick={() => setActiveTab('API')}
          style={{ flex: 1, padding: '8px', borderRadius: 10, background: activeTab === 'API' ? 'var(--primary-color)' : 'rgba(255,255,255,0.4)', color: activeTab === 'API' ? 'white' : 'var(--text-dark)', fontWeight: 600 }}
        >Kitap Ara (API)</button>
        <button 
          onClick={() => setActiveTab('MANUAL')}
          style={{ flex: 1, padding: '8px', borderRadius: 10, background: activeTab === 'MANUAL' ? 'var(--primary-color)' : 'rgba(255,255,255,0.4)', color: activeTab === 'MANUAL' ? 'white' : 'var(--text-dark)', fontWeight: 600 }}
        >Manuel Ekle</button>
      </div>
      
      {activeTab === 'API' ? (
        <>
          <form onSubmit={searchBooks} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <input 
              type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Kitap veya yazar ara..."
              style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid var(--border-glass-light)', background: 'rgba(255,255,255,0.5)', fontSize: 16, outline: 'none' }}
            />
            <button type="submit" style={{ background: 'var(--primary-color)', color: 'white', padding: '0 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? <Loader size={20} className="spinner" /> : <Search size={20} />}
            </button>
          </form>

          {errorMsg && <div style={{ color: 'red', marginBottom: 10 }}>{errorMsg}</div>}

          <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((book, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 10, background: 'rgba(255,255,255,0.4)', borderRadius: 10 }}>
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt="Cover" style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                ) : (
                  <div style={{ width: 40, height: 60, background: '#ccc', borderRadius: 4 }} />
                )}
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{book.title}</div>
                  <div style={{ fontSize: 14, opacity: 0.8 }}>{book.author}</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {mode === 'bookshelf' && (
                    <>
                      <button onClick={() => handleAdd(book, 'READ')} style={{ padding: '4px 8px', background: '#4CAF50', color: 'white', borderRadius: 5, fontSize: 12, fontWeight: 600 }}>Okundu</button>
                      <button onClick={() => handleAdd(book, 'OWNED_UNREAD')} style={{ padding: '4px 8px', background: '#2196F3', color: 'white', borderRadius: 5, fontSize: 12, fontWeight: 600 }}>Okunacak</button>
                    </>
                  )}
                  {mode === 'wishlist' && (
                    <button onClick={() => handleAdd(book, 'WISHLIST')} style={{ padding: '4px 8px', background: '#FF9800', color: 'white', borderRadius: 5, fontSize: 12, fontWeight: 600 }}>Alınacak</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <form style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input type="text" placeholder="Kitap Adı *" value={manualTitle} onChange={e => setManualTitle(e.target.value)} required style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border-glass-light)', background: 'rgba(255,255,255,0.5)', outline: 'none' }} />
          <input type="text" placeholder="Yazar Adı" value={manualAuthor} onChange={e => setManualAuthor(e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border-glass-light)', background: 'rgba(255,255,255,0.5)', outline: 'none' }} />
          <input type="number" placeholder="Sayfa Sayısı" value={manualPages} onChange={e => setManualPages(e.target.value)} style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border-glass-light)', background: 'rgba(255,255,255,0.5)', outline: 'none' }} />
          
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'rgba(255,255,255,0.4)', borderRadius: 10, cursor: 'pointer' }}>
            <Upload size={20} /> {manualCoverBase64 ? 'Kapak Yüklendi!' : 'Kapak Görseli Yükle'}
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </label>
          {manualCoverBase64 && <img src={manualCoverBase64} alt="Preview" style={{ height: 100, objectFit: 'contain', alignSelf: 'center', borderRadius: 5 }} />}
          
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {mode === 'bookshelf' && (
              <>
                <button onClick={(e) => handleManualAdd(e, 'READ')} disabled={!manualTitle} style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white', borderRadius: 10, fontWeight: 600 }}>Okundu Olarak Ekle</button>
                <button onClick={(e) => handleManualAdd(e, 'OWNED_UNREAD')} disabled={!manualTitle} style={{ flex: 1, padding: '10px', background: '#2196F3', color: 'white', borderRadius: 10, fontWeight: 600 }}>Okunacak Olarak Ekle</button>
              </>
            )}
            {mode === 'wishlist' && (
              <button onClick={(e) => handleManualAdd(e, 'WISHLIST')} disabled={!manualTitle} style={{ flex: 1, padding: '10px', background: '#FF9800', color: 'white', borderRadius: 10, fontWeight: 600 }}>Alınacaklara Ekle</button>
            )}
          </div>
        </form>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
