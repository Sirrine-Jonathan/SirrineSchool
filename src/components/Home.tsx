import React from 'react';
import styled from 'styled-components';
import { useUser } from '../hooks/useUser';
import { Rocket, Truck } from 'lucide-react';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 3rem;
  color: #646cff;
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  width: 100%;
  max-width: 800px;
`;

const UserCard = styled.button<{ $theme: 'space_princess' | 'monster_skate', $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  border-radius: 20px;
  border: 4px solid ${props => props.$active ? (props.$theme === 'space_princess' ? '#e94560' : '#f39c12') : 'transparent'};
  background: ${props => props.$theme === 'space_princess' ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)'};
  color: white;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  box-shadow: ${props => props.$active ? `0 0 20px ${props.$theme === 'space_princess' ? '#e94560' : '#f39c12'}` : 'none'};
  transform: ${props => props.$active ? 'scale(1.05)' : 'scale(1)'};

  &:hover {
    transform: scale(1.05);
    border-color: ${props => props.$theme === 'space_princess' ? '#e94560' : '#f39c12'};
  }
`;

const Name = styled.h2`
  margin-top: 1rem;
  font-size: 2rem;
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
        >
          <Rocket size={64} color="#e94560" />
          <Name>{users.grace.name}</Name>
          <div style={{ marginTop: '0.5rem', opacity: 0.6 }}>(Press G)</div>
        </UserCard>
        <UserCard 
          $theme="monster_skate" 
          $active={selectedIndex === 1}
          onClick={() => setCurrentUser('charlie')}
        >
          <Truck size={64} color="#f39c12" />
          <Name>{users.charlie.name}</Name>
          <div style={{ marginTop: '0.5rem', opacity: 0.6 }}>(Press C)</div>
        </UserCard>
      </UserGrid>
    </HomeContainer>
  );
};

export default Home;
