import { useCallback, useState } from 'react';
import { filesApi } from '../services/api';

export default function UploadZone({ onUploadComplete }) {
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState([]);

  const processFiles = async (files) => {
    for (const file of Array.from(files)) {
      const id = Date.now() + Math.random();
      setUploads(prev => [...prev, { id, name: file.name, progress: 0, status: 'uploading' }]);

      try {
        await filesApi.upload(file, (progress) => {
          setUploads(prev => prev.map(u => u.id === id ? { ...u, progress } : u));
        });
        setUploads(prev => prev.map(u => u.id === id ? { ...u, progress: 100, status: 'done' } : u));
        onUploadComplete?.();
        setTimeout(() => setUploads(prev => prev.filter(u => u.id !== id)), 3000);
      } catch {
        setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'error' } : u));
      }
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  }, []);

  return (
    <div className="upload-section">
      <div
        className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <div className="drop-icon">⬆</div>
        <p className="drop-main">Drop files here or click to browse</p>
        <p className="drop-sub">Any file type up to 100MB</p>
        <input
          id="file-input"
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {uploads.length > 0 && (
        <div className="upload-list">
          {uploads.map(u => (
            <div key={u.id} className="upload-item">
              <div className="upload-info">
                <span className="upload-name">{u.name}</span>
                <span className={`upload-status ${u.status}`}>
                  {u.status === 'done' ? '✓ Done' : u.status === 'error' ? '✗ Failed' : `${u.progress}%`}
                </span>
              </div>
              {u.status === 'uploading' && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${u.progress}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
