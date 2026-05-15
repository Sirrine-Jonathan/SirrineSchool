import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useUser } from '../hooks/useUser';

const Container = styled.div<{ $theme: string }>`
  display: flex;
  flex-direction: column;
  background: transparent;
  color: white;
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;

  @media (min-width: 768px) {
    padding: 0.5rem 1rem;
  }
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;

  span {
    display: none;
  }

  @media (min-width: 768px) {
    gap: 0.5rem;
    font-size: 1.1rem;
    padding: 0.4rem;

    span {
      display: inline;
    }
  }

  &:hover {
    color: #646cff;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1rem;

  @media (min-width: 768px) {
    font-size: 1.3rem;
  }
`;

const GameContent = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  height: 100%;
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
          <ArrowLeft size={24} /> <span>Back</span>
        </BackButton>
        <Title>{title}</Title>
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
