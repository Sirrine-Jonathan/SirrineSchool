import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useIsMobile } from '../hooks/useIsMobile';
import { BookOpen, Calculator, Keyboard, Award, Settings, Terminal, FlaskConical } from 'lucide-react';
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
  padding-bottom: 2rem;

  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin: 0 auto;
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

  const subjects = React.useMemo(() => [
    { id: 'counting', name: 'Counting', icon: Calculator, color: '#f39c12' },
    { id: 'arithmetic', name: 'Arithmetic', icon: Calculator, color: '#e91e63' },
    { id: 'fractions', name: 'Fractions', icon: Calculator, color: '#ff5722' },
    { id: 'clock', name: 'Clock', icon: Calculator, color: '#00bcd4' },
    { id: 'patterns', name: 'Patterns', icon: Calculator, color: '#ffeb3b' },
    { id: 'multiplication', name: 'Multiplication', icon: Calculator, color: '#4caf50' },
    { id: 'reading', name: 'Reading', icon: BookOpen, color: '#2196f3' },
    { id: 'rhyme', name: 'Rhyme', icon: BookOpen, color: '#2196f3' },
    { id: 'spelling', name: 'Spelling', icon: BookOpen, color: '#2196f3' },
    { id: 'scramble', name: 'Scramble', icon: BookOpen, color: '#2196f3' },
    { id: 'habitats', name: 'Habitats', icon: FlaskConical, color: '#4caf50' },
    { id: 'coding', name: 'Coding', icon: Terminal, color: '#9c27b0' },
    ...(!isMobile ? [
      { id: 'typing', name: 'Astro Typer', icon: Keyboard, color: '#ff9800' },
      { id: 'fast-finger', name: 'Fast Finger', icon: Keyboard, color: '#e91e63' },
      { id: 'shortkey', name: 'Shortkey Samurai', icon: Keyboard, color: '#c0392b' }
    ] : []),
  ], [isMobile]);

  const handleAction = React.useCallback((id: string) => {
    if (id === 'counting') {
      navigate('/math/counting');
    } else if (id === 'multiplication') {
      navigate('/math/multiplication');
    } else if (id === 'arithmetic') {
      navigate('/math/arithmetic');
    } else if (id === 'fractions') {
      navigate('/math/fractions');
    } else if (id === 'clock') {
      navigate('/math/clock');
    } else if (id === 'patterns') {
      navigate('/math/patterns');
    } else if (id === 'reading') {
      navigate('/reading');
    } else if (id === 'rhyme') {
      navigate('/reading/rhyme-time');
    } else if (id === 'spelling') {
      navigate('/reading/spelling-bee');
    } else if (id === 'scramble') {
      navigate('/reading/sentence-scramble');
    } else if (id === 'habitats') {
      navigate('/science/habitats');
    } else if (id === 'coding') {
      navigate('/coding');
    } else if (id === 'typing') {
      navigate('/typing');
    } else if (id === 'fast-finger') {
      navigate('/typing/fast-finger');
    } else if (id === 'shortkey') {
      navigate('/typing/shortkey');
    }
  }, [navigate]);

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
      } else if (e.key.toLowerCase() === 'c') {
        // C triggers counting, but 'o' can trigger coding since 'c' is taken
        if (subjects.some(s => s.id === 'counting')) {
            handleAction('counting');
        }
      } else if (e.key.toLowerCase() === 'f') {
        handleAction('fractions');
      } else if (e.key.toLowerCase() === 'k') {
        handleAction('clock');
      } else if (e.key.toLowerCase() === 'p') {
        handleAction('patterns');
      } else if (e.key.toLowerCase() === 'o') {
        handleAction('coding');
      } else if (e.key.toLowerCase() === 'a') {
        handleAction('arithmetic');
      } else if (e.key.toLowerCase() === 'm') {
        handleAction('multiplication');
      } else if (e.key.toLowerCase() === 'r') {
        handleAction('reading');
      } else if (e.key.toLowerCase() === 'h') {
        handleAction('rhyme');
      } else if (e.key.toLowerCase() === 'b') {
        handleAction('spelling');
      } else if (e.key.toLowerCase() === 'e') {
        handleAction('scramble');
      } else if (e.key.toLowerCase() === 'i') {
        handleAction('habitats');
      } else if (e.key.toLowerCase() === 't' && !isMobile) {
        handleAction('typing');
      } else if (e.key.toLowerCase() === 'y' && !isMobile) {
        handleAction('fast-finger');
      } else if (e.key.toLowerCase() === 'u' && !isMobile) {
        handleAction('shortkey');
      } else if (e.key.toLowerCase() === 's') {
        setShowSettings(true);
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
          <h2 style={{ margin: 0 }}>Sirrine School</h2>
          <XPBadge>
            <Award size={16} /> {user.xp} XP
          </XPBadge>
        </UserInfo>
        <ActionButtons>
          <LogoutButton onClick={() => setShowSettings(true)}>
            <Settings size={20} /> <span className="text">Settings (S)</span>
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
            data-testid="subject-card"
            data-subject-id={subject.id}
          >            <subject.icon size={isMobile ? 48 : 64} />
            <SubjectTitle>{subject.name}</SubjectTitle>
            <ShortcutHint>(Press {subject.name[0]})</ShortcutHint>
          </SubjectCard>
        ))}
      </SubjectGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
