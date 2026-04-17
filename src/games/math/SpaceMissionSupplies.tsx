import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Battery, Send } from 'lucide-react';
import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  @media (min-width: 768px) {
    padding: 1rem;
    overflow: hidden;
  }
`;

const ProblemText = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #e94560;
  text-align: center;
  max-width: 600px;

  @media (min-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
`;

const CrateGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const Crate = styled(motion.div)`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed #666;
  border-radius: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 6px;
  align-items: center;
  justify-items: center;

  @media (min-width: 768px) {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    gap: 4px;
    padding: 8px;
  }

  svg {
    width: 14px;
    height: 14px;

    @media (min-width: 768px) {
      width: 20px;
      height: 20px;
    }
  }
`;

const InputArea = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  width: 100%;
  justify-content: center;
`;

const NumberInput = styled.input`
  width: 70px;
  font-size: 1.8rem;
  padding: 0.4rem;
  border-radius: 12px;
  border: 3px solid #e94560;
  background: #1a1a2e;
  color: white;
  text-align: center;

  @media (min-width: 768px) {
    width: 90px;
    font-size: 1.8rem;
    padding: 0.4rem;
  }
`;

const SubmitButton = styled.button`
  background: #e94560;
  color: white;
  font-size: 1.1rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 768px) {
    font-size: 1.3rem;
    padding: 0.8rem 2.5rem;
  }

  &:hover {
    background: #ff5e78;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(2px);
  }
`;

const Keypad = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.6rem;
  margin-top: 1.5rem;
  width: 100%;
  max-width: 400px;
`;

const Key = styled.button`
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 0.5rem;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 768px) {
    padding: 0.8rem;
    font-size: 1.3rem;
  }

  &:hover { background: #34495e; }
  &:active { background: #1a252f; }
`;

const FeedbackText = styled(motion.div)<{ $correct: boolean }>`
  margin-top: 0.75rem;
  font-size: 1.2rem;
  color: ${props => props.$correct ? '#4caf50' : '#f44336'};

  @media (min-width: 768px) {
    margin-top: 1.5rem;
    font-size: 1.8rem;
  }
`;

const SpaceMissionSupplies: React.FC = () => {
  const [numCrates, setNumCrates] = useState(0);
  const [itemsPerCrate, setItemsPerCrate] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const { addXP, currentUser } = useUser();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const generateProblem = () => {
    setNumCrates(Math.floor(Math.random() * 4) + 2);
    setItemsPerCrate(Math.floor(Math.random() * 5) + 2);
    setUserAnswer('');
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    generateProblem();
    const handleGlobalClick = () => inputRef.current?.focus();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleSubmit = () => {
    if (!userAnswer || feedback) return;
    const correct = numCrates * itemsPerCrate;
    if (parseInt(userAnswer) === correct) {
      setFeedback('LIFT OFF! 🚀');
      if (currentUser) addXP(currentUser, 20);
      setTimeout(generateProblem, 2000);
    } else {
      setFeedback('Check your math! 🛸');
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
      }, 1500);
    }
  };

  return (
    <GameContainer title="Space Mission Supplies">
      <GameArea>
        <ProblemText>
          We need to load {numCrates} crates with {itemsPerCrate} fuel cells each.
          <br />
          How many fuel cells do we need in total?
        </ProblemText>

        <CrateGrid>
          {Array.from({ length: numCrates }).map((_, i) => (
            <Crate
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {Array.from({ length: itemsPerCrate }).map((_, j) => (
                <Battery key={j} color="#4caf50" />
              ))}
            </Crate>
          ))}
        </CrateGrid>

        <InputArea>
          <NumberInput
            ref={inputRef}
            type="text"
            inputMode="none"
            value={userAnswer}
            onChange={(e) => {
              // Allow only numbers if typed from physical keyboard
              const val = e.target.value.replace(/[^0-9]/g, '');
              setUserAnswer(val);
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="?"
            autoFocus
          />
          <SubmitButton onClick={handleSubmit}>
            SEND <Send size={24} style={{ verticalAlign: 'middle', marginLeft: '10px' }} />
          </SubmitButton>
        </InputArea>

        <Keypad>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
            <Key key={n} onClick={() => setUserAnswer(prev => prev + n)} tabIndex={-1}>
              {n}
            </Key>
          ))}
          <Key 
            style={{ gridColumn: 'span 2', background: '#e94560' }} 
            onClick={() => setUserAnswer('')}
            tabIndex={-1}
          >
            Clear
          </Key>
        </Keypad>

        <AnimatePresence>
          {feedback && (
            <FeedbackText
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              $correct={feedback.includes('LIFT')}
            >
              {feedback}
            </FeedbackText>
          )}
        </AnimatePresence>
      </GameArea>
    </GameContainer>
  );
};

export default SpaceMissionSupplies;