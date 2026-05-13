import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Home as HomeIcon } from 'lucide-react';
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
  background-color: #1a1a2e;
  border: 2px solid #333;
  overflow: hidden;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const WordDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  z-index: 100;
`;

const TargetWord = styled.div`
  font-size: 3rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.2rem;
  text-shadow: 0 0 20px rgba(233, 69, 96, 0.5);

  @media (min-width: 768px) {
    font-size: 5rem;
  }
`;

const LetterSpan = styled.span<{ $status: 'pending' | 'correct' | 'wrong' }>`
  color: ${props => {
    if (props.$status === 'correct') return '#4caf50';
    if (props.$status === 'wrong') return '#e94560';
    return '#fff';
  }};
  text-decoration: ${props => props.$status === 'wrong' ? 'underline' : 'none'};
`;

const TimerBarContainer = styled.div`
  width: 300px;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  margin-top: 1rem;

  @media (min-width: 768px) {
    width: 500px;
  }
`;

const TimerBarFill = styled(motion.div)<{ $color: string }>`
  height: 100%;
  background: ${props => props.$color};
  width: 100%;
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

const WORD_LIST = [
  'APPLE', 'BANANA', 'CHERRY', 'DOG', 'ELEPHANT', 'FISH', 'GIRAFFE', 'HOUSE', 'ICE', 'JUMP',
  'KITE', 'LION', 'MONKEY', 'NEST', 'ORANGE', 'PIZZA', 'QUEEN', 'RABBIT', 'SNAKE', 'TIGER',
  'UMBRELLA', 'VIOLET', 'WHALE', 'XYLOPHONE', 'YELLOW', 'ZEBRA', 'SPACE', 'ROCKET', 'PLANET',
  'STAR', 'MOON', 'GALAXY', 'COMET', 'NEBULA', 'COSMOS', 'METEOR', 'ORBIT', 'SOLAR', 'LUNAR'
];

const GAME_DURATION = 60;
const INITIAL_WORD_TIME = 5; // seconds per word initially

const FastFingerFrenzy: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, addXP, settings } = useUser();
  
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [wordTimeLeft, setWordTimeLeft] = useState(INITIAL_WORD_TIME);
  const [hintKey, setHintKey] = useState<string | undefined>(undefined);

  const timerRef = useRef<number | null>(null);
  const wordTimerRef = useRef<number | null>(null);

  const pickNewWord = useCallback(() => {
    const newWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setCurrentWord(newWord);
    setUserInput('');
    // Difficulty curve: as score increases, time per word slightly decreases
    const newTime = Math.max(2, INITIAL_WORD_TIME - Math.floor(score / 5) * 0.5);
    setWordTimeLeft(newTime);
  }, [score]);

  useEffect(() => {
    if (gameState === 'playing') {
      pickNewWord();
    }
  }, [gameState, pickNewWord]);

  // Overall game timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Word timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    wordTimerRef.current = window.setInterval(() => {
      setWordTimeLeft(prev => {
        if (prev <= 0.1) {
          pickNewWord();
          return INITIAL_WORD_TIME;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => {
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
    };
  }, [gameState, pickNewWord]);

  // Handle key press
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      const char = e.key.toUpperCase();
      if (char.length !== 1 || !/[A-Z]/.test(char)) return;

      const nextCharNeeded = currentWord[userInput.length];
      if (char === nextCharNeeded) {
        const newInput = userInput + char;
        setUserInput(newInput);
        
        if (newInput === currentWord) {
          setScore(s => s + 1);
          if (currentUser) addXP(currentUser, 10);
          pickNewWord();
        }
      } else {
        // Optional: penalty or sound for wrong key
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentWord, userInput, currentUser, addXP, pickNewWord]);

  // Hint logic
  useEffect(() => {
    if (!settings.typingHintEnabled || gameState !== 'playing' || !currentWord) {
      setHintKey(undefined);
      return;
    }
    setHintKey(currentWord[userInput.length]);
  }, [currentWord, userInput, settings.typingHintEnabled, gameState]);

  const restartGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setGameState('playing');
  };

  return (
    <GameContainer title="Fast Finger Frenzy">
      <GameArea>
        <HUD>
          <span>Time: {timeLeft}s</span>
          <span>Score: {score}</span>
        </HUD>

        <WordDisplay>
          <TargetWord data-testid="target-word">
            {currentWord.split('').map((char, index) => {
              let status: 'pending' | 'correct' | 'wrong' = 'pending';
              if (index < userInput.length) {
                status = 'correct';
              }
              return (
                <LetterSpan key={index} $status={status}>
                  {char}
                </LetterSpan>
              );
            })}
          </TargetWord>
          
          <TimerBarContainer>
            <TimerBarFill 
              $color={wordTimeLeft < 1.5 ? '#e94560' : '#4caf50'}
              animate={{ width: `${(wordTimeLeft / INITIAL_WORD_TIME) * 100}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </TimerBarContainer>
        </WordDisplay>

        <BottomArea>
          {settings.typingHintEnabled && <Keyboard highlightKey={hintKey} />}
        </BottomArea>

        {gameState === 'finished' && (
          <Overlay>
            <Title>Time's Up!</Title>
            <StatText>Your Score: {score}</StatText>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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

export default FastFingerFrenzy;
