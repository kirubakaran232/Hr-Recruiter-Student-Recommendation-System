import { useState } from 'react';
import { ProfileProvider } from '../context/ProfileContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import OverviewSection from './sections/OverviewSection.jsx';
import ProfileSection from './sections/ProfileSection.jsx';
import AIAnalysisSection from './sections/AIAnalysisSection.jsx';
import ResumeIntelligenceSection from './sections/ResumeIntelligenceSection.jsx';
import GitHubAnalysisSection from './sections/GitHubAnalysisSection.jsx';
import PortfolioAnalysisSection from './sections/PortfolioAnalysisSection.jsx';
import CodingAnalysisSection from './sections/CodingAnalysisSection.jsx';
import JobMatchSection from './sections/JobMatchSection.jsx';
import AICareerAssistantSection from './sections/AICareerAssistantSection.jsx';
import EmptyState from './components/EmptyState.jsx';
import { Lock } from 'lucide-react';

function ComingSoon({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <EmptyState icon={Lock} title={`${title} — Coming Soon`} message='This module is under development and will be available soon.' />
    </div>
  );
}

export default function StudentDashboard() {
  const [activePage, setActivePage] = useState('overview');

  const renderContent = () => {
    switch (activePage) {
      case 'overview': return <OverviewSection onNavigate={setActivePage} />;
      case 'profile': return <ProfileSection />;
      case 'resume': return <ResumeIntelligenceSection />;
      case 'github': return <GitHubAnalysisSection />;
      case 'portfolio': return <PortfolioAnalysisSection />;
      case 'coding': return <CodingAnalysisSection />;
      case 'jobs': return <JobMatchSection />;
      case 'assistant': return <AICareerAssistantSection />;
      case 'ai-analysis':
      case 'ai':
        return <AIAnalysisSection />;
      default: return <ComingSoon title={activePage} />;
    }
  };

  return (
    <ProfileProvider>
      <div className='student-dashboard'>
        <Sidebar active={activePage} onNavigate={setActivePage} />
        <div className='dash-main'>
          <TopBar activePage={activePage} />
          <main className='dash-content'>
            {renderContent()}
          </main>
        </div>
      </div>
    </ProfileProvider>
  );
}
