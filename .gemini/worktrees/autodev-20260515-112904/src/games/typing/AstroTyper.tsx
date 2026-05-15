import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Home as HomeIcon, Zap } from 'lucide-react';
import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';
import Keyboard from '../../components/Keyboard';

// --- STYLES ---

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  background-color: #0b0d17;
  background-image: 
    radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
    radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px),
    radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 40px);
  background-size: 550px 550px, 350px 350px, 250px 250px;
  background-position: 0 0, 40px 60px, 130px 270px;
  border: 2px solid #333;
  overflow: hidden;
  flex: 1;
`;

const MeteorContainer = styled(motion.div)<{ $left: number }>`
  position: absolute;
  left: ${props => props.$left}%;
  top: -10%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MeteorBody = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  background: radial-gradient(circle at 30% 30%, ${props => props.$color}, #000);
  border-radius: 50% 40% 50% 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255,255,255,0.2);
  position: relative;
  box-shadow: 0 0 15px ${props => props.$color}88;

  @media (min-width: 768px) {
    width: 80px;
    height: 80px;
    box-shadow: 0 0 20px ${props => props.$color}88;
  }

  &::before {
    content: '';
    position: absolute;
    top: -30px;
    left: 50%;
    width: 15px;
    height: 40px;
    background: linear-gradient(to bottom, transparent, ${props => props.$color}44);
    transform: translateX(-50%);
    filter: blur(4px);

    @media (min-width: 768px) {
      top: -40px;
      width: 20px;
      height: 60px;
    }
  }
`;

const Letter = styled.span`
  font-size: 1.5rem;
  font-weight: 900;
  color: #FFFFFF !important;
  text-shadow: 0 0 10px rgba(0,0,0,0.8);
  pointer-events: none;
  z-index: 2;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const explodeAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.8; background: #ffd700; box-shadow: 0 0 30px #ffd700; }
  100% { transform: scale(2); opacity: 0; }
`;

const Explosion = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #FFFFFF;
  animation: ${explodeAnimation} 0.3s ease-out forwards;

  @media (min-width: 768px) {
    width: 80px;
    height: 80px;
  }
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
  color: #FFF;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);

  @media (min-width: 768px) {
    top: 1rem;
    padding: 0 2rem;
    font-size: 1.5rem;
  }
`;

const ConfigPanel = styled.div`
  position: absolute;
  top: 3rem;
  left: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 110;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);

  @media (min-width: 768px) {
    top: 4rem;
    left: 2rem;
    width: 300px;
  }

  label {
    font-weight: bold;
    font-size: 0.8rem;
    color: white;
    white-space: nowrap;
  }

  input {
    flex: 1;
    cursor: pointer;
    accent-color: #e94560;
  }

  span {
    font-size: 0.9rem;
    font-weight: bold;
    color: #e94560;
    min-width: 2rem;
    text-align: center;
  }
`;

const BottomArea = styled.div`
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  z-index: 110;

  @media (min-width: 768px) {
    bottom: 20px;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 1rem;
  padding: 1rem;
  text-align: center;

  @media (min-width: 768px) {
    gap: 1.5rem;
    padding: 2rem;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  margin: 0;
  color: #ffd700;

  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const StatText = styled.p`
  font-size: 1.2rem;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  width: 100%;
  max-width: 300px;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1rem;
    max-width: none;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  padding: 0.6rem 1.2rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;

  @media (min-width: 768px) {
    font-size: 1.2rem;
    padding: 0.8rem 1.5rem;
    width: auto;
  }

  &:hover {
    background: #ff5e78;
    transform: translateY(-2px);
  }
`;

const HistoryList = styled.div`
  margin-top: 1rem;
  background: rgba(255,255,255,0.1);
  padding: 1rem;
  border-radius: 10px;
  width: 100%;
  max-width: 300px;
`;

const HistoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  &:last-child { border-bottom: none; }
`;

// --- TYPES ---

interface MeteorItem {
  id: number;
  letter: string;
  xPercent: number;
  color: string;
  status: 'falling' | 'exploding';
  duration: number;
}

const METEOR_COLORS = ['#ff4d4d', '#ff944d', '#ffd11a', '#ff1a1a', '#e68a00'];
const GAME_DURATION = 60; // 1 minute is plenty for a 7 year old

const AstroTyper: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, users, addXP, updateUserStats, settings } = useUser();
  
  // Game State
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [meteors, setMeteors] = useState<MeteorItem[]>([]);
  const [score, setScore] = useState(0);
  const [totalSpawned, setTotalSpawned] = useState(0);
  const [hintKey, setHintKey] = useState<string | undefined>(undefined);
  
  // Difficulty State
  const [gameSpeed, setGameSpeed] = useState(() => {
    const saved = localStorage.getItem('sirrine_typing_speed');
    return saved ? parseInt(saved, 10) : 5; // 1-10 scale
  });

  // Convert 1-10 to animation duration (higher speed = lower duration)
  // 1 = 60s (almost not moving), 10 = 8s (original max speed)
  const calculateDuration = useCallback((speed: number) => {
    const minDuration = 8;
    const maxDuration = 60;
    // Linear interpolation
    return maxDuration - ((speed - 1) * (maxDuration - minDuration)) / 9;
  }, []);

  // Refs for intervals/timeouts to clear them cleanly
  const nextSpawnTimeoutRef = useRef<number | null>(null);

  // --- GAME LOOP ---

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

  // Finish Game & Save Score
  useEffect(() => {
    if (gameState === 'finished' && currentUser) {
      const user = users[currentUser];
      const history = user.stats.typing_history || [];
      const newHistory = [score, ...history].slice(0, 5); // Keep last 5
      updateUserStats(currentUser, { typing_history: newHistory });
      addXP(currentUser, score * 2); // Bonus XP
    }
  }, [gameState, currentUser]); // score is stable when finished

  // State Refs for the loop
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Main Spawn Loop
  const stableSpawnLoop = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;

    const elapsed = GAME_DURATION - timeLeftRef.current;
    
    // 1. Determine Max Visible based on time
    let maxVisible = 1;
    if (elapsed > 10) maxVisible = 2;
    if (elapsed > 20) maxVisible = 3;
    if (elapsed > 40) maxVisible = 4;

    // 2. Determine Check Rate (how fast we retry spawning)
    let checkRate = 1500;
    if (elapsed > 20) checkRate = 1000;
    if (elapsed > 40) checkRate = 800;

    setMeteors(prev => {
      const currentFalling = prev.filter(b => b.status === 'falling').length;

      if (currentFalling < maxVisible) {
        // We have an empty slot! Spawn!
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const color = METEOR_COLORS[Math.floor(Math.random() * METEOR_COLORS.length)];
        const newMeteor: MeteorItem = {
          id: Date.now(),
          letter: letters[Math.floor(Math.random() * letters.length)],
          xPercent: Math.random() * 80 + 10,
          color,
          status: 'falling',
          duration: calculateDuration(gameSpeed),
        };
        
        setTotalSpawned(t => t + 1);
        
        return [...prev, newMeteor];
      }
      return prev;
    });

    // Schedule next check
    nextSpawnTimeoutRef.current = window.setTimeout(stableSpawnLoop, checkRate);
  }, [gameSpeed, calculateDuration]);

  useEffect(() => {
    if (gameState === 'playing') {
      stableSpawnLoop();
    }
    return () => {
      if (nextSpawnTimeoutRef.current) clearTimeout(nextSpawnTimeoutRef.current);
    };
  }, [gameState, stableSpawnLoop]);


  // --- HINT LOGIC ---
  const targetMeteor = meteors.find(b => b.status === 'falling');
  
  useEffect(() => {
    if (!settings.typingHintEnabled || !targetMeteor || gameState !== 'playing') {
      setHintKey(undefined);
      return;
    }
    const timer = setTimeout(() => {
      setHintKey(targetMeteor.letter);
    }, settings.typingHintDelay);
    return () => clearTimeout(timer);
  }, [targetMeteor, settings.typingHintEnabled, settings.typingHintDelay, gameState]);

  // --- INPUT HANDLING ---
  useEffect(() => {
    if (gameState === 'finished') {
      const handleFinishedKeys = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'r') restartGame();
        if (e.key.toLowerCase() === 'h') navigate('/dashboard');
      };
      window.addEventListener('keydown', handleFinishedKeys);
      return () => window.removeEventListener('keydown', handleFinishedKeys);
    }

    if (gameState !== 'playing') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const pressed = e.key.toUpperCase();
      
      const targetIndex = meteors.findIndex(b => b.letter === pressed && b.status === 'falling');

      if (targetIndex !== -1) {
        const target = meteors[targetIndex];
        setScore(s => s + 1);
        if (currentUser) addXP(currentUser, 5);

        // Explode
        setMeteors(prev => prev.map(b => 
          b.id === target.id ? { ...b, status: 'exploding' } : b
        ));

        // Cleanup after anim
        setTimeout(() => {
          setMeteors(prev => prev.filter(b => b.id !== target.id));
        }, 300);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentUser, addXP, meteors, navigate]);

  const handleAnimationComplete = (id: number) => {
    setMeteors(prev => {
      const b = prev.find(item => item.id === id);
      if (b && b.status === 'falling') {
        return prev.filter(item => item.id !== id);
      }
      return prev;
    });
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value, 10);
    setGameSpeed(newSpeed);
    localStorage.setItem('sirrine_typing_speed', newSpeed.toString());
  };

  const restartGame = () => {
    setScore(0);
    setTotalSpawned(0);
    setTimeLeft(GAME_DURATION);
    setMeteors([]);
    setGameState('playing');
  };

  const userHistory = (currentUser && users[currentUser].stats.typing_history) || [];

  return (
    <GameContainer title="Astro Typer">
      <GameArea>
        <HUD>
          <span>Time: {timeLeft}s</span>
          <span>Score: {score} / {totalSpawned}</span>
        </HUD>

        <ConfigPanel data-testid="config-panel">
          <Zap size={16} color="#e94560" />
          <label htmlFor="speed-slider">Speed</label>
          <input 
            id="speed-slider"
            data-testid="speed-slider"
            type="range" 
            min="1" 
            max="10" 
            step="1"
            value={gameSpeed} 
            onChange={handleSpeedChange}
          />
          <span>{gameSpeed}</span>
        </ConfigPanel>

        <AnimatePresence>
          {meteors.map(meteor => (
            <MeteorContainer
              key={meteor.id}
              $left={meteor.xPercent}
              initial={{ top: '-10%' }}
              animate={meteor.status === 'falling' ? { top: '110%' } : undefined}
              transition={{ duration: meteor.duration, ease: 'linear' }}
              onAnimationComplete={() => handleAnimationComplete(meteor.id)}
            >
              {meteor.status === 'falling' ? (
                <MeteorBody $color={meteor.color}>
                  <Letter data-testid="meteor-letter">{meteor.letter}</Letter>
                </MeteorBody>
              ) : (
                <Explosion />
              )}
            </MeteorContainer>
          ))}
        </AnimatePresence>

        <BottomArea>
          {settings.typingHintEnabled && <Keyboard highlightKey={hintKey} />}
        </BottomArea>

        {gameState === 'finished' && (
          <Overlay>
            <Title>Mission Complete!</Title>
            <StatText>Score: {score}</StatText>
            
            <HistoryList>
              <h4 style={{margin: '0 0 1rem 0'}}>Recent Scores</h4>
              {userHistory.length === 0 ? <p>No history yet</p> : 
                userHistory.map((s, i) => (
                  <HistoryItem key={i}>
                    <span>Mission {i + 1}</span>
                    <span>{s}</span>
                  </HistoryItem>
                ))
              }
            </HistoryList>

            <ButtonRow>
              <ActionButton onClick={restartGame}>
                <RefreshCw size={24} /> Replay (R)
              </ActionButton>
              <ActionButton onClick={() => navigate('/dashboard')}>
                <HomeIcon size={24} /> Home (H)
              </ActionButton>
            </ButtonRow>
          </Overlay>
        )}
      </GameArea>
    </GameContainer>
  );
};

export default AstroTyper;
