import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Award } from 'lucide-react';
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
  overflow: hidden;
`;

const PatternContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);

  @media (min-width: 768px) {
    gap: 1.5rem;
    padding: 2rem;
  }
`;

const ItemBox = styled(motion.div)<{ $active?: boolean; $isTarget?: boolean }>`
  width: 60px;
  height: 60px;
  background: ${props => props.$isTarget ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'};
  border: 3px solid ${props => props.$isTarget ? '#ffd700' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  position: relative;

  @media (min-width: 768px) {
    width: 100px;
    height: 100px;
    font-size: 4rem;
    border-radius: 20px;
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
`;

const OptionButton = styled(motion.button)`
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.15);
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  cursor: pointer;
  color: white;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
    border-color: #646cff;
  }

  &:active {
    transform: scale(0.95);
  }

  @media (min-width: 768px) {
    width: 110px;
    height: 110px;
    font-size: 4.5rem;
    border-radius: 20px;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 400px;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  margin-bottom: 2rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProgressFill = styled(motion.div)<{ $color: string }>`
  height: 100%;
  background: ${props => props.$color};
`;

const Feedback = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-weight: bold;
  pointer-events: none;
  z-index: 100;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);

  @media (min-width: 768px) {
    font-size: 6rem;
  }
`;

const TrophyOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 2rem;
  text-align: center;
`;

const PATTERN_TYPES = [
  'ABAB',
  'AABB',
  'ABCABC',
  'ABBABB',
];

const EMOJIS = ['🍎', '🍌', '🍒', '🍇', '🍉', '🍓', '🥑', '🍍', '🥕', '🥦', '🍦', '🍕', '🚀', '🛸', '⭐', '🌈'];

const PatternPop: React.FC = () => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showTrophy, setShowTrophy] = useState(false);
  const { addXP, currentUser, users } = useUser();

  const TOTAL_LEVELS = 10;
  const user = currentUser ? users[currentUser] : null;
  const themeColor = user?.theme === 'space_princess' ? '#e94560' : '#4caf50';

  const generatePattern = useCallback(() => {
    const type = PATTERN_TYPES[Math.floor(Math.random() * PATTERN_TYPES.length)];
    const availableEmojis = [...EMOJIS].sort(() => Math.random() - 0.5);
    const A = availableEmojis[0];
    const B = availableEmojis[1];
    const C = availableEmojis[2];

    let fullSeq: string[] = [];
    let target: string = '';

    if (type === 'ABAB') {
      fullSeq = [A, B, A, B];
      target = B;
    } else if (type === 'AABB') {
      fullSeq = [A, A, B, B];
      target = B;
    } else if (type === 'ABCABC') {
      fullSeq = [A, B, C, A, B, C];
      target = C;
    } else if (type === 'ABBABB') {
      fullSeq = [A, B, B, A, B, B];
      target = B;
    }

    const seqWithoutLast = [...fullSeq];
    seqWithoutLast[seqWithoutLast.length - 1] = '?';

    // Generate options
    const otherEmojis = availableEmojis.slice(3, 6);
    const finalOptions = [target, ...otherEmojis].sort(() => Math.random() - 0.5);

    setSequence(seqWithoutLast);
    setCorrectAnswer(target);
    setOptions(finalOptions);
    setFeedback(null);
  }, []);

  useEffect(() => {
    generatePattern();
  }, [generatePattern]);

  const handleOptionClick = (option: string) => {
    if (feedback || showTrophy) return;

    if (option === correctAnswer) {
      setFeedback('PERFECT! 🌟');
      setSequence(prev => {
        const next = [...prev];
        next[next.length - 1] = option;
        return next;
      });
      
      const newScore = score + 1;
      if (newScore >= TOTAL_LEVELS) {
        setShowTrophy(true);
      } else {
        setScore(newScore);
      }

      if (currentUser) addXP(currentUser, 20);
      setTimeout(generatePattern, 1500);
    } else {
      setFeedback('OOPS! Try Again 🌈');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setShowTrophy(false);
    generatePattern();
  };

  return (
    <GameContainer title="Pattern Pop">
      <GameArea>
        <ProgressBar>
          <ProgressFill 
            $color={themeColor}
            initial={{ width: 0 }}
            animate={{ width: `${(score / TOTAL_LEVELS) * 100}%` }}
          />
        </ProgressBar>

        <PatternContainer>
          {sequence.map((emoji, index) => (
            <ItemBox
              key={index}
              $isTarget={emoji === '?'}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              data-testid={`pattern-item-${index}`}
            >
              {emoji === '?' ? (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ?
                </motion.span>
              ) : emoji}
            </ItemBox>
          ))}
        </PatternContainer>

        <OptionsGrid>
          {options.map((option, index) => (
            <OptionButton
              key={index}
              onClick={() => handleOptionClick(option)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              data-testid={`option-${index}`}
            >
              {option}
            </OptionButton>
          ))}
        </OptionsGrid>

        <AnimatePresence>
          {feedback && (
            <Feedback
              initial={{ scale: 0, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{ color: feedback.includes('PERFECT') ? '#4caf50' : '#f44336' }}
              data-testid="feedback"
            >
              {feedback}
            </Feedback>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTrophy && (
            <TrophyOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-testid="trophy-overlay"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                <Award size={120} color="#ffd700" />
              </motion.div>
              <h1 style={{ fontSize: '3rem', margin: '1rem 0' }}>Pattern Master!</h1>
              <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>You finished all the patterns!</p>
              <OptionButton 
                style={{ width: 'auto', padding: '0 2rem', fontSize: '1.5rem', height: '60px' }}
                onClick={handleRestart}
              >
                Play Again!
              </OptionButton>
            </TrophyOverlay>
          )}
        </AnimatePresence>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: 0.6 }}>
          <Star size={20} fill="#ffd700" color="#ffd700" />
          <span>Complete 10 patterns to win!</span>
        </div>
      </GameArea>
    </GameContainer>
  );
};

export default PatternPop;
