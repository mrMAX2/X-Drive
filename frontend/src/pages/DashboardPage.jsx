import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { filesApi } from '../services/api';
import { formatFileSize } from '../utils/helpers';
import UploadZone from '../components/UploadZone';
import FileGrid from '../components/FileGrid';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await filesApi.getMyFiles();
      setFiles(res.data.data || []);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const filtered = files.filter(f => {
    const matchSearch = (f.originalName || f.fileName || '').toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchSearch;
    if (filter === 'images') return matchSearch && f.contentType?.startsWith('image/');
    if (filter === 'docs') return matchSearch && (f.contentType?.includes('pdf') || f.contentType?.includes('word') || f.contentType?.includes('document'));
    if (filter === 'other') return matchSearch && !f.contentType?.startsWith('image/') && !f.contentType?.includes('pdf') && !f.contentType?.includes('word');
    return matchSearch;
  });

  const totalSize = files.reduce((sum, f) => sum + (f.fileSize || 0), 0);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">X</div>
          <span className="logo-text">X-DRIVE</span>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-icon">🗂</span> My Files
          </button>
          <button className="nav-item" disabled>
            <span className="nav-icon">📁</span> Folders
            <span className="nav-badge">Soon</span>
          </button>
          <button className="nav-item" disabled>
            <span className="nav-icon">🔗</span> Shared
            <span className="nav-badge">Soon</span>
          </button>
          <button className="nav-item" disabled>
            <span className="nav-icon">🗑</span> Trash
            <span className="nav-badge">Soon</span>
          </button>
        </nav>

        <div className="sidebar-stats">
          <div className="stat-label">Storage Used</div>
          <div className="stat-bar">
            <div className="stat-fill" style={{ width: '35%' }} />
          </div>
          <div className="stat-numbers">
            <span>{formatFileSize(totalSize)}</span>
            <span>/ 15 GB</span>
          </div>
          <div className="stat-count">{files.length} files</div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{(user?.fullName || user?.username || 'U')[0].toUpperCase()}</div>
          <div className="user-info">
            <p className="user-name">{user?.fullName || user?.username}</p>
            <p className="user-email">{user?.email}</p>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">⎋</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">My Files</h1>
            <p className="page-sub">{files.length} files · {formatFileSize(totalSize)}</p>
          </div>
          <div className="topbar-right">
            <input
              className="search-input"
              placeholder="Search files..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <UploadZone onUploadComplete={fetchFiles} />

        <div className="filter-tabs">
          {['all', 'images', 'docs', 'other'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && <span className="tab-count">{files.length}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : (
          <FileGrid files={filtered} onRefresh={fetchFiles} />
        )}
      </main>
    </div>
  );
}
