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
  padding: 2rem;
`;

const TargetBox = styled.div`
  background: #333;
  padding: 3rem;
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  border: 4px solid #f39c12;
  box-shadow: 0 10px 0 #d35400;
  cursor: pointer;
  transition: transform 0.1s;

  &:active {
    transform: translateY(5px);
    box-shadow: 0 5px 0 #d35400;
  }
`;

const WordGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  width: 100%;
  max-width: 800px;
`;

const WordButton = styled.button<{ $active?: boolean }>`
  font-size: 2rem;
  padding: 2rem;
  background: ${props => props.$active ? '#f39c12' : '#2c3e50'};
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 8px 0 #d35400' : '0 8px 0 #1a252f'};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #34495e;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(4px);
    box-shadow: 0 4px 0 #1a252f;
  }

  transform: ${props => props.$active ? 'translateY(-4px)' : 'none'};
`;

const Shortcut = styled.span`
  font-size: 1rem;
  opacity: 0.6;
`;

const Feedback = styled(motion.div)`
  margin-top: 2rem;
  font-size: 3rem;
  font-weight: bold;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.2);
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
          <target.icon size={120} color="#f39c12" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Volume2 size={24} color="#f39c12" />
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem' }}>Find the word!</p>
          </div>
        </TargetBox>

        <WordGrid>
          {options.map((item, index) => (
            <WordButton 
              key={item.word} 
              $active={selectedIndex === index}
              onClick={() => handleChoice(item.word)}
            >
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

        <div style={{ marginTop: '2rem', opacity: 0.5, fontSize: '0.9rem' }}>
          Use 1-3 keys or Arrow Keys + Enter
        </div>
      </GameArea>
    </GameContainer>
  );
};

export default SkateboardWordMatch;
