import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CheckCircle, Star } from 'lucide-react';
import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  height: 100%;
  width: 100%;
  overflow: hidden;

  @media (min-width: 600px) {
    padding: 1rem;
  }
`;

const ProgressHeader = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (min-width: 600px) {
    padding: 0.5rem 1.5rem;
    border-radius: 20px;
    margin-bottom: 1rem;
  }
`;

const ProgressText = styled.span`
  font-weight: bold;
  color: #ffd700;
  font-size: 0.9rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);

  @media (min-width: 600px) {
    font-size: 1.2rem;
  }
`;

const StarsContainer = styled.div`
  display: flex;
  gap: 3px;

  svg {
    width: 12px;
    height: 12px;
  }

  @media (min-width: 480px) {
    gap: 4px;
    svg {
      width: 16px;
      height: 16px;
    }
  }

  @media (min-width: 768px) {
    gap: 5px;
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const DisplayCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  max-width: 500px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  @media (min-width: 600px) {
    flex-direction: column;
    padding: 2rem;
    gap: 1.5rem;
  }
`;

const ItemDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const ItemEmoji = styled.div`
  font-size: 3rem;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));

  @media (min-width: 600px) {
    font-size: 4rem;
  }

  @media (min-width: 768px) {
    font-size: 6rem;
  }
`;

const ItemName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #fff;
  text-align: center;

  @media (min-width: 600px) {
    font-size: 1.5rem;
  }
`;

const PriceTag = styled.div`
  background: #4caf50;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  font-size: 1.4rem;
  font-weight: bold;
  box-shadow: 0 4px 0 #388e3c;
  display: flex;
  align-items: center;
  gap: 0.2rem;

  @media (min-width: 600px) {
    font-size: 2rem;
    padding: 0.5rem 1.5rem;
  }

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const TotalDisplay = styled.div<{ $matching: boolean }>`
  background: rgba(0, 0, 0, 0.3);
  width: 100%;
  padding: 0.75rem;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  border: 2px solid ${props => props.$matching ? '#4caf50' : 'rgba(255, 255, 255, 0.1)'};
  box-shadow: ${props => props.$matching ? '0 0 15px rgba(76, 175, 80, 0.4)' : 'none'};
  transition: border-color 0.3s, box-shadow 0.3s;
  flex: 1;

  @media (min-width: 600px) {
    padding: 1rem;
  }
`;

const TotalLabel = styled.span`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);

  @media (min-width: 600px) {
    font-size: 0.9rem;
  }
`;

const TotalValue = styled.span`
  font-size: 1.8rem;
  font-weight: bold;
  color: #ffd700;

  @media (min-width: 600px) {
    font-size: 2.5rem;
  }
`;

const Wallet = styled.div`
  width: 100%;
  max-width: 600px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.4rem;
  margin-top: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.6rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  /* Mobile rows: bills on row 1, coins on row 2 */
  grid-template-rows: auto auto;

  & > [data-type="bill"] {
    grid-column: span 4;
  }

  & > [data-type="coin"] {
    grid-column: span 3;
  }

  @media (min-width: 600px) {
    gap: 0.6rem;
    padding: 0.8rem;
    margin-top: 0.75rem;
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: auto;
    gap: 0.8rem;

    & > [data-type="bill"] {
      grid-column: auto;
    }

    & > [data-type="coin"] {
      grid-column: auto;
    }
  }
`;

const MoneyButton = styled(motion.button)<{ $type: 'bill' | 'coin', $color: string, $value: number }>`
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.2);
  width: 100%;
  
  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
  }

  ${props => props.$type === 'bill' ? `
    aspect-ratio: 1.6 / 1;
    font-size: 0.9rem;
    border-radius: 6px;
    background: linear-gradient(135deg, #1b5e20, #2e7d32);
    border: 2px solid #81c784;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    
    &::before {
      content: '';
      position: absolute;
      top: 3px;
      bottom: 3px;
      left: 3px;
      right: 3px;
      border: 1px dashed rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      pointer-events: none;
    }
    
    &::after {
      content: '$';
      position: absolute;
      font-size: 1.8rem;
      color: rgba(255, 255, 255, 0.08);
      font-weight: 900;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
  ` : `
    aspect-ratio: 1 / 1;
    font-size: 0.8rem;
    border-radius: 50%;
    text-shadow: 0 1px 1px rgba(0,0,0,0.3);
    justify-self: center;
    border: 2px solid rgba(255,255,255,0.2);
    
    &::before {
      content: '';
      position: absolute;
      top: 2px;
      bottom: 2px;
      left: 2px;
      right: 2px;
      border: 1.5px dashed rgba(255, 255, 255, 0.25);
      border-radius: 50%;
      pointer-events: none;
    }

    ${props.$value === 25 ? `
      background: linear-gradient(135deg, #e2e8f0, #94a3b8);
      color: #1e293b;
      border-color: #f1f5f9;
      max-width: 50px;
    ` : props.$value === 10 ? `
      background: linear-gradient(135deg, #cbd5e1, #64748b);
      color: #0f172a;
      border-color: #e2e8f0;
      max-width: 38px;
    ` : props.$value === 5 ? `
      background: linear-gradient(135deg, #e2e8f0, #94a3b8);
      color: #1e293b;
      border-color: #f1f5f9;
      max-width: 44px;
    ` : `
      background: linear-gradient(135deg, #f97316, #b45309);
      color: #ffffff;
      border-color: #fed7aa;
      max-width: 42px;
    `}
  `}

  @media (min-width: 600px) {
    ${props => props.$type === 'bill' ? `
      font-size: 1.1rem;
      border-radius: 8px;
      &::before {
        top: 4px;
        bottom: 4px;
        left: 4px;
        right: 4px;
      }
    ` : `
      font-size: 0.9rem;
      ${props.$value === 25 ? 'max-width: 65px;' : ''}
      ${props.$value === 10 ? 'max-width: 50px;' : ''}
      ${props.$value === 5 ? 'max-width: 58px;' : ''}
      ${props.$value === 1 ? 'max-width: 55px;' : ''}
    `}
  }

  @media (min-width: 768px) {
    ${props => props.$type === 'bill' ? `
      font-size: 1.2rem;
    ` : `
      font-size: 1rem;
      ${props.$value === 25 ? 'max-width: 75px;' : ''}
      ${props.$value === 10 ? 'max-width: 58px;' : ''}
      ${props.$value === 5 ? 'max-width: 68px;' : ''}
      ${props.$value === 1 ? 'max-width: 64px;' : ''}
    `}
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 0.75rem;
  width: 100%;
  max-width: 500px;
  margin-top: 0.5rem;

  @media (min-width: 600px) {
    gap: 1rem;
    margin-top: 1rem;
  }
`;

const ActionButton = styled(motion.button)<{ $variant: 'clear' | 'pay' }>`
  background: ${props => props.$variant === 'clear' ? '#e94560' : '#4caf50'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.6rem;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 0 ${props => props.$variant === 'clear' ? '#c62828' : '#388e3c'};

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 ${props => props.$variant === 'clear' ? '#c62828' : '#388e3c'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (min-width: 600px) {
    padding: 0.8rem;
    font-size: 1.2rem;
  }
`;

const Feedback = styled(motion.div)`
  position: absolute;
  top: 40%;
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
  text-align: center;

  @media (min-width: 768px) {
    font-size: 5rem;
  }
`;

const TrophyWrapper = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 6rem;
  z-index: 200;
  filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.8));
  pointer-events: none;

  @media (min-width: 600px) {
    font-size: 8rem;
  }

  @media (min-width: 768px) {
    font-size: 10rem;
  }
`;

const ITEMS = [
  { name: 'Apple', emoji: '🍎', price: 75 },
  { name: 'Ice Cream', emoji: '🍦', price: 250 },
  { name: 'Teddy Bear', emoji: '🧸', price: 899 },
  { name: 'Book', emoji: '📖', price: 525 },
  { name: 'Milk', emoji: '🥛', price: 340 },
  { name: 'Paint Set', emoji: '🎨', price: 720 },
  { name: 'Soccer Ball', emoji: '⚽', price: 950 },
  { name: 'Cookie', emoji: '🍪', price: 50 },
  { name: 'Hat', emoji: '👒', price: 630 },
  { name: 'Sunglasses', emoji: '🕶️', price: 415 },
];

const MoneyMarket: React.FC = () => {
  const [currentItem, setCurrentItem] = useState(ITEMS[0]);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [stepsCompleted, setStepsCompleted] = useState(0);
  const [showTrophy, setShowTrophy] = useState(false);
  const { addXP, currentUser, recordGameWin } = useUser();

  const TOTAL_STEPS = 10;

  const formatMoney = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const generateItem = () => {
    const nextIndex = Math.floor(Math.random() * ITEMS.length);
    setCurrentItem(ITEMS[nextIndex]);
    setCurrentTotal(0);
    setFeedback(null);
  };

  const addMoney = (amount: number) => {
    if (feedback) return;
    setCurrentTotal(prev => prev + amount);
  };

  const handleSubmit = () => {
    if (feedback) return;

    if (currentTotal === currentItem.price) {
      setFeedback('GREAT JOB! ⭐');
      if (currentUser) addXP(currentUser, 20);
      
      const newSteps = stepsCompleted + 1;
      if (newSteps >= TOTAL_STEPS) {
        setStepsCompleted(TOTAL_STEPS);
        setShowTrophy(true);
        if (currentUser) recordGameWin(currentUser, 'money-market');
        setTimeout(() => {
          setShowTrophy(false);
          setStepsCompleted(0);
          generateItem();
        }, 3000);
      } else {
        setStepsCompleted(newSteps);
        setTimeout(generateItem, 1500);
      }
    } else {
      setFeedback('Try again! 🌈');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  return (
    <GameContainer title="Money Market">
      <GameArea>
        <ProgressHeader>
          <ProgressText>Items Completed: {stepsCompleted} / {TOTAL_STEPS}</ProgressText>
          <StarsContainer>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <Star 
                key={i} 
                fill={i < stepsCompleted ? '#ffd700' : 'transparent'} 
                color={i < stepsCompleted ? '#ffd700' : 'rgba(255,255,255,0.3)'}
              />
            ))}
          </StarsContainer>
        </ProgressHeader>

        <DisplayCard
          key={currentItem.name}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <ItemDisplay>
            <ItemEmoji>{currentItem.emoji}</ItemEmoji>
            <ItemName>{currentItem.name}</ItemName>
            <PriceTag>
              {formatMoney(currentItem.price)}
            </PriceTag>
          </ItemDisplay>

          <TotalDisplay $matching={currentTotal === currentItem.price}>
            <TotalLabel>Your Wallet</TotalLabel>
            <TotalValue>{formatMoney(currentTotal)}</TotalValue>
          </TotalDisplay>
        </DisplayCard>

        <Wallet>
          <MoneyButton 
            $type="bill" 
            $value={1000} 
            $color="#2e7d32" 
            data-type="bill" 
            onClick={() => addMoney(1000)} 
            whileTap={{ scale: 0.9 }}
          >
            $10
          </MoneyButton>
          <MoneyButton 
            $type="bill" 
            $value={500} 
            $color="#388e3c" 
            data-type="bill" 
            onClick={() => addMoney(500)} 
            whileTap={{ scale: 0.9 }}
          >
            $5
          </MoneyButton>
          <MoneyButton 
            $type="bill" 
            $value={100} 
            $color="#43a047" 
            data-type="bill" 
            onClick={() => addMoney(100)} 
            whileTap={{ scale: 0.9 }}
          >
            $1
          </MoneyButton>
          <MoneyButton 
            $type="coin" 
            $value={25} 
            $color="#9e9e9e" 
            data-type="coin" 
            onClick={() => addMoney(25)} 
            whileTap={{ scale: 0.9 }}
          >
            25¢
          </MoneyButton>
          <MoneyButton 
            $type="coin" 
            $value={10} 
            $color="#bdbdbd" 
            data-type="coin" 
            onClick={() => addMoney(10)} 
            whileTap={{ scale: 0.9 }}
          >
            10¢
          </MoneyButton>
          <MoneyButton 
            $type="coin" 
            $value={5} 
            $color="#90a4ae" 
            data-type="coin" 
            onClick={() => addMoney(5)} 
            whileTap={{ scale: 0.9 }}
          >
            5¢
          </MoneyButton>
          <MoneyButton 
            $type="coin" 
            $value={1} 
            $color="#a1887f" 
            data-type="coin" 
            onClick={() => addMoney(1)} 
            whileTap={{ scale: 0.9 }}
          >
            1¢
          </MoneyButton>
        </Wallet>

        <Actions>
          <ActionButton $variant="clear" onClick={() => setCurrentTotal(0)} whileTap={{ scale: 0.95 }}>
            <Trash2 size={20} /> Clear
          </ActionButton>
          <ActionButton 
            $variant="pay" 
            onClick={handleSubmit} 
            disabled={currentTotal === 0}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle size={24} /> Pay
          </ActionButton>
        </Actions>

        <AnimatePresence>
          {feedback && (
            <Feedback
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{ color: feedback.includes('GREAT') ? '#4caf50' : '#f44336' }}
            >
              {feedback}
            </Feedback>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTrophy && (
            <TrophyWrapper
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 2, opacity: 0 }}
            >
              🏆
            </TrophyWrapper>
          )}
        </AnimatePresence>
      </GameArea>
    </GameContainer>
  );
};

export default MoneyMarket;
