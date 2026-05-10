import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
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
  color: white;
`;

const ProgressSection = styled.div`
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)<{ $color: string }>`
  height: 100%;
  background: ${props => props.$color};
  box-shadow: 0 0 10px ${props => props.$color}80;
`;

const InstructionCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
`;

const TargetText = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  @media (min-width: 768px) { font-size: 2rem; }
`;

const FractionDisplay = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 2.5rem;
  font-weight: 800;
  display: inline-block;
  margin: 0 0.5rem;
  text-shadow: 0 0 15px ${props => props.$color}40;
`;

const PizzaStage = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-height: 400px;
`;

const PizzaSVG = styled.svg`
  width: 100%;
  height: 100%;
  max-width: 350px;
  max-height: 350px;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
`;

const Controls = styled.div`
  margin-top: 1.5rem;
  width: 100%;
  max-width: 300px;
`;

const GoButton = styled(motion.button)<{ $color: string }>`
  width: 100%;
  background: ${props => props.$color};
  color: white;
  border: none;
  border-radius: 16px;
  padding: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 0 rgba(0,0,0,0.2);

  &:hover { filter: brightness(1.1); }
  &:active { transform: translateY(2px); box-shadow: 0 2px 0 rgba(0,0,0,0.2); }
`;

const FeedbackOverlay = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  pointer-events: none;
  font-size: 3rem;
  font-weight: 900;
  text-align: center;
  text-shadow: 0 0 20px rgba(0,0,0,0.5);
  white-space: nowrap;

  @media (min-width: 768px) { font-size: 5rem; }
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
  border-radius: 24px;
`;

const Slice = ({ index, total, isSelected, onClick, color, toppingEmoji }: { 
  index: number; 
  total: number; 
  isSelected: boolean; 
  onClick: () => void; 
  color: string;
  toppingEmoji: string;
}) => {
  const angleStep = (2 * Math.PI) / total;
  const startAngle = index * angleStep - Math.PI / 2;
  const endAngle = (index + 1) * angleStep - Math.PI / 2;

  const R = 100;
  const CX = 120;
  const CY = 120;

  const x1 = CX + R * Math.cos(startAngle);
  const y1 = CY + R * Math.sin(startAngle);
  const x2 = CX + R * Math.cos(endAngle);
  const y2 = CY + R * Math.sin(endAngle);

  const largeArcFlag = angleStep > Math.PI ? 1 : 0;

  const d = `
    M ${CX} ${CY}
    L ${x1} ${y1}
    A ${R} ${R} 0 ${largeArcFlag} 1 ${x2} ${y2}
    Z
  `;

  // Topping position (center of the slice)
  const midAngle = startAngle + angleStep / 2;
  const TR = R * 0.6;
  const tx = CX + TR * Math.cos(midAngle);
  const ty = CY + TR * Math.sin(midAngle);

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <motion.path
        d={d}
        fill={isSelected ? color : 'rgba(244, 230, 186, 0.9)'}
        stroke="#d4a373"
        strokeWidth="3"
        initial={false}
        animate={{ 
          fill: isSelected ? color : 'rgba(244, 230, 186, 0.9)',
          scale: isSelected ? 1.02 : 1 
        }}
        whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
      />
      <AnimatePresence>
        {isSelected && (
          <motion.text
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            x={tx}
            y={ty}
            fontSize="20"
            textAnchor="middle"
            dominantBaseline="middle"
            pointerEvents="none"
          >
            {toppingEmoji}
          </motion.text>
        )}
      </AnimatePresence>
    </g>
  );
};

const FractionPizza: React.FC = () => {
  const { addXP, currentUser, users } = useUser();
  const [target, setTarget] = useState({ numerator: 1, denominator: 2 });
  const [selectedSlices, setSelectedSlices] = useState<Set<number>>(new Set());
  const [stepsCompleted, setStepsCompleted] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [showTrophy, setShowTrophy] = useState(false);

  const TOTAL_STEPS = 10;
  const user = currentUser ? users[currentUser] : null;
  const isSpace = user?.theme === 'space_princess';
  const themeColor = isSpace ? '#e94560' : '#f39c12';
  const toppingEmoji = isSpace ? '⭐' : '🍕';

  const generateProblem = useCallback(() => {
    const denominators = [2, 3, 4, 6, 8];
    const d = denominators[Math.floor(Math.random() * denominators.length)];
    const n = Math.floor(Math.random() * d) + 1;
    setTarget({ numerator: n, denominator: d });
    setSelectedSlices(new Set());
    setFeedback(null);
  }, []);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const toggleSlice = (index: number) => {
    if (feedback?.type === 'success') return;
    const newSelected = new Set(selectedSlices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSlices(newSelected);
  };

  const handleCheck = () => {
    if (feedback?.type === 'success') return;

    if (selectedSlices.size === target.numerator) {
      setFeedback({ text: 'DELICIOUS! 🍕✨', type: 'success' });
      
      if (currentUser) addXP(currentUser, 15);
      
      const newSteps = stepsCompleted + 1;
      if (newSteps >= TOTAL_STEPS) {
        setTimeout(() => setShowTrophy(true), 1000);
      } else {
        setStepsCompleted(newSteps);
        setTimeout(generateProblem, 1500);
      }
    } else {
      setFeedback({ text: 'Try again! 🌈', type: 'error' });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const resetGame = () => {
    setStepsCompleted(0);
    setShowTrophy(false);
    generateProblem();
  };

  return (
    <GameContainer title="Fraction Pizza">
      <GameArea>
        <ProgressSection>
          <ProgressBar>
            <ProgressFill 
              $color={themeColor}
              animate={{ width: `${(stepsCompleted / TOTAL_STEPS) * 100}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </ProgressBar>
          <span style={{ fontWeight: 'bold', minWidth: '40px' }}>{stepsCompleted}/{TOTAL_STEPS}</span>
        </ProgressSection>

        <InstructionCard
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <TargetText>
            Give the customer
            <FractionDisplay $color={themeColor}>
              {target.numerator}/{target.denominator}
            </FractionDisplay>
            of the pizza!
          </TargetText>
        </InstructionCard>

        <PizzaStage>
          <PizzaSVG viewBox="0 0 240 240">
            {/* Pizza Crust */}
            <circle cx="120" cy="120" r="110" fill="#d4a373" />
            {/* Sauce/Base */}
            <circle cx="120" cy="120" r="100" fill="#e9c46a" />
            
            {/* Slices */}
            {Array.from({ length: target.denominator }).map((_, i) => (
              <Slice
                key={`${target.denominator}-${i}`}
                index={i}
                total={target.denominator}
                isSelected={selectedSlices.has(i)}
                onClick={() => toggleSlice(i)}
                color={themeColor}
                toppingEmoji={toppingEmoji}
              />
            ))}
          </PizzaSVG>

          <AnimatePresence>
            {feedback && (
              <FeedbackOverlay
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{ color: feedback.type === 'success' ? '#4caf50' : '#ff5252' }}
              >
                {feedback.text}
              </FeedbackOverlay>
            )}
          </AnimatePresence>
        </PizzaStage>

        <Controls>
          <GoButton 
            $color={themeColor}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCheck}
          >
            GO! <Send size={24} />
          </GoButton>
        </Controls>

        <AnimatePresence>
          {showTrophy && (
            <TrophyOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12 }}
                style={{ fontSize: '10rem' }}
              >
                🏆
              </motion.div>
              <h1 style={{ fontSize: '3rem', margin: '1rem 0' }}>Chef Extraordinaire!</h1>
              <GoButton 
                $color={themeColor} 
                onClick={resetGame}
                style={{ width: 'auto', padding: '1rem 3rem' }}
              >
                Play Again!
              </GoButton>
            </TrophyOverlay>
          )}
        </AnimatePresence>
      </GameArea>
    </GameContainer>
  );
};

export default FractionPizza;
