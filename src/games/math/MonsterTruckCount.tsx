import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck } from 'lucide-react';
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

const TruckGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 4rem;
  max-width: 800px;
`;

const AnswerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
`;

const NumberButton = styled.button<{ $active?: boolean }>`
  font-size: 2.5rem;
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.$active ? '#e67e22' : '#f39c12'};
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  box-shadow: ${props => props.$active ? '0 2px 0 #d35400' : '0 5px 0 #d35400'};
  transform: ${props => props.$active ? 'translateY(3px)' : 'none'};
  transition: all 0.1s;

  &:active {
    transform: translateY(5px);
    box-shadow: none;
  }
`;

const Shortcut = styled.span`
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: -5px;
`;

const Feedback = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 5rem;
  font-weight: bold;
  pointer-events: none;
  z-index: 20;
`;

const MonsterTruckCount: React.FC = () => {
  const [targetCount, setTargetCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { addXP, currentUser } = useUser();
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const generateNewProblem = () => {
    const newCount = Math.floor(Math.random() * 10) + 1;
    setTargetCount(newCount);
    setSelectedIndex(newCount - 1); // Default highlight to something
  };

  useEffect(() => {
    generateNewProblem();
  }, []);

  const handleAnswer = (answer: number) => {
    if (feedback) return;
    if (answer === targetCount) {
      setFeedback('SMASH! 🏎️');
      if (currentUser) addXP(currentUser, 10);
      setTimeout(() => {
        setFeedback(null);
        generateNewProblem();
      }, 1500);
    } else {
      setFeedback('Try Again! 🤔');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback) return;

      if (e.key >= '1' && e.key <= '9') {
        handleAnswer(parseInt(e.key));
      } else if (e.key === '0') {
        handleAnswer(10);
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(prev => (prev + 1) % 10);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex(prev => (prev - 1 + 10) % 10);
      } else if (e.key === 'Enter') {
        handleAnswer(numbers[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedback, targetCount, selectedIndex]);

  return (
    <GameContainer title="Monster Truck Count">
      <GameArea>
        <AnimatePresence>
          {feedback && (
            <Feedback
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 2, opacity: 0 }}
              style={{ color: feedback.startsWith('S') ? '#4caf50' : '#f44336' }}
            >
              {feedback}
            </Feedback>
          )}
        </AnimatePresence>

        <TruckGrid>
          {Array.from({ length: targetCount }).map((_, i) => (
            <motion.div
              key={`${targetCount}-${i}`}
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Truck size={80} color="#f39c12" strokeWidth={1.5} />
            </motion.div>
          ))}
        </TruckGrid>

        <AnswerGrid>
          {numbers.map((num, idx) => (
            <NumberButton 
              key={num} 
              $active={selectedIndex === idx}
              onClick={() => handleAnswer(num)}
            >
              {num}
              <Shortcut>{num === 10 ? '0' : num}</Shortcut>
            </NumberButton>
          ))}
        </AnswerGrid>
        <div style={{ marginTop: '2rem', opacity: 0.5 }}>
          Press keys 1-9 (0 for 10) or Arrows + Enter
        </div>
      </GameArea>
    </GameContainer>
  );
};

export default MonsterTruckCount;