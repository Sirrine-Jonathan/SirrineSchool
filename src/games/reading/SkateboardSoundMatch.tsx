import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RefreshCcw } from 'lucide-react';
import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';

type GameMode = 'soundToWord' | 'wordToSound';

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;

  @media (min-width: 768px) {
    padding: 2rem;
    overflow: hidden;
  }
`;

const ModeToggle = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #f39c12;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
  font-size: 0.9rem;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const TargetBox = styled.div<{ $isActive?: boolean }>`
  background: #333;
  padding: 2rem;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border: 4px solid #f39c12;
  box-shadow: 0 5px 0 #d35400;
  cursor: pointer;
  transition: transform 0.1s;
  width: 100%;
  max-width: 400px;

  @media (min-width: 768px) {
    padding: 4rem;
    border-radius: 30px;
    margin-bottom: 3rem;
    box-shadow: 0 10px 0 #d35400;
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #d35400;
  }

  h1 {
    font-size: 3rem;
    margin: 0;
    letter-spacing: 4px;

    @media (min-width: 768px) {
      font-size: 5rem;
    }
  }
`;

const WordGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 400px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 768px) {
    gap: 2rem;
    max-width: 800px;
  }
`;

const WordButton = styled.button<{ $active?: boolean }>`
  font-size: 1.4rem;
  padding: 1.2rem;
  background: ${props => props.$active ? '#f39c12' : '#2c3e50'};
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 4px 0 #d35400' : '0 4px 0 #1a252f'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 80px;

  @media (min-width: 768px) {
    font-size: 2.5rem;
    padding: 2.5rem;
    border-radius: 20px;
    box-shadow: ${props => props.$active ? '0 8px 0 #d35400' : '0 8px 0 #1a252f'};
    min-height: 150px;
  }

  &:hover {
    background: #34495e;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #1a252f;
  }

  transform: ${props => props.$active ? 'translateY(-3px)' : 'none'};
`;

const Shortcut = styled.span`
  font-size: 0.8rem;
  opacity: 0.6;
  display: none;

  @media (min-width: 768px) {
    display: block;
    margin-top: 0.5rem;
  }
`;

const Feedback = styled(motion.div)`
  margin-top: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.2);

  @media (min-width: 768px) {
    margin-top: 1.5rem;
    font-size: 3rem;
  }
`;

const SubmitButton = styled.button<{ $visible: boolean }>`
  margin-top: 1.5rem;
  background: #4caf50;
  color: white;
  padding: 1rem 2.5rem;
  font-size: 1.4rem;
  font-weight: bold;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 4px 0 #2e7d32;
  transition: all 0.2s;
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  opacity: ${props => props.$visible ? 1 : 0};
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(10px)'};

  @media (min-width: 768px) {
    margin-top: 2rem;
    font-size: 2rem;
    padding: 1.5rem 4rem;
  }

  &:hover {
    background: #66bb6a;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #2e7d32;
  }
`;

const WORD_ITEMS = [
  'DOG', 'CAT', 'CAR', 'SUN', 'STAR', 'BIRD', 'TREE', 'FISH', 'MOON', 'APPLE',
  'BALL', 'BIKE', 'CAKE', 'DUCK', 'FROG', 'HOME', 'KITE', 'LION', 'PARK', 'SHIP'
];

const SkateboardWordMatch: React.FC = () => {
  const [mode, setMode] = useState<GameMode>('soundToWord');
  const [target, setTarget] = useState(WORD_ITEMS[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { addXP, currentUser } = useUser();

  const speak = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }, []);

  const generateProblem = useCallback(() => {
    const newTarget = WORD_ITEMS[Math.floor(Math.random() * WORD_ITEMS.length)];
    setTarget(newTarget);
    
    const others = WORD_ITEMS.filter(word => word !== newTarget);
    const shuffled = [...others].sort(() => 0.5 - Math.random());
    const choices = [newTarget, shuffled[0], shuffled[1]].sort(() => 0.5 - Math.random());
    
    setOptions(choices);
    setFeedback(null);
    setSelectedIndex(0);
    setSelectedWord(null);
    
    // Auto-speak the target if in sound-to-word mode
    if (mode === 'soundToWord') {
      setTimeout(() => speak(newTarget), 500);
    }
  }, [speak, mode]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const toggleMode = () => {
    setMode(prev => prev === 'soundToWord' ? 'wordToSound' : 'soundToWord');
  };

  const handleChoice = (word: string | null) => {
    if (!word || feedback) return;

    if (word === target) {
      setFeedback('KICKFLIP! 🛹');
      speak('Kickflip!');
      if (currentUser) addXP(currentUser, 20);
      setTimeout(generateProblem, 2000);
    } else {
      setFeedback('Try again! 🔄');
      speak('Try again');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handleOptionClick = (word: string, index: number) => {
    setSelectedIndex(index);
    if (mode === 'wordToSound') {
      speak(word);
      setSelectedWord(word);
    } else {
      handleChoice(word);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback) return;

      if (e.key === '1') handleOptionClick(options[0], 0);
      else if (e.key === '2') handleOptionClick(options[1], 1);
      else if (e.key === '3') handleOptionClick(options[2], 2);
      else if (e.key === 'ArrowRight') {
        const next = (selectedIndex + 1) % 3;
        setSelectedIndex(next);
        if (mode === 'wordToSound') speak(options[next]);
      }
      else if (e.key === 'ArrowLeft') {
        const next = (selectedIndex - 1 + 3) % 3;
        setSelectedIndex(next);
        if (mode === 'wordToSound') speak(options[next]);
      }
      else if (e.key === 'Enter') {
        if (mode === 'wordToSound') handleChoice(selectedWord || options[selectedIndex]);
        else handleChoice(options[selectedIndex]);
      }
      else if (e.key === ' ') {
        if (mode === 'soundToWord') speak(target);
        else speak(options[selectedIndex]);
      }
      else if (e.key.toLowerCase() === 'm') toggleMode();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, selectedIndex, selectedWord, feedback, target, speak, mode]);

  return (
    <GameContainer title="Reading">
      <GameArea>
        <ModeToggle onClick={toggleMode}>
          <RefreshCcw size={16} />
          {mode === 'soundToWord' ? 'Sound → Word' : 'Word → Sound'} (M)
        </ModeToggle>

        <TargetBox 
          onClick={() => mode === 'soundToWord' && speak(target)}
          data-target={target}
        >
          {mode === 'soundToWord' ? (
            <>
              <Volume2 size={80} color="#f39c12" />
              <p style={{ margin: 0, opacity: 0.7 }}>Click to hear the word</p>
            </>
          ) : (
            <h1>{target}</h1>
          )}
        </TargetBox>

        <WordGrid>
          {options.map((word, index) => (
            <WordButton 
              key={word} 
              $active={selectedIndex === index || selectedWord === word}
              onClick={() => handleOptionClick(word, index)}
              data-word={word}
            >
              {mode === 'soundToWord' ? (
                word
              ) : (
                <Volume2 size={48} />
              )}
              <Shortcut>({index + 1})</Shortcut>
            </WordButton>
          ))}
        </WordGrid>

        {mode === 'wordToSound' && (
          <SubmitButton 
            $visible={!!selectedWord} 
            onClick={() => handleChoice(selectedWord)}
          >
            CHECK ANSWER
          </SubmitButton>
        )}

        <AnimatePresence>
          {feedback && (
            <Feedback
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              style={{ color: feedback.includes('!') ? '#4caf50' : '#f44336' }}
            >
              {feedback}
            </Feedback>
          )}
        </AnimatePresence>
      </GameArea>
    </GameContainer>
  );
};

export default SkateboardWordMatch;