export default function ScoreCard({ label, score = 0, icon: Icon, description, status = 'pending', color = '#ffdc5d' }) {
  const statusConfig = {
    active: { label: 'Active', bg: '#dcfce7', text: '#15803d' },
    pending: { label: 'Not Connected', bg: '#fef3c7', text: '#92400e' },
    locked: { label: 'Coming Soon', bg: '#f3f4f6', text: '#6b7280' }
  };
  const chip = statusConfig[status] || statusConfig.pending;

  return (
    <div className='score-metric-card'>
      <div className='metric-card-top'>
        <div className='metric-icon-wrap' style={{ background: `${color}22` }}>
          <Icon size={20} color={color} />
        </div>
        <span className='metric-status-chip' style={{ background: chip.bg, color: chip.text }}>
          {chip.label}
        </span>
      </div>
      <div className='metric-score-row'>
        <span className='metric-score-value' style={{ color: status === 'locked' ? '#9ca3af' : '#111111' }}>
          {score}
        </span>
        <span className='metric-score-denom'>/100</span>
      </div>
      <div className='metric-label'>{label}</div>
      <div className='metric-progress-track'>
        <div
          className='metric-progress-fill'
          style={{
            width: `${score}%`,
            background: status === 'locked' ? '#d1d5db' : color
          }}
        />
      </div>
      {description && <p className='metric-description'>{description}</p>}
    </div>
  );
}
