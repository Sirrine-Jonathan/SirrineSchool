import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Home as HomeIcon } from 'lucide-react';
import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';
import Keyboard from '../../components/Keyboard';

// --- STYLES ---

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  height: 80vh;
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
`;

const MeteorContainer = styled(motion.div)<{ $left: number }>`
  position: absolute;
  left: ${props => props.$left}%;
  top: -10%; /* Start just above the view */
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MeteorBody = styled.div<{ $color: string }>`
  width: 80px;
  height: 80px;
  background: radial-gradient(circle at 30% 30%, ${props => props.$color}, #000);
  border-radius: 50% 40% 50% 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255,255,255,0.2);
  position: relative;
  box-shadow: 0 0 20px ${props => props.$color}88;

  /* Tail */
  &::before {
    content: '';
    position: absolute;
    top: -40px;
    left: 50%;
    width: 20px;
    height: 60px;
    background: linear-gradient(to bottom, transparent, ${props => props.$color}44);
    transform: translateX(-50%);
    filter: blur(4px);
  }
`;

const Letter = styled.span`
  font-size: 2.5rem;
  font-weight: 900;
  color: #FFFFFF !important;
  text-shadow: 0 0 10px rgba(0,0,0,0.8);
  pointer-events: none;
  z-index: 2;
`;

const explodeAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.8; background: #ffd700; box-shadow: 0 0 30px #ffd700; }
  100% { transform: scale(2); opacity: 0; }
`;

const Explosion = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #FFFFFF;
  animation: ${explodeAnimation} 0.3s ease-out forwards;
`;

const HUD = styled.div`
  position: absolute;
  top: 1rem;
  left: 0;
  right: 0;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 110;
  font-size: 1.5rem;
  font-weight: bold;
  color: #FFF;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
`;

const BottomArea = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  z-index: 110;
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
  gap: 1.5rem;
`;

const Title = styled.h2`
  font-size: 3rem;
  margin: 0;
  color: #ffd700;
`;

const StatText = styled.p`
  font-size: 1.5rem;
  margin: 0;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  padding: 0.8rem 1.5rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;

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
  width: 300px;
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
        };
        
        setTotalSpawned(t => t + 1);
        
        return [...prev, newMeteor];
      }
      return prev;
    });

    // Schedule next check
    nextSpawnTimeoutRef.current = window.setTimeout(stableSpawnLoop, checkRate);
  }, []);

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

        <AnimatePresence>
          {meteors.map(meteor => (
            <MeteorContainer
              key={meteor.id}
              $left={meteor.xPercent}
              initial={{ top: '-10%' }}
              animate={meteor.status === 'falling' ? { top: '110%' } : undefined}
              transition={{ duration: 8, ease: 'linear' }}
              onAnimationComplete={() => handleAnimationComplete(meteor.id)}
            >
              {meteor.status === 'falling' ? (
                <MeteorBody $color={meteor.color}>
                  <Letter>{meteor.letter}</Letter>
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