import { Download, Heart } from 'lucide-react';

export default function DesignCardStats({ downloads, hearts }) {
  return <span className="admin-design-stats">
    <span title="Downloads" role="img" aria-label={downloads == null ? 'Download count unavailable' : `${downloads} downloads`}>
      <Download size={16} aria-hidden="true" />
      <span aria-hidden="true">{downloads?.toLocaleString() ?? '—'}</span>
    </span>
    <span title="Hearts" role="img" aria-label={hearts == null ? 'Heart count unavailable' : `${hearts} hearts`}>
      <Heart className="admin-stat-heart" size={16} fill="currentColor" aria-hidden="true" />
      <span aria-hidden="true">{hearts?.toLocaleString() ?? '—'}</span>
    </span>
  </span>;
}
