export default function EmptyState({ icon: Icon, title, message, action, onAction }) {
  return (
    <div className='empty-state'>
      {Icon && (
        <div className='empty-state-icon'>
          <Icon size={28} color='#9ca3af' />
        </div>
      )}
      <h3 className='empty-state-title'>{title}</h3>
      <p className='empty-state-msg'>{message}</p>
      {action && onAction && (
        <button className='empty-state-btn' onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
