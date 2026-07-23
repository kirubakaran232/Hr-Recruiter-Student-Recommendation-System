import { useState } from 'react';
import { Lock } from 'lucide-react';
import { HRProfileProvider } from '../../context/HRProfileContext.jsx';
import HRSidebar from './components/HRSidebar.jsx';
import HRTopBar from './components/HRTopBar.jsx';
import CompanyProfileSection from './sections/CompanyProfileSection.jsx';
import CandidateMasterSection from './sections/CandidateMasterSection.jsx';
import CandidateSearchSection from './sections/CandidateSearchSection.jsx';
import HRAnalyticsSection from './sections/HRAnalyticsSection.jsx';
import HRSettingsSection from './sections/HRSettingsSection.jsx';

function ComingSoon({ title }) {
  return (
    <div className='hr-coming-soon'>
      <div className='hr-coming-soon-inner'>
        <div className='hr-coming-soon-icon'>
          <Lock size={28} />
        </div>
        <h2>{title}</h2>
        <p>This module is under development and will be available in the next release.</p>
      </div>
    </div>
  );
}

export default function HRDashboard() {
  const [activePage, setActivePage] = useState('company-profile');

  const renderContent = () => {
    switch (activePage) {
      case 'company-profile': return <CompanyProfileSection />;
      case 'candidates':      return <CandidateMasterSection />;
      case 'smart-search':    return <CandidateSearchSection />;
      case 'analytics':       return <HRAnalyticsSection />;
      case 'settings':        return <HRSettingsSection />;
      default:                return <ComingSoon title={activePage} />;
    }
  };

  return (
    <HRProfileProvider>
      <div className='hr-dashboard'>
        <HRSidebar active={activePage} onNavigate={setActivePage} />
        <div className='hr-dash-main'>
          <HRTopBar activePage={activePage} />
          <main className='hr-dash-content'>
            {renderContent()}
          </main>
        </div>
      </div>
    </HRProfileProvider>
  );
}
