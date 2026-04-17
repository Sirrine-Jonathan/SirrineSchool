import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dog, Cat, Car, Sun, Star, Bird, Trees, Fish, Moon, Apple, 
  Volume2 
} from 'lucide-react';
import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';

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

const TargetBox = styled.div`
  background: #333;
  padding: 1.5rem;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  border: 4px solid #f39c12;
  box-shadow: 0 5px 0 #d35400;
  cursor: pointer;
  transition: transform 0.1s;
  width: 100%;
  max-width: 300px;

  @media (min-width: 768px) {
    padding: 3rem;
    border-radius: 30px;
    gap: 1.5rem;
    margin-bottom: 3rem;
    border-width: 4px;
    box-shadow: 0 10px 0 #d35400;
    max-width: none;
    width: auto;
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #d35400;

    @media (min-width: 768px) {
      transform: translateY(5px);
      box-shadow: 0 5px 0 #d35400;
    }
  }

  svg {
    width: 80px;
    height: 80px;

    @media (min-width: 768px) {
      width: 120px;
      height: 120px;
    }
  }

  p {
    font-size: 1.1rem;
    @media (min-width: 768px) {
      font-size: 1.2rem;
    }
  }
`;

const WordGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
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
  font-size: 1.2rem;
  padding: 0.8rem;
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

  @media (min-width: 768px) {
    font-size: 2rem;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: ${props => props.$active ? '0 8px 0 #d35400' : '0 8px 0 #1a252f'};
  }

  svg {
    width: 32px;
    height: 32px;
    @media (min-width: 768px) {
      width: 64px;
      height: 64px;
    }
  }

  &:hover {
    background: #34495e;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #1a252f;

    @media (min-width: 768px) {
      transform: translateY(4px);
      box-shadow: 0 4px 0 #1a252f;
    }
  }

  transform: ${props => props.$active ? 'translateY(-3px)' : 'none'};

  @media (min-width: 768px) {
    transform: ${props => props.$active ? 'translateY(-4px)' : 'none'};
  }
`;

const Shortcut = styled.span`
  font-size: 0.8rem;
  opacity: 0.6;
  display: none;

  @media (min-width: 768px) {
    display: inline;
  }
`;

const Feedback = styled(motion.div)`
  margin-top: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.2);

  @media (min-width: 768px) {
    margin-top: 2rem;
    font-size: 3rem;
  }
`;

const HintText = styled.div`
  margin-top: 1rem;
  opacity: 0.5;
  font-size: 0.8rem;
  display: none;

  @media (min-width: 768px) {
    display: block;
    margin-top: 2rem;
    font-size: 0.9rem;
  }
`;

const WORD_ITEMS = [
  { word: 'DOG', icon: Dog },
  { word: 'CAT', icon: Cat },
  { word: 'CAR', icon: Car },
  { word: 'SUN', icon: Sun },
  { word: 'STAR', icon: Star },
  { word: 'BIRD', icon: Bird },
  { word: 'TREE', icon: Trees },
  { word: 'FISH', icon: Fish },
  { word: 'MOON', icon: Moon },
  { word: 'APPLE', icon: Apple },
];

const SkateboardWordMatch: React.FC = () => {
  const [target, setTarget] = useState(WORD_ITEMS[0]);
  const [options, setOptions] = useState<typeof WORD_ITEMS>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { addXP, currentUser } = useUser();

  const speak = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }, []);

  const generateProblem = useCallback(() => {
    const newTarget = WORD_ITEMS[Math.floor(Math.random() * WORD_ITEMS.length)];
    setTarget(newTarget);
    
    const others = WORD_ITEMS.filter(item => item.word !== newTarget.word);
    const shuffled = [...others].sort(() => 0.5 - Math.random());
    const choices = [newTarget, shuffled[0], shuffled[1]].sort(() => 0.5 - Math.random());
    
    setOptions(choices);
    setFeedback(null);
    setSelectedIndex(0);
    
    // Auto-speak the target word
    setTimeout(() => speak(newTarget.word), 500);
  }, [speak]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const handleChoice = (word: string) => {
    if (word === target.word) {
      setFeedback('KICKFLIP! 🛹');
      speak('Kickflip! Awesome!');
      if (currentUser) addXP(currentUser, 20);
      setTimeout(generateProblem, 2000);
    } else {
      setFeedback('Try again! 🔄');
      speak('Try again');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback) return;

      if (e.key === '1') handleChoice(options[0]?.word);
      else if (e.key === '2') handleChoice(options[1]?.word);
      else if (e.key === '3') handleChoice(options[2]?.word);
      else if (e.key === 'ArrowRight') setSelectedIndex(prev => (prev + 1) % 3);
      else if (e.key === 'ArrowLeft') setSelectedIndex(prev => (prev - 1 + 3) % 3);
      else if (e.key === 'Enter') handleChoice(options[selectedIndex]?.word);
      else if (e.key === ' ') speak(target.word);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, selectedIndex, feedback, target.word, speak]);

  return (
    <GameContainer title="Skateboard Word Match">
      <GameArea>
        <TargetBox onClick={() => speak(target.word)}>
          <target.icon color="#f39c12" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Volume2 size={24} color="#f39c12" />
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem' }}>{target.word}</p>
            </div>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Match the word!</p>
          </div>
        </TargetBox>

        <WordGrid>
          {options.map((item, index) => (
            <WordButton 
              key={item.word} 
              $active={selectedIndex === index}
              onClick={() => handleChoice(item.word)}
            >
              <item.icon />
              {item.word}
              <Shortcut>({index + 1})</Shortcut>
            </WordButton>
          ))}
        </WordGrid>

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

        <HintText>
          Use 1-3 keys or Arrow Keys + Enter
        </HintText>
      </GameArea>
    </GameContainer>
  );
};

export default SkateboardWordMatch;