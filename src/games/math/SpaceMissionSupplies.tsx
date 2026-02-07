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
  padding: 2rem;
  height: 100%;
`;

const ProblemText = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #e94560;
  text-align: center;
`;

const CrateGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
`;

const Crate = styled(motion.div)`
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border: 3px dashed #666;
  border-radius: 15px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  padding: 10px;
  align-items: center;
  justify-items: center;
`;

const InputArea = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const NumberInput = styled.input`
  width: 100px;
  font-size: 2rem;
  padding: 0.5rem;
  border-radius: 10px;
  border: 2px solid #e94560;
  background: #1a1a2e;
  color: white;
  text-align: center;
`;

const SubmitButton = styled.button`
  background: #e94560;
  color: white;
  font-size: 1.5rem;
  padding: 1rem 3rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;

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
  gap: 0.5rem;
  margin-top: 2rem;
`;

const Key = styled.button`
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 1rem;
  font-size: 1.5rem;
  cursor: pointer;

  &:hover { background: #34495e; }
  &:active { background: #1a252f; }
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
                <Battery key={j} size={24} color="#4caf50" />
              ))}
            </Crate>
          ))}
        </CrateGrid>

        <InputArea>
          <NumberInput
            ref={inputRef}
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
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
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              style={{
                marginTop: '2rem',
                fontSize: '2rem',
                color: feedback.includes('LIFT') ? '#4caf50' : '#f44336'
              }}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>
      </GameArea>
    </GameContainer>
  );
};

export default SpaceMissionSupplies;