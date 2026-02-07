import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { BookOpen, Calculator, Keyboard, LogOut, Award, Settings } from 'lucide-react';
import SettingsModal from './SettingsModal';

const DashboardContainer = styled.div<{ $theme: string }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background: ${props => props.$theme === 'space_princess' ? '#0f0c29' : '#1a1a1a'};
  color: white;
  min-height: 100vh;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const XPBadge = styled.div`
  background: #ffd700;
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SubjectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const SubjectCard = styled.button<{ $color: string, $active?: boolean }>`
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 4px solid ${props => props.$active ? props.$color : 'transparent'};
  border-radius: 24px;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  color: white;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  transform: ${props => props.$active ? 'translateY(-10px)' : 'none'};
  box-shadow: ${props => props.$active ? `0 10px 20px rgba(0,0,0,0.3), 0 0 15px ${props.$color}` : 'none'};

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: ${props => props.$color};
    transform: translateY(-10px);
  }

  svg {
    color: ${props => props.$color};
  }
`;

const ShortcutHint = styled.span`
  font-size: 0.8rem;
  opacity: 0.6;
  margin-top: 0.5rem;
`;

const SubjectTitle = styled.h3`
  font-size: 1.8rem;
  margin: 0;
`;

const LogoutButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    color: white;
  }
`;

const Dashboard: React.FC = () => {
  const { currentUser, setCurrentUser, users } = useUser();
  const [showSettings, setShowSettings] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const navigate = useNavigate();
  const user = currentUser ? users[currentUser] : null;

  const subjects = [
    { id: 'math', name: 'Math', icon: Calculator, color: '#4caf50' },
    { id: 'reading', name: 'Reading', icon: BookOpen, color: '#2196f3' },
    { id: 'typing', name: 'Typing', icon: Keyboard, color: '#ff9800' },
  ];

  const handleAction = (id: string) => {
    if (id === 'math') {
      if (currentUser === 'grace') navigate('/math/grace');
      else navigate('/math/charlie');
    } else if (id === 'reading') {
      navigate('/reading');
    } else if (id === 'typing') {
      navigate('/typing');
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings) {
        if (e.key === 'Escape') setShowSettings(false);
        return;
      }

      if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => (prev + 1) % subjects.length);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => (prev - 1 + subjects.length) % subjects.length);
      } else if (e.key === 'Enter') {
        handleAction(subjects[selectedIndex].id);
      } else if (e.key.toLowerCase() === 'm') {
        handleAction('math');
      } else if (e.key.toLowerCase() === 'r') {
        handleAction('reading');
      } else if (e.key.toLowerCase() === 't') {
        handleAction('typing');
      } else if (e.key.toLowerCase() === 's') {
        setShowSettings(true);
      } else if (e.key.toLowerCase() === 'q' || e.key === 'Escape') {
        setCurrentUser(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, showSettings, currentUser, setCurrentUser]);

  if (!user) return null;

  return (
    <DashboardContainer $theme={user.theme}>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <Header>
        <UserInfo>
          <Award size={32} color="#ffd700" />
          <h2 style={{ margin: 0 }}>Hello, {user.name}!</h2>
          <XPBadge>
            <Award size={16} /> {user.xp} XP
          </XPBadge>
        </UserInfo>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <LogoutButton onClick={() => setShowSettings(true)}>
            <Settings size={20} /> Settings (S)
          </LogoutButton>
          <LogoutButton onClick={() => setCurrentUser(null)}>
            <LogOut size={20} /> Switch User (Q)
          </LogoutButton>
        </div>
      </Header>

      <SubjectGrid>
        {subjects.map((subject, index) => (
          <SubjectCard 
            key={subject.id} 
            $color={subject.color} 
            $active={selectedIndex === index}
            onClick={() => handleAction(subject.id)}
          >
            <subject.icon size={64} />
            <SubjectTitle>{subject.name}</SubjectTitle>
            <ShortcutHint>(Press {subject.name[0]})</ShortcutHint>
          </SubjectCard>
        ))}
      </SubjectGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
