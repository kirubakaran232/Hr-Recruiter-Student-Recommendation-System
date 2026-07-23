import { useEffect, useRef, useState } from 'react';
import { Bell, Sparkles, Check, CheckCheck, Trash2, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.jsx';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications
} from '../../../services/hrNotification.service.js';

const PAGE_TITLES = {
  'company-profile':     'Company Profile',
  'candidates':          'Candidate Intelligence Hub',
  'smart-search':        'AI Smart Candidate Search',
  'analytics':           'Recruitment Reports & Analytics',
  'settings':            'Admin Settings'
};

export default function HRTopBar({ activePage }) {
  const { profile } = useAuth();
  const userName = profile?.name || profile?.email?.split('@')[0] || 'Recruiter';

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [showDrawer,    setShowDrawer]    = useState(false);
  const drawerRef = useRef(null);

  const loadNotifs = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { loadNotifs(); }, []);

  // Close drawer on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setShowDrawer(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className='hr-topbar'>
      <div className='hr-topbar-left'>
        <div className='hr-topbar-eyebrow'>
          <Sparkles size={12} />
          <span>TalentOS AI — Recruiter Workspace</span>
        </div>
        <h1 className='hr-topbar-title'>{PAGE_TITLES[activePage] || 'Dashboard'}</h1>
      </div>

      <div className='hr-topbar-right' ref={drawerRef}>
        {/* Notification Bell with Badge */}
        <button
          className={`hr-topbar-icon-btn${showDrawer ? ' active' : ''}`}
          type='button'
          aria-label='Notifications'
          id='hr-notifications-btn'
          onClick={() => setShowDrawer((p) => !p)}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className='hr-notif-badge'>{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        <div className='hr-topbar-avatar' title={userName}>
          {userName.charAt(0).toUpperCase()}
        </div>

        {/* ── Module 8: Notification Dropdown Drawer ──────────────── */}
        {showDrawer && (
          <div className='hr-notif-drawer'>
            <div className='hr-notif-drawer-header'>
              <div className='hr-notif-header-left'>
                <h3>Notifications</h3>
                {unreadCount > 0 && <span className='hr-notif-unread-tag'>{unreadCount} new</span>}
              </div>
              <div className='hr-notif-header-right'>
                {unreadCount > 0 && (
                  <button type='button' className='hr-notif-action-btn' onClick={handleMarkAllRead} title='Mark all as read'>
                    <CheckCheck size={14} /> Read All
                  </button>
                )}
                {notifications.length > 0 && (
                  <button type='button' className='hr-notif-action-btn clear' onClick={handleClearAll} title='Clear all'>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className='hr-notif-drawer-body'>
              {notifications.length === 0 ? (
                <div className='hr-notif-empty'>
                  <Bell size={24} />
                  <p>No notifications yet</p>
                  <small>Important recruitment activities will appear here</small>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`hr-notif-item${!n.isRead ? ' unread' : ''}`}>
                    <div className='hr-notif-item-left'>
                      <span className={`hr-notif-icon-dot ${n.type}`} />
                    </div>
                    <div className='hr-notif-item-content'>
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                      <small>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                    {!n.isRead && (
                      <button
                        type='button'
                        className='hr-notif-read-btn'
                        title='Mark as read'
                        onClick={() => handleMarkRead(n.id)}
                      >
                        <Check size={12} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className='hr-notif-drawer-footer'>
              <small>Email notification delivery enabled for candidate events</small>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

