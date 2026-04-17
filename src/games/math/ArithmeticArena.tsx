import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Send, Star } from 'lucide-react';
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

const ProblemCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 500px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  margin: auto 0;

  @media (min-width: 768px) {
    border-radius: 30px;
    padding: 2rem;
    gap: 1.5rem;
    margin: 0;
  }
`;

const Equation = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2.2rem;
  font-weight: bold;
  width: 100%;

  @media (min-width: 768px) {
    gap: 1rem;
    font-size: 3rem;
  }
`;

const NumberBox = styled.div<{ $color: string }>`
  background: ${props => props.$color};
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  color: white;
  box-shadow: 0 3px 0 rgba(0,0,0,0.2);

  @media (min-width: 768px) {
    width: 80px;
    height: 80px;
    border-radius: 15px;
    box-shadow: 0 4px 0 rgba(0,0,0,0.2);
  }
`;

const VisualAid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3rem;
  min-height: 30px;
  max-width: 100%;

  @media (min-width: 768px) {
    gap: 0.4rem;
    min-height: 30px;
  }

  svg {
    width: 18px;
    height: 18px;
    @media (min-width: 768px) {
      width: 20px;
      height: 20px;
    }
  }
`;

const AnswerInput = styled.input`
  width: 70px;
  font-size: 2rem;
  padding: 0.4rem;
  border-radius: 12px;
  border: 3px solid #646cff;
  background: #1a1a1a;
  color: white;
  text-align: center;

  @media (min-width: 768px) {
    width: 100px;
    font-size: 2.5rem;
    padding: 0.5rem;
  }

  &:focus {
    outline: none;
    border-color: #ffd700;
  }
`;

const Keypad = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.6rem;
  margin-top: 1rem;
  width: 100%;

  @media (min-width: 768px) {
    gap: 0.6rem;
    margin-top: 1rem;
  }
`;

const Key = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem 0.5rem;
  font-size: 1.4rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 768px) {
    padding: 0.8rem;
    font-size: 1.3rem;
  }

  &:hover { background: rgba(255, 255, 255, 0.2); }
  &:active { transform: scale(0.95); }
`;

const Feedback = styled(motion.div)`
  margin-top: 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;

  @media (min-width: 768px) {
    margin-top: 1rem;
    font-size: 1.8rem;
  }
`;

const ArithmeticArena: React.FC = () => {
  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+' as '+' | '-' });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const { addXP, currentUser, users } = useUser();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const user = currentUser ? users[currentUser] : null;
  const themeColor = user?.theme === 'space_princess' ? '#e94560' : '#f39c12';

  const generateProblem = () => {
    const isSub = Math.random() > 0.5;
    let a, b;
    if (isSub) {
      a = Math.floor(Math.random() * 15) + 5;
      b = Math.floor(Math.random() * a);
    } else {
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
    }
    setProblem({ a, b, op: isSub ? '-' : '+' });
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
    const correct = problem.op === '+' ? problem.a + problem.b : problem.a - problem.b;
    if (parseInt(userAnswer) === correct) {
      setFeedback('AWESOME! ⭐');
      if (currentUser) addXP(currentUser, 15);
      setTimeout(generateProblem, 1500);
    } else {
      setFeedback('Try one more time! 🌈');
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
      }, 1500);
    }
  };

  return (
    <GameContainer title="Arithmetic Arena">
      <GameArea>
        <ProblemCard
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Equation>
            <NumberBox $color={themeColor}>{problem.a}</NumberBox>
            {problem.op === '+' ? <Plus size={32} /> : <Minus size={32} />}
            <NumberBox $color="#2196f3">{problem.b}</NumberBox>
            <span>=</span>
            <AnswerInput
              ref={inputRef}
              type="text"
              inputMode="none"
              value={userAnswer}
              onChange={(e) => {
                // Allow only numbers if typed from physical keyboard
                const val = e.target.value.replace(/[^0-9]/g, '');
                setUserAnswer(val);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="?"
              autoFocus
            />
          </Equation>

          <VisualAid>
            {Array.from({ length: problem.a }).map((_, i) => (
              <Star key={`a-${i}`} size={20} fill={themeColor} color={themeColor} />
            ))}
            <div style={{ width: '100%', height: '1px', margin: '0.5rem 0' }} />
            {Array.from({ length: problem.b }).map((_, i) => (
              <Star key={`b-${i}`} size={20} fill="#2196f3" color="#2196f3" />
            ))}
          </VisualAid>

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
            <Key 
              style={{ gridColumn: 'span 3', background: '#4caf50' }} 
              onClick={handleSubmit}
              tabIndex={-1}
            >
              GO! <Send size={18} style={{ verticalAlign: 'middle', marginLeft: '5px' }} />
            </Key>
          </Keypad>
        </ProblemCard>

        <AnimatePresence>
          {feedback && (
            <Feedback
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{ color: feedback.includes('AWESOME') ? '#4caf50' : '#f44336' }}
            >
              {feedback}
            </Feedback>
          )}
        </AnimatePresence>
      </GameArea>
    </GameContainer>
  );
};

export default ArithmeticArena;
