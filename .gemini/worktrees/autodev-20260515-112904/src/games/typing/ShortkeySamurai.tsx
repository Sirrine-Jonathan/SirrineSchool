import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Home as HomeIcon } from 'lucide-react';
import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';

// --- STYLES ---

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  background-color: #1a0f0f;
  background-image: 
    linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)),
    url('https://images.unsplash.com/photo-1528164344705-4754268799af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
  background-size: cover;
  background-position: center;
  border: 2px solid #5c1a1a;
  overflow: hidden;
  flex: 1;
`;

const DojoOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 100%);
  pointer-events: none;
`;

const HUD = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 0;
  right: 0;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 110;
  font-size: 1rem;
  font-weight: bold;
  color: #f1c40f;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);

  @media (min-width: 768px) {
    top: 1rem;
    padding: 0 2rem;
    font-size: 1.5rem;
  }
`;

const ScrollContainer = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
  background: #fdf5e6;
  border: 15px solid #8b4513;
  border-image: linear-gradient(to bottom, #8b4513, #5c2c0a) 1;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #2c3e50;
  z-index: 100;

  &::before, &::after {
    content: '';
    position: absolute;
    width: 40px;
    height: 100%;
    background: #5c2c0a;
    top: 0;
  }

  &::before { left: -40px; border-radius: 10px 0 0 10px; }
  &::after { right: -40px; border-radius: 0 10px 10px 0; }
`;

const ActionLabel = styled.h3`
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #c0392b;

  @media (min-width: 768px) {
    font-size: 2rem;
  }
`;

const ShortcutDisplay = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 2rem;
`;

const KeyCap = styled(motion.div)<{ $active: boolean }>`
  background: ${props => props.$active ? '#c0392b' : '#34495e'};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 0 ${props => props.$active ? '#922b21' : '#2c3e50'};
  border: 2px solid rgba(255,255,255,0.1);

  @media (min-width: 768px) {
    font-size: 2.5rem;
    padding: 1rem 2rem;
  }
`;

const Plus = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: #7f8c8d;
`;

const SlashEffect = styled(motion.div)`
  position: absolute;
  height: 4px;
  background: white;
  box-shadow: 0 0 20px white;
  z-index: 150;
  pointer-events: none;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 3rem;
  color: #f1c40f;
  margin: 0;
`;

const StatText = styled.p`
  font-size: 1.5rem;
  margin: 0;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.2rem;
  padding: 1rem 2rem;
  background: #c0392b;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e74c3c;
    transform: scale(1.05);
  }
`;

// --- TYPES & DATA ---

interface Shortcut {
  label: string;
  keys: string[]; // e.g., ["Control", "c"]
  display: string[]; // e.g., ["Ctrl", "C"]
}

const SHORTCUTS: Shortcut[] = [
  { label: 'Copy', keys: ['Control', 'c'], display: ['Ctrl', 'C'] },
  { label: 'Paste', keys: ['Control', 'v'], display: ['Ctrl', 'V'] },
  { label: 'Cut', keys: ['Control', 'x'], display: ['Ctrl', 'X'] },
  { label: 'Select All', keys: ['Control', 'a'], display: ['Ctrl', 'A'] },
  { label: 'Save', keys: ['Control', 's'], display: ['Ctrl', 'S'] },
  { label: 'Undo', keys: ['Control', 'z'], display: ['Ctrl', 'Z'] },
  { label: 'Find', keys: ['Control', 'f'], display: ['Ctrl', 'F'] },
];

const GAME_DURATION = 60;

const ShortkeySamurai: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, addXP } = useUser();
  
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [showSlash, setShowSlash] = useState(false);
  const [slashPath, setSlashPath] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  const currentShortcut = SHORTCUTS[currentIndex];

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  // Input Handling
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser behavior for shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (['c', 'v', 'x', 'a', 's', 'z', 'f'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }
      }

      const key = e.key;
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });

      // Check if current shortcut is matched
      const keysToMatch = currentShortcut.keys;
      const allMatched = keysToMatch.every(k => {
          if (k === 'Control') return e.ctrlKey || e.metaKey;
          return e.key.toLowerCase() === k.toLowerCase();
      });

      if (allMatched) {
        triggerSlash();
        setScore(s => s + 1);
        if (currentUser) addXP(currentUser, 10);
        
        // Move to next after a brief delay
        setTimeout(() => {
          setCurrentIndex(Math.floor(Math.random() * SHORTCUTS.length));
          setPressedKeys(new Set());
        }, 200);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const next = new Set(prev);
        next.delete(e.key);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, currentShortcut, currentUser, addXP]);

  const triggerSlash = () => {
    const x1 = Math.random() * 100;
    const y1 = Math.random() * 100;
    const x2 = x1 + (Math.random() - 0.5) * 40;
    const y2 = y1 + (Math.random() - 0.5) * 40;
    
    setSlashPath({ x1, y1, x2, y2 });
    setShowSlash(true);
    setTimeout(() => setShowSlash(false), 200);
  };

  const restartGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCurrentIndex(Math.floor(Math.random() * SHORTCUTS.length));
    setGameState('playing');
    setPressedKeys(new Set());
  };

  return (
    <GameContainer title="Shortkey Samurai">
      <GameArea>
        <DojoOverlay />
        <HUD>
          <span>Time: {timeLeft}s</span>
          <span>Score: {score}</span>
        </HUD>

        <AnimatePresence mode="wait">
          <ScrollContainer
            key={currentIndex}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <ActionLabel>{currentShortcut.label}</ActionLabel>
            <ShortcutDisplay>
              {currentShortcut.display.map((key, i) => (
                <React.Fragment key={key}>
                  <KeyCap 
                    $active={
                        (key === 'Ctrl' && (pressedKeys.has('Control') || pressedKeys.has('Meta'))) ||
                        (pressedKeys.has(currentShortcut.keys[i]))
                    }
                    data-testid={`key-${key}`}
                  >
                    {key}
                  </KeyCap>
                  {i < currentShortcut.display.length - 1 && <Plus>+</Plus>}
                </React.Fragment>
              ))}
            </ShortcutDisplay>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#7f8c8d' }}>
              Perform the technique to strike!
            </p>
          </ScrollContainer>
        </AnimatePresence>

        {showSlash && (
          <SlashEffect
            initial={{ 
                left: `${slashPath.x1}%`, 
                top: `${slashPath.y1}%`, 
                width: 0, 
                rotate: Math.atan2(slashPath.y2 - slashPath.y1, slashPath.x2 - slashPath.x1) * 180 / Math.PI 
            }}
            animate={{ width: '200px', opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {gameState === 'finished' && (
          <Overlay>
            <Title>Dojo Master!</Title>
            <StatText>Shortcuts Mastered: {score}</StatText>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <ActionButton onClick={restartGame}>
                <RefreshCw size={24} /> Replay
              </ActionButton>
              <ActionButton onClick={() => navigate('/dashboard')}>
                <HomeIcon size={24} /> Home
              </ActionButton>
            </div>
          </Overlay>
        )}
      </GameArea>
    </GameContainer>
  );
};

export default ShortkeySamurai;
