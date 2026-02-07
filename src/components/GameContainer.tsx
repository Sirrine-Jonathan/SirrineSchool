import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useUser } from '../hooks/useUser';

const Container = styled.div<{ $theme: string }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${props => props.$theme === 'space_princess' ? '#0f0c29' : '#1a1a1a'};
  color: white;
  min-height: 100vh;
  position: relative;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;

  &:hover {
    color: #646cff;
  }
`;

const GameContent = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

interface GameContainerProps {
  children: React.ReactNode;
  title: string;
}

const GameContainer: React.FC<GameContainerProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const { currentUser, users } = useUser();
  const [muted, setMuted] = React.useState(false);
  
  const user = currentUser ? users[currentUser] : null;

  return (
    <Container $theme={user?.theme || 'monster_skate'}>
      <TopBar>
        <BackButton onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={24} /> Back
        </BackButton>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <BackButton onClick={() => setMuted(!muted)}>
          {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </BackButton>
      </TopBar>
      <GameContent>
        {children}
      </GameContent>
    </Container>
  );
};

export default GameContainer;
