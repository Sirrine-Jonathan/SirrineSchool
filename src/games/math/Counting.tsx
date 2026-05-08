import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Settings2, Send } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const ConfigPanel = styled.div`
  background: rgba(0, 0, 0, 0.4);
  padding: 1rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);

  label {
    font-weight: bold;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  input {
    flex: 1;
    cursor: pointer;
    accent-color: #f39c12;
  }

  span {
    font-size: 1.2rem;
    font-weight: bold;
    color: #f39c12;
    min-width: 2.5rem;
    text-align: center;
  }
`;

const InputSection = styled.div`
  display: flex;
  gap: 0.5rem;
  width: 100%;
  max-width: 300px;
  margin-top: 2rem;
`;

const AnswerInput = styled.input`
  flex: 1;
  font-size: 2rem;
  padding: 1rem;
  border-radius: 16px;
  border: 4px solid #f39c12;
  background: #1a1a1a;
  color: white;
  text-align: center;
  font-weight: bold;
  
  &:focus {
    outline: none;
    border-color: #e67e22;
  }
`;

const SubmitBtn = styled.button`
  background: #4caf50;
  color: white;
  padding: 0 1.5rem;
  border: none;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 0 #2e7d32;
  transition: all 0.1s;

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #2e7d32;
  }
`;

const TruckGrid = styled.div<{ $count: number }>`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  width: 100%;
  max-width: 500px;
  align-content: center;
  justify-items: center;

  @media (min-width: 768px) {
    gap: 1.5rem;
  }
`;

const TruckWrapper = styled(motion.div)<{ $count: number }>`
  svg {
    width: 40px;
    height: 40px;

    @media (min-width: 480px) {
      width: 50px;
      height: 50px;
    }

    @media (min-width: 768px) {
      width: 60px;
      height: 60px;
    }
  }
`;

const Feedback = styled(motion.div)`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  font-weight: bold;
  pointer-events: none;
  z-index: 20;

  @media (min-width: 768px) {
    font-size: 5rem;
  }
`;

const Counting: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const maxRange = parseInt(searchParams.get('max') || '10', 10);
  
  const [targetCount, setTargetCount] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addXP, currentUser } = useUser();

  const generateNewProblem = useCallback((currentMax: number) => {
    const newCount = Math.floor(Math.random() * currentMax) + 1;
    setTargetCount(newCount);
    setUserAnswer('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    generateNewProblem(maxRange);
  }, [generateNewProblem, maxRange]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (feedback || !userAnswer) return;

    const answerNum = parseInt(userAnswer, 10);
    if (answerNum === targetCount) {
      setFeedback('SMASH! 🏎️');
      if (currentUser) addXP(currentUser, 10);
      setTimeout(() => {
        setFeedback(null);
        generateNewProblem(maxRange);
      }, 1500);
    } else {
      setFeedback('Try Again! 🤔');
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
      }, 1000);
    }
  };

  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRange = parseInt(e.target.value, 10);
    setSearchParams({ max: newRange.toString() });
  };

  useEffect(() => {
    const handleGlobalClick = () => inputRef.current?.focus();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <GameContainer title="Counting">
      <GameArea>
        <ConfigPanel>
          <Settings2 size={20} />
          <label htmlFor="range-slider">Range 1-</label>
          <input 
            id="range-slider"
            type="range" 
            min="1" 
            max="20" 
            step="1"
            value={maxRange} 
            onChange={handleRangeChange}
          />
          <span>{maxRange}</span>
        </ConfigPanel>

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

        <TruckGrid $count={targetCount}>
          {Array.from({ length: targetCount }).map((_, i) => (
            <TruckWrapper
              key={`${targetCount}-${i}`}
              $count={targetCount}
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Truck color="#f39c12" strokeWidth={1.5} />
            </TruckWrapper>
          ))}
        </TruckGrid>

        <form onSubmit={handleSubmit}>
          <InputSection>
            <AnswerInput
              ref={inputRef}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              placeholder="?"
              autoFocus
            />
            <SubmitBtn type="submit">
              <Send size={32} />
            </SubmitBtn>
          </InputSection>
        </form>
      </GameArea>
    </GameContainer>
  );
};

export default Counting;