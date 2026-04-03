import { useState } from 'react';
import { filesApi } from '../services/api';
import { formatFileSize, formatDate, getFileIcon, getFileColor, downloadBlob } from '../utils/helpers';

export default function FileGrid({ files, onRefresh }) {
  const [downloading, setDownloading] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [shareMsg, setShareMsg] = useState({});

  const handleDownload = async (file) => {
    setDownloading(file.id);
    try {
      const res = await filesApi.download(file.id);
      downloadBlob(res.data, file.originalName || file.fileName);
    } catch (e) {
      alert('Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`Delete "${file.originalName}"?`)) return;
    setDeleting(file.id);
    try {
      await filesApi.delete(file.id);
      onRefresh?.();
    } catch {
      alert('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const handleShare = async (file) => {
    try {
      const res = await filesApi.share(file.id);
      const token = res.data.data.shareToken;
      const url = `${window.location.origin}/api/files/shared/${token}`;
      await navigator.clipboard.writeText(url);
      setShareMsg(prev => ({ ...prev, [file.id]: 'Link copied!' }));
      setTimeout(() => setShareMsg(prev => ({ ...prev, [file.id]: null })), 2500);
    } catch {
      alert('Share failed');
    }
  };

  if (files.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📂</div>
        <p className="empty-title">No files yet</p>
        <p className="empty-sub">Upload your first file to get started</p>
      </div>
    );
  }

  return (
    <div className="file-grid">
      {files.map(file => (
        <div key={file.id} className="file-card">
          <div className="file-icon" style={{ color: getFileColor(file.contentType) }}>
            {getFileIcon(file.contentType)}
          </div>
          <div className="file-details">
            <p className="file-name" title={file.originalName}>{file.originalName || file.fileName}</p>
            <p className="file-meta">{formatFileSize(file.fileSize)} · {formatDate(file.createdAt)}</p>
          </div>
          <div className="file-actions">
            <button
              className="action-btn download"
              onClick={() => handleDownload(file)}
              disabled={downloading === file.id}
              title="Download"
            >
              {downloading === file.id ? '⏳' : '⬇'}
            </button>
            <button
              className="action-btn share"
              onClick={() => handleShare(file)}
              title={shareMsg[file.id] || 'Share'}
            >
              {shareMsg[file.id] ? '✓' : '🔗'}
            </button>
            <button
              className="action-btn delete"
              onClick={() => handleDelete(file)}
              disabled={deleting === file.id}
              title="Delete"
            >
              {deleting === file.id ? '⏳' : '🗑'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
