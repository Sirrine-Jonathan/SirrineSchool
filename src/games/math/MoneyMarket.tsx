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
  padding: 1rem;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const ProgressHeader = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ProgressText = styled.span`
  font-weight: bold;
  color: #ffd700;
  font-size: 1.2rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
`;

const DisplayCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 500px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const ItemDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const ItemEmoji = styled.div`
  font-size: 4rem;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));

  @media (min-width: 768px) {
    font-size: 6rem;
  }
`;

const ItemName = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  color: #fff;
`;

const PriceTag = styled.div`
  background: #4caf50;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-size: 2rem;
  font-weight: bold;
  box-shadow: 0 4px 0 #388e3c;
  display: flex;
  align-items: center;
  gap: 0.2rem;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const TotalDisplay = styled.div<{ $matching: boolean }>`
  background: rgba(0, 0, 0, 0.3);
  width: 100%;
  padding: 1rem;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  border: 2px solid ${props => props.$matching ? '#4caf50' : 'rgba(255, 255, 255, 0.1)'};
  transition: border-color 0.3s;
`;

const TotalLabel = styled.span`
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);
`;

const TotalValue = styled.span`
  font-size: 2.5rem;
  font-weight: bold;
  color: #ffd700;
`;

const Wallet = styled.div`
  width: 100%;
  max-width: 600px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(7, 1fr);
    gap: 0.8rem;
  }
`;

const MoneyButton = styled(motion.button)<{ $type: 'bill' | 'coin', $color: string }>`
  background: ${props => props.$color};
  border: none;
  border-radius: ${props => props.$type === 'bill' ? '8px' : '50%'};
  aspect-ratio: ${props => props.$type === 'bill' ? '1.6 / 1' : '1 / 1'};
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2);
  padding: 0.2rem;

  @media (min-width: 768px) {
    font-size: 1rem;
  }

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  width: 100%;
  max-width: 500px;
  margin-top: 1rem;
`;

const ActionButton = styled(motion.button)<{ $variant: 'clear' | 'pay' }>`
  background: ${props => props.$variant === 'clear' ? '#e94560' : '#4caf50'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.8rem;
  font-size: 1.2rem;
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
  const { addXP, currentUser } = useUser();

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
          <div style={{ display: 'flex', gap: '5px' }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <Star 
                key={i} 
                size={20} 
                fill={i < stepsCompleted ? '#ffd700' : 'transparent'} 
                color={i < stepsCompleted ? '#ffd700' : 'rgba(255,255,255,0.3)'}
              />
            ))}
          </div>
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
          <MoneyButton $type="bill" $color="#2e7d32" onClick={() => addMoney(1000)} whileTap={{ scale: 0.9 }}>
            $10
          </MoneyButton>
          <MoneyButton $type="bill" $color="#388e3c" onClick={() => addMoney(500)} whileTap={{ scale: 0.9 }}>
            $5
          </MoneyButton>
          <MoneyButton $type="bill" $color="#43a047" onClick={() => addMoney(100)} whileTap={{ scale: 0.9 }}>
            $1
          </MoneyButton>
          <MoneyButton $type="coin" $color="#9e9e9e" onClick={() => addMoney(25)} whileTap={{ scale: 0.9 }}>
            25¢
          </MoneyButton>
          <MoneyButton $type="coin" $color="#bdbdbd" onClick={() => addMoney(10)} whileTap={{ scale: 0.9 }}>
            10¢
          </MoneyButton>
          <MoneyButton $type="coin" $color="#90a4ae" onClick={() => addMoney(5)} whileTap={{ scale: 0.9 }}>
            5¢
          </MoneyButton>
          <MoneyButton $type="coin" $color="#a1887f" onClick={() => addMoney(1)} whileTap={{ scale: 0.9 }}>
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
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 2, opacity: 0 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                x: '-50%',
                y: '-50%',
                fontSize: '10rem',
                zIndex: 200,
                filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))',
                pointerEvents: 'none'
              }}
            >
              🏆
            </motion.div>
          )}
        </AnimatePresence>
      </GameArea>
    </GameContainer>
  );
};

export default MoneyMarket;
