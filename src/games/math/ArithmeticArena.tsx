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
  justify-content: space-between;
  padding: 1rem;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const ProgressSection = styled.div`
  width: 100%;
  max-width: 800px;
  flex: 1;
  position: relative;
  background: transparent;
  border-radius: 24px;
  margin-bottom: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 200px;
`;

const Mountain = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 150px solid transparent;
  border-right: 150px solid transparent;
  border-bottom: 100px solid rgba(255, 255, 255, 0.08);
  z-index: 1;

  @media (min-width: 768px) {
    border-left: 200px solid transparent;
    border-right: 200px solid transparent;
    border-bottom: 150px solid rgba(255, 255, 255, 0.08);
  }
`;

const Climber = styled(motion.div)`
  position: absolute;
  font-size: 2rem;
  z-index: 5;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const Marker = styled.div`
  position: absolute;
  font-size: 1.5rem;
  z-index: 2;
  @media (min-width: 768px) { font-size: 2rem; }
`;

const Flag = styled.div`
  position: absolute;
  top: 15px;
  left: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  color: #ffd700;
  z-index: 10;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
`;

const ProblemCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 500px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;

  @media (min-width: 768px) {
    border-radius: 30px;
    padding: 1.5rem;
    gap: 1.5rem;
  }
`;

const Equation = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.8rem;
  font-weight: bold;
  width: 100%;

  @media (min-width: 768px) {
    gap: 1rem;
    font-size: 3rem;
  }
`;

const NumberBox = styled.div<{ $color: string }>`
  background: ${props => props.$color};
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
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
  justify-content: flex-start;
  gap: 0.2rem;
  min-height: 20px;
  width: 100%;

  @media (min-width: 768px) {
    gap: 0.4rem;
    min-height: 30px;
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

const AnswerInput = styled.input`
  width: 60px;
  font-size: 1.5rem;
  padding: 0.3rem;
  border-radius: 10px;
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
  gap: 0.4rem;
  margin-top: 0.5rem;
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
  border-radius: 10px;
  padding: 0.6rem 0.3rem;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (min-width: 768px) {
    border-radius: 12px;
    padding: 0.8rem;
    font-size: 1.3rem;
  }

  &:hover { background: rgba(255, 255, 255, 0.2); }
  &:active { transform: scale(0.95); }
`;

const Feedback = styled(motion.div)`
  position: absolute;
  top: 45%;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  pointer-events: none;
  z-index: 100;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
  font-size: 2.5rem;

  @media (min-width: 768px) {
    font-size: 5rem;
  }
`;

const ArithmeticArena: React.FC = () => {
  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+' as '+' | '-' });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [stepsCompleted, setStepsCompleted] = useState(0);
  const [showTrophy, setShowTrophy] = useState(false);
  const { addXP, currentUser, users, recordGameWin } = useUser();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const TOTAL_STEPS = 10;
  const user = currentUser ? users[currentUser] : null;
  const isSpace = user?.theme === 'space_princess';
  const themeColor = isSpace ? '#e94560' : '#f39c12';
  
  const startEmoji = isSpace ? '🌍' : '🌲';
  const midEmoji = isSpace ? '🚀' : '🧗';
  const endEmoji = isSpace ? '🌙' : '🏔️';

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
    
    if (showTrophy) setShowTrophy(false);

    const correct = problem.op === '+' ? problem.a + problem.b : problem.a - problem.b;
    if (parseInt(userAnswer) === correct) {
      setFeedback('AWESOME! ⭐');
      
      const newSteps = stepsCompleted + 1;
      if (newSteps >= TOTAL_STEPS) {
        setStepsCompleted(0);
        setShowTrophy(true);
        if (currentUser) recordGameWin(currentUser, 'arithmetic');
      } else {
        setStepsCompleted(newSteps);
      }

      if (currentUser) addXP(currentUser, 15);
      setTimeout(generateProblem, 1500);
    } else {
      setFeedback('Try one more time! 🌈');
      setStepsCompleted(prev => Math.max(prev - 1, 0));
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
      }, 1500);
    }
  };

  const progressPercent = (stepsCompleted / TOTAL_STEPS) * 100;

  return (
    <GameContainer title="Arithmetic Arena">
      <GameArea>
        <ProgressSection>
          {!isSpace && <Mountain />}
          
          <Flag>{stepsCompleted} / {TOTAL_STEPS}</Flag>
          
          <Marker style={{ bottom: '10px', left: '15px' }}>{startEmoji}</Marker>
          <Marker style={{ top: '15px', right: '15px' }}>{endEmoji}</Marker>

          <Climber
            animate={{
              bottom: `${10 + (progressPercent * 0.75)}%`,
              left: `${15 + (progressPercent * 0.65)}%`,
              rotate: feedback?.includes('AWESOME') ? [0, -10, 10, 0] : 0,
              scale: feedback?.includes('AWESOME') ? [1, 1.4, 1] : 1,
            }}
            transition={{ type: 'spring', stiffness: 80, damping: 10 }}
          >
            {midEmoji}
            {feedback?.includes('AWESOME') && (
              <motion.span
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -20 }}
                style={{ fontSize: '1rem', position: 'absolute', top: -10 }}
              >
                ⭐
              </motion.span>
            )}
          </Climber>

          <AnimatePresence>
            {showTrophy && (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 2, opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  x: '-50%',
                  y: '-50%',
                  fontSize: '8rem',
                  zIndex: 20,
                  filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
                  pointerEvents: 'none'
                }}
              >
                🏆
              </motion.div>
            )}
          </AnimatePresence>
        </ProgressSection>

        <ProblemCard
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Equation>
            <NumberBox $color={themeColor} data-testid="num-a">{problem.a}</NumberBox>
            {problem.op === '+' ? <Plus size={32} data-testid="op" data-op="+" /> : <Minus size={32} data-testid="op" data-op="-" />}
            <NumberBox $color="#2196f3" data-testid="num-b">{problem.b}</NumberBox>
            <span>=</span>
            <AnswerInput
              ref={inputRef}
              type="text"
              inputMode="none"
              data-testid="answer-input"
              value={userAnswer}
              onChange={(e) => {
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
              <Star key={`a-${i}`} size={16} fill={themeColor} color={themeColor} />
            ))}
            <div style={{ width: '100%', height: '1px', margin: '0.2rem 0' }} />
            {Array.from({ length: problem.b }).map((_, i) => (
              <Star key={`b-${i}`} size={16} fill="#2196f3" color="#2196f3" />
            ))}
          </VisualAid>

          <Keypad>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
              <Key key={n} onClick={() => setUserAnswer(prev => prev + n)} tabIndex={-1} data-testid={`key-${n}`}>
                {n}
              </Key>
            ))}
            <Key 
              style={{ gridColumn: 'span 2', background: '#e94560' }} 
              onClick={() => setUserAnswer('')}
              tabIndex={-1}
              data-testid="key-clear"
            >
              Clear
            </Key>
            <Key 
              style={{ gridColumn: 'span 3', background: '#4caf50' }} 
              onClick={handleSubmit}
              tabIndex={-1}
              data-testid="key-go"
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
              data-testid="feedback"
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
