import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const PAGE_TITLES = {
  overview: 'Dashboard Overview',
  profile: 'My Profile',
  resume: 'Resume Manager',
  github: 'GitHub Analysis',
  jobs: 'Job Match',
  ai: 'AI Advisor'
};

export default function TopBar({ activePage }) {
  const { profile } = useAuth();
  const userName = profile?.name || profile?.email?.split('@')[0] || 'User';

  return (
    <header className='dash-topbar'>
      <div className='topbar-left'>
        <h1 className='topbar-title'>{PAGE_TITLES[activePage] || 'Dashboard'}</h1>
        <p className='topbar-welcome'>Welcome back, {userName.split(' ')[0]} 👋</p>
      </div>
      <div className='topbar-right'>
        <button className='topbar-icon-btn' type='button' aria-label='Notifications'>
          <Bell size={18} />
        </button>
        <div className='topbar-avatar'>
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
