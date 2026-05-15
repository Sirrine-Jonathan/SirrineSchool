import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useIsMobile } from '../hooks/useIsMobile';
import { BookOpen, Calculator, Keyboard, Award, Settings, Terminal, FlaskConical, Search, Clock as ClockIcon, Sparkles } from 'lucide-react';
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

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 3rem;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2196f3;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const FilterPills = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const FilterPill = styled.button<{ $active: boolean, $color?: string }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 2px solid ${props => props.$active ? (props.$color || '#2196f3') : 'rgba(255, 255, 255, 0.1)'};
  background: ${props => props.$active ? (props.$color || '#2196f3') : 'transparent'};
  color: ${props => props.$active ? '#000' : 'white'};
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    border-color: ${props => props.$color || '#2196f3'};
  }
`;

const SortContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
`;

const SortButton = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.$active ? '#2196f3' : 'inherit'};
  cursor: pointer;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  text-decoration: ${props => props.$active ? 'underline' : 'none'};

  &:hover {
    color: white;
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
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
  position: relative;

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

const Badge = styled.div<{ $color: string }>`
  position: absolute;
  top: -10px;
  right: -10px;
  background: ${props => props.$color};
  color: #000;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
  z-index: 2;
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
  const { currentUser, users, recordGamePlay } = useUser();
  const [showSettings, setShowSettings] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [sortBy, setSortBy] = React.useState<'alphabetical' | 'recent'>('alphabetical');
  
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const user = currentUser ? users[currentUser] : null;

  const subjects = React.useMemo(() => [
    { id: 'money-market', name: 'Money Market', icon: Calculator, color: '#f39c12', category: 'Math', path: '/math/money-market' },
    { id: 'counting', name: 'Counting', icon: Calculator, color: '#f39c12', category: 'Math', path: '/math/counting' },
    { id: 'arithmetic', name: 'Arithmetic', icon: Calculator, color: '#e91e63', category: 'Math', path: '/math/arithmetic' },
    { id: 'fractions', name: 'Fractions', icon: Calculator, color: '#ff5722', category: 'Math', path: '/math/fractions' },
    { id: 'clock', name: 'Clock', icon: Calculator, color: '#00bcd4', category: 'Math', path: '/math/clock' },
    { id: 'patterns', name: 'Patterns', icon: Calculator, color: '#ffeb3b', category: 'Math', path: '/math/patterns' },
    { id: 'multiplication', name: 'Multiplication', icon: Calculator, color: '#4caf50', category: 'Math', path: '/math/multiplication' },
    { id: 'reading', name: 'Reading', icon: BookOpen, color: '#2196f3', category: 'Reading', path: '/reading' },
    { id: 'rhyme', name: 'Rhyme', icon: BookOpen, color: '#2196f3', category: 'Reading', path: '/reading/rhyme-time' },
    { id: 'spelling', name: 'Spelling', icon: BookOpen, color: '#2196f3', category: 'Reading', path: '/reading/spelling-bee' },
    { id: 'scramble', name: 'Scramble', icon: BookOpen, color: '#2196f3', category: 'Reading', path: '/reading/sentence-scramble' },
    { id: 'habitats', name: 'Habitats', icon: FlaskConical, color: '#4caf50', category: 'Science', path: '/science/habitats' },
    { id: 'coding', name: 'Coding', icon: Terminal, color: '#9c27b0', category: 'Coding', path: '/coding' },
    ...(!isMobile ? [
      { id: 'typing', name: 'Astro Typer', icon: Keyboard, color: '#ff9800', category: 'Typing', path: '/typing' },
      { id: 'fast-finger', name: 'Fast Finger', icon: Keyboard, color: '#e91e63', category: 'Typing', path: '/typing/fast-finger' },
      { id: 'shortkey', name: 'Shortkey Samurai', icon: Keyboard, color: '#c0392b', category: 'Typing', path: '/typing/shortkey' }
    ] : []),
  ], [isMobile]);

  const categories = React.useMemo(() => {
    const cats = new Set(subjects.map(s => s.category));
    return ['All', ...Array.from(cats)];
  }, [subjects]);

  const handleAction = React.useCallback((id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (subject && currentUser) {
      recordGamePlay(currentUser, id);
      navigate(subject.path);
    }
  }, [navigate, subjects, recordGamePlay, currentUser]);

  const filteredAndSortedSubjects = React.useMemo(() => {
    let result = subjects.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      const aLastPlayed = user?.gameHistory?.[a.id] || 0;
      const bLastPlayed = user?.gameHistory?.[b.id] || 0;

      // "New" games (never played) always go to the top
      if (aLastPlayed === 0 && bLastPlayed !== 0) return -1;
      if (aLastPlayed !== 0 && bLastPlayed === 0) return 1;

      if (sortBy === 'recent') {
        return bLastPlayed - aLastPlayed;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [subjects, searchQuery, selectedCategory, sortBy, user?.gameHistory]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings) {
        if (e.key === 'Escape') setShowSettings(false);
        return;
      }

      // Don't trigger shortcuts if focus is in search input
      if (document.activeElement?.tagName === 'INPUT') {
          if (e.key === 'Escape') {
              (document.activeElement as HTMLInputElement).blur();
          }
          return;
      }

      if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => (prev + 1) % filteredAndSortedSubjects.length);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => (prev - 1 + filteredAndSortedSubjects.length) % filteredAndSortedSubjects.length);
      } else if (e.key === 'Enter') {
        if (filteredAndSortedSubjects[selectedIndex]) handleAction(filteredAndSortedSubjects[selectedIndex].id);
      } else if (e.key === '/') {
          e.preventDefault();
          document.getElementById('game-search')?.focus();
      } else if (e.key.toLowerCase() === 's') {
        setShowSettings(true);
      } else {
          // General shortcuts for visible games
          const char = e.key.toLowerCase();
          const match = filteredAndSortedSubjects.find(s => s.name.toLowerCase().startsWith(char));
          if (match) {
              handleAction(match.id);
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, showSettings, filteredAndSortedSubjects, handleAction]);

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

      <ControlsContainer>
        <SearchContainer>
          <Search size={20} />
          <SearchInput 
            id="game-search"
            type="text" 
            placeholder="Search games... (Press /)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
        
        <FilterPills>
          {categories.map(cat => (
            <FilterPill 
              key={cat} 
              $active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </FilterPill>
          ))}
        </FilterPills>

        <SortContainer>
          <span>Sort by:</span>
          <SortButton 
            $active={sortBy === 'alphabetical'} 
            onClick={() => setSortBy('alphabetical')}
          >
            A-Z
          </SortButton>
          <SortButton 
            $active={sortBy === 'recent'} 
            onClick={() => setSortBy('recent')}
          >
            Recent
          </SortButton>
        </SortContainer>
      </ControlsContainer>

      <SubjectGrid>
        {filteredAndSortedSubjects.map((subject, index) => {
          const lastPlayed = user.gameHistory?.[subject.id] || 0;
          const isNew = lastPlayed === 0;

          return (
            <SubjectCard
              key={subject.id}
              $color={subject.color}
              $active={selectedIndex === index}
              onClick={() => handleAction(subject.id)}
              data-testid="subject-card"
              data-subject-id={subject.id}
            >
              {isNew && (
                <Badge $color="#ffd700">
                  <Sparkles size={12} /> NEW
                </Badge>
              )}
              {!isNew && sortBy === 'recent' && (
                <Badge $color="#2196f3">
                  <ClockIcon size={12} /> Played
                </Badge>
              )}
              <subject.icon size={isMobile ? 48 : 64} />
              <SubjectTitle>{subject.name}</SubjectTitle>
              <ShortcutHint>(Press {subject.name[0]})</ShortcutHint>
            </SubjectCard>
          );
        })}
      </SubjectGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
