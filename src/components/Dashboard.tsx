import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useIsMobile } from '../hooks/useIsMobile';
import { BookOpen, Calculator, Keyboard, LogOut, Award, Settings } from 'lucide-react';
import SettingsModal from './SettingsModal';

const DashboardContainer = styled.div<{ $theme: string }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: ${props => props.$theme === 'space_princess' ? '#0f0c29' : '#1a1a1a'};
  color: white;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  @media (min-width: 768px) {
    padding: 1.5rem 2rem;
    overflow: hidden;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
  width: 100%;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (min-width: 768px) {
    gap: 1rem;
  }

  h2 {
    font-size: 1.2rem;
    margin: 0;
    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;

const XPBadge = styled.div`
  background: #ffd700;
  color: #000;
  padding: 0.3rem 0.6rem;
  border-radius: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;

  @media (min-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
    gap: 0.5rem;
  }
`;

const SubjectGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  flex: 1;
  align-content: stretch;

  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    align-content: center;
    margin: auto;
    max-width: 1200px;
  }
`;

const SubjectCard = styled.button<{ $color: string, $active?: boolean }>`
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 4px solid ${props => props.$active ? props.$color : 'transparent'};
  border-radius: 20px;
  padding: 1.2rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  color: white;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
  min-height: 80px;
  transform: ${props => props.$active ? 'translateY(-3px)' : 'none'};
  box-shadow: ${props => props.$active ? `0 5px 15px rgba(0,0,0,0.3), 0 0 10px ${props.$color}` : 'none'};

  @media (min-width: 768px) {
    flex-direction: column;
    justify-content: center;
    border-radius: 24px;
    padding: 3rem 2rem;
    gap: 1.5rem;
    min-height: auto;
    transform: ${props => props.$active ? 'translateY(-10px)' : 'none'};
    box-shadow: ${props => props.$active ? `0 10px 20px rgba(0,0,0,0.3), 0 0 15px ${props.$color}` : 'none'};
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: ${props => props.$color};
    transform: translateY(-3px);

    @media (min-width: 768px) {
      transform: translateY(-10px);
    }
  }

  svg {
    color: ${props => props.$color};
    width: 48px;
    height: 48px;

    @media (min-width: 768px) {
      width: 64px;
      height: 64px;
    }
  }
`;

const ShortcutHint = styled.span`
  font-size: 0.7rem;
  opacity: 0.6;
  display: none;

  @media (min-width: 768px) {
    display: block;
    margin-top: 0.5rem;
  }
`;

const SubjectTitle = styled.h3`
  font-size: 1.4rem;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 1.8rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;

  @media (min-width: 768px) {
    gap: 1rem;
  }
`;

const LogoutButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.5rem;

  .text {
    display: none;
  }

  @media (min-width: 768px) {
    gap: 0.5rem;
    font-size: 1rem;
    padding: 0.6em 1.2em;

    .text {
      display: inline;
    }
  }

  &:hover {
    color: white;
  }
`;

const Dashboard: React.FC = () => {
  const { currentUser, setCurrentUser, users } = useUser();
  const [showSettings, setShowSettings] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const user = currentUser ? users[currentUser] : null;

  const subjects = [
    { id: 'math', name: 'Math', icon: Calculator, color: '#4caf50' },
    ...(currentUser === 'grace' ? [{ id: 'arithmetic', name: 'Arithmetic', icon: Calculator, color: '#e91e63' }] : []),
    { id: 'reading', name: 'Reading', icon: BookOpen, color: '#2196f3' },
    ...(!isMobile ? [{ id: 'typing', name: 'Typing', icon: Keyboard, color: '#ff9800' }] : []),
  ];

  const handleAction = React.useCallback((id: string) => {
    if (id === 'math') {
      if (currentUser === 'grace') navigate('/math/grace');
      else navigate('/math/charlie');
    } else if (id === 'arithmetic') {
      navigate('/math/arithmetic');
    } else if (id === 'reading') {
      navigate('/reading');
    } else if (id === 'typing') {
      navigate('/typing');
    }
  }, [currentUser, navigate]);

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
        if (subjects[selectedIndex]) handleAction(subjects[selectedIndex].id);
      } else if (e.key.toLowerCase() === 'm') {
        handleAction('math');
      } else if (e.key.toLowerCase() === 'a' && currentUser === 'grace') {
        handleAction('arithmetic');
      } else if (e.key.toLowerCase() === 'r') {
        handleAction('reading');
      } else if (e.key.toLowerCase() === 't' && !isMobile) {
        handleAction('typing');
      } else if (e.key.toLowerCase() === 's') {
        setShowSettings(true);
      } else if (e.key.toLowerCase() === 'q' || e.key === 'Escape') {
        setCurrentUser(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, showSettings, currentUser, setCurrentUser, subjects, isMobile, handleAction]);

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
        <ActionButtons>
          <LogoutButton onClick={() => setShowSettings(true)}>
            <Settings size={20} /> <span className="text">Settings (S)</span>
          </LogoutButton>
          <LogoutButton onClick={() => setCurrentUser(null)}>
            <LogOut size={20} /> <span className="text">Switch User (Q)</span>
          </LogoutButton>
        </ActionButtons>
      </Header>

      <SubjectGrid>
        {subjects.map((subject, index) => (
          <SubjectCard 
            key={subject.id} 
            $color={subject.color} 
            $active={selectedIndex === index}
            onClick={() => handleAction(subject.id)}
          >
            <subject.icon size={isMobile ? 48 : 64} />
            <SubjectTitle>{subject.name}</SubjectTitle>
            <ShortcutHint>(Press {subject.name[0]})</ShortcutHint>
          </SubjectCard>
        ))}
      </SubjectGrid>
    </DashboardContainer>
  );
};

export default Dashboard;

