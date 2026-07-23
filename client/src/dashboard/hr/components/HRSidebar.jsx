import {
  LayoutDashboard,
  Building2,
  Users,
  Search,
  BarChart3,
  Settings,
  Bot,
  LogOut,
  ChevronRight,
  Lock
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.jsx';

const NAV_ITEMS = [
  { id: 'company-profile', label: 'Company Profile',    icon: Building2,  locked: false },
  { id: 'candidates',      label: 'Candidate Hub',      icon: Users,      locked: false },
  { id: 'smart-search',    label: 'Smart Search',       icon: Search,     locked: false },
  { id: 'analytics',       label: 'Reports & Analytics',icon: BarChart3,  locked: false },
  { id: 'settings',        label: 'Admin Settings',     icon: Settings,   locked: false }
];

export default function HRSidebar({ active, onNavigate }) {
  const { logout, profile } = useAuth();

  return (
    <aside className='hr-sidebar'>
      <div className='hr-sidebar-brand'>
        <div className='hr-sidebar-logo-pill'>TalentOS AI</div>
        <span className='hr-sidebar-role-badge'>HR Portal</span>
      </div>

      <nav className='hr-sidebar-nav'>
        {NAV_ITEMS.map((item) => {
          const Icon  = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              id={`hr-nav-${item.id}`}
              className={`hr-nav-item${isActive ? ' active' : ''}${item.locked ? ' locked' : ''}`}
              onClick={() => !item.locked && onNavigate(item.id)}
              title={item.locked ? 'Coming soon' : item.label}
              type='button'
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.locked
                ? <Lock size={11} className='hr-nav-lock' />
                : isActive ? <ChevronRight size={14} /> : null}
            </button>
          );
        })}
      </nav>

      <div className='hr-sidebar-bottom'>
        <div className='hr-sidebar-user-row'>
          <div className='hr-sidebar-avatar'>
            {profile?.name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'H'}
          </div>
          <div className='hr-sidebar-user-info'>
            <span className='hr-sidebar-user-name'>{profile?.name || profile?.email?.split('@')[0] || 'HR User'}</span>
            <span className='hr-sidebar-user-role'>Recruiter</span>
          </div>
          <button className='hr-sidebar-logout' onClick={logout} title='Logout' type='button'>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
