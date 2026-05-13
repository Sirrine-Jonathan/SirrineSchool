import React from 'react';
import styled from 'styled-components';
import { useUser } from '../hooks/useUser';
import { Rocket, Truck } from 'lucide-react';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  @media (min-width: 768px) {
    padding: 2rem;
    overflow: hidden;
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: #646cff;
  text-align: center;

  @media (min-width: 768px) {
    font-size: 3rem;
    margin-bottom: 3rem;
  }
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  flex: 1;
  align-content: stretch;
  max-width: 400px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    max-width: 800px;
    gap: 2rem;
    flex: none;
    align-content: center;
  }
`;

const UserCard = styled.button<{ $theme: 'space_princess' | 'monster_skate', $active?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 1.2rem;
  gap: 1rem;
  border-radius: 24px;
  border: 4px solid ${props => props.$active ? (props.$theme === 'space_princess' ? '#e94560' : '#f39c12') : 'transparent'};
  background: ${props => props.$theme === 'space_princess' ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)'};
  color: white;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  box-shadow: ${props => props.$active ? `0 0 20px ${props.$theme === 'space_princess' ? '#e94560' : '#f39c12'}` : 'none'};
  transform: ${props => props.$active ? 'scale(1.02)' : 'scale(1)'};
  width: 100%;
  flex: 1;
  min-height: 100px;

  @media (min-width: 768px) {
    flex-direction: column;
    padding: 2.5rem;
    gap: 1rem;
    min-height: auto;
    transform: ${props => props.$active ? 'scale(1.05)' : 'scale(1)'};
  }

  &:hover {
    transform: scale(1.05);
    border-color: ${props => props.$theme === 'space_princess' ? '#e94560' : '#f39c12'};
  }

  svg {
    width: 64px;
    height: 64px;

    @media (min-width: 768px) {
      width: 80px;
      height: 80px;
    }
  }
`;

const Name = styled.h2`
  margin: 0;
  font-size: 1.8rem;

  @media (min-width: 768px) {
    margin-top: 1rem;
    font-size: 2.2rem;
  }
`;

const ShortcutHint = styled.div`
  margin-top: 0.5rem;
  opacity: 0.6;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const Home: React.FC = () => {
  const { setCurrentUser, users } = useUser();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const userList = Object.keys(users);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setSelectedIndex(prev => (prev + 1) % userList.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setSelectedIndex(prev => (prev - 1 + userList.length) % userList.length);
      } else if (e.key === 'Enter') {
        setCurrentUser(userList[selectedIndex]);
      } else if (e.key.toLowerCase() === 'g') {
        setCurrentUser('grace');
      } else if (e.key.toLowerCase() === 'c') {
        setCurrentUser('charlie');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, userList, setCurrentUser]);

  return (
    <HomeContainer>
      <Title>Sirrine School</Title>
      <UserGrid>
        <UserCard 
          $theme="space_princess" 
          $active={selectedIndex === 0}
          onClick={() => setCurrentUser('grace')}
          data-testid="user-card"
        >
          <Rocket size={64} color="#e94560" />
          <Name>{users.grace.name}</Name>
          <ShortcutHint>(Press G)</ShortcutHint>
        </UserCard>
        <UserCard 
          $theme="monster_skate" 
          $active={selectedIndex === 1}
          onClick={() => setCurrentUser('charlie')}
          data-testid="user-card"
        >
          <Truck size={64} color="#f39c12" />
          <Name>{users.charlie.name}</Name>
          <ShortcutHint>(Press C)</ShortcutHint>
        </UserCard>
      </UserGrid>
    </HomeContainer>
  );
};

export default Home;
