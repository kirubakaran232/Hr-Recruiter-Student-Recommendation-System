import {
  LayoutDashboard, User, FileText, Github, Globe, Terminal, Briefcase, Bot, Sparkles, Lock, LogOut, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useProfile } from '../../context/ProfileContext.jsx';

const NAV_ITEMS = [
  { id: 'overview', label: 'Dashboard & Analytics', icon: LayoutDashboard, locked: false },
  { id: 'resume', label: 'Resume', icon: FileText, locked: false },
  { id: 'github', label: 'GitHub', icon: Github, locked: false },
  { id: 'coding', label: 'Coding', icon: Terminal, locked: false },
  { id: 'portfolio', label: 'Portfolio', icon: Globe, locked: false },
  { id: 'jobs', label: 'Job Match & Skill Gap', icon: Briefcase, locked: false },
  { id: 'assistant', label: 'AI Career Assistant', icon: Bot, locked: false },
  { id: 'profile', label: 'Profile', icon: User, locked: false }
];

export default function Sidebar({ active, onNavigate }) {
  const { logout, profile } = useAuth();
  const { scores } = useProfile();

  return (
    <aside className='dash-sidebar'>
      <div className='dash-sidebar-brand'>
        <div className='sidebar-logo-pill'>TalentOS AI</div>
      </div>

      <nav className='dash-sidebar-nav'>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              className={`dash-nav-item${isActive ? ' active' : ''}${item.locked ? ' locked' : ''}`}
              onClick={() => !item.locked && onNavigate(item.id)}
              title={item.locked ? 'Coming soon' : item.label}
              type='button'
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.locked ? <Lock size={11} className='nav-lock' /> : isActive ? <ChevronRight size={14} /> : null}
            </button>
          );
        })}
      </nav>

      <div className='dash-sidebar-bottom'>
        <div className='sidebar-completion-bar'>
          <div className='sidebar-completion-label'>
            <span>Profile</span>
            <strong>{scores.profileCompletion}%</strong>
          </div>
          <div className='sidebar-completion-track'>
            <div className='sidebar-completion-fill' style={{ width: `${scores.profileCompletion}%` }} />
          </div>
        </div>

        <div className='sidebar-user-row'>
          <div className='sidebar-avatar'>
            {profile?.name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className='sidebar-user-info'>
            <span className='sidebar-user-name'>{profile?.name || profile?.email?.split('@')[0] || 'User'}</span>
            <span className='sidebar-user-role'>{profile?.role || 'User'}</span>
          </div>
          <button className='sidebar-logout' onClick={logout} title='Logout' type='button'>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
