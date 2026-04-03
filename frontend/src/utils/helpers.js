export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export function getFileIcon(contentType) {
  if (!contentType) return '📄';
  if (contentType.startsWith('image/')) return '🖼️';
  if (contentType.startsWith('video/')) return '🎬';
  if (contentType.startsWith('audio/')) return '🎵';
  if (contentType.includes('pdf')) return '📑';
  if (contentType.includes('zip') || contentType.includes('compressed')) return '🗜️';
  if (contentType.includes('spreadsheet') || contentType.includes('excel')) return '📊';
  if (contentType.includes('word') || contentType.includes('document')) return '📝';
  return '📄';
}

export function getFileColor(contentType) {
  if (!contentType) return '#6b7280';
  if (contentType.startsWith('image/')) return '#8b5cf6';
  if (contentType.startsWith('video/')) return '#ef4444';
  if (contentType.startsWith('audio/')) return '#f59e0b';
  if (contentType.includes('pdf')) return '#ef4444';
  if (contentType.includes('zip')) return '#f59e0b';
  if (contentType.includes('spreadsheet') || contentType.includes('excel')) return '#10b981';
  if (contentType.includes('word') || contentType.includes('document')) return '#3b82f6';
  return '#6b7280';
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
