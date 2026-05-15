import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Plus, Minus } from 'lucide-react';
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
  gap: 2rem;
`;

const TargetDisplay = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem 3rem;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  text-align: center;

  h3 {
    margin: 0;
    font-size: 1.2rem;
    opacity: 0.8;
  }

  .time {
    font-size: 3.5rem;
    font-weight: bold;
    font-family: 'Courier New', Courier, monospace;
    color: #4caf50;
    text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
  }
`;

const ClockFace = styled.div`
  position: relative;
  width: 280px;
  height: 280px;
  background: white;
  border-radius: 50%;
  border: 10px solid #333;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3), inset 0 0 15px rgba(0,0,0,0.1);

  @media (min-width: 768px) {
    width: 350px;
    height: 350px;
  }
`;

const ClockNumber = styled.div<{ $angle: number }>`
  position: absolute;
  width: 100%;
  height: 100%;
  text-align: center;
  transform: rotate(${props => props.$angle}deg);
  padding: 10px;
  color: #333;
  font-weight: bold;
  font-size: 1.5rem;

  span {
    display: inline-block;
    transform: rotate(${props => -props.$angle}deg);
  }
`;

const ClockHand = styled(motion.div)<{ $width: number, $height: number, $color: string }>`
  position: absolute;
  bottom: 50%;
  left: 50%;
  width: ${props => props.$width}px;
  height: ${props => props.$height}px;
  background: ${props => props.$color};
  transform-origin: bottom center;
  border-radius: 10px;
  transform: translateX(-50%);
`;

const CenterDot = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 15px;
  height: 15px;
  background: #333;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
`;

const Controls = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 400px;
`;

const ControlButton = styled.button<{ $color: string }>`
  background: ${props => props.$color};
  color: white;
  border: none;
  border-radius: 15px;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 0 rgba(0,0,0,0.2);

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(2px);
    box-shadow: none;
  }
`;

const SubmitButton = styled(ControlButton)`
  grid-column: span 2;
  margin-top: 1rem;
  background: #646cff;
  font-size: 1.5rem;
  padding: 1.2rem;
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

const ClockQuest: React.FC = () => {
  const [targetTime, setTargetTime] = useState({ hour: 3, minute: 0 });
  const [currentTime, setCurrentTime] = useState({ hour: 12, minute: 0 });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const { addXP, currentUser } = useUser();

  const generateTargetTime = () => {
    const hour = Math.floor(Math.random() * 12) + 1;
    const isHalfHour = Math.random() > 0.5;
    const minute = isHalfHour ? 30 : 0;
    setTargetTime({ hour, minute });
    setFeedback(null);
  };

  useEffect(() => {
    generateTargetTime();
  }, []);

  const adjustTime = (h: number, m: number) => {
    setCurrentTime(prev => {
      let newM = prev.minute + m;
      let newH = prev.hour + h;

      if (newM >= 60) {
        newM -= 60;
        newH += 1;
      } else if (newM < 0) {
        newM += 60;
        newH -= 1;
      }

      if (newH > 12) newH -= 12;
      if (newH <= 0) newH += 12;

      return { hour: newH, minute: newM };
    });
  };

  const handleSubmit = () => {
    if (currentTime.hour === targetTime.hour && currentTime.minute === targetTime.minute) {
      setFeedback('PERFECT! ⭐');
      setScore(prev => prev + 1);
      if (currentUser) addXP(currentUser, 20);
      setTimeout(() => {
        generateTargetTime();
      }, 2000);
    } else {
      setFeedback('Keep trying! 🌈');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const minuteAngle = currentTime.minute * 6;
  const hourAngle = (currentTime.hour % 12) * 30 + (currentTime.minute / 60) * 30;

  const formatTime = (h: number, m: number) => {
    return `${h}:${m === 0 ? '00' : m}`;
  };

  return (
    <GameContainer title="Clock Quest">
      <GameArea>
        <TargetDisplay>
          <h3>Set the clock to:</h3>
          <div className="time" data-testid="target-time">{formatTime(targetTime.hour, targetTime.minute)}</div>
        </TargetDisplay>

        <ClockFace>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
            <ClockNumber key={n} $angle={n * 30}>
              <span>{n}</span>
            </ClockNumber>
          ))}
          
          <ClockHand 
            $width={8} 
            $height={100} 
            $color="#333" 
            animate={{ rotate: hourAngle }}
            transition={{ type: 'spring', stiffness: 50 }}
            data-testid="hour-hand"
          />
          <ClockHand 
            $width={4} 
            $height={140} 
            $color="#e91e63" 
            animate={{ rotate: minuteAngle }}
            transition={{ type: 'spring', stiffness: 50 }}
            data-testid="minute-hand"
          />
          <CenterDot />
        </ClockFace>

        <Controls>
          <ControlButton $color="#f39c12" onClick={() => adjustTime(1, 0)} data-testid="add-hour">
            <Plus size={20} /> 1 Hour
          </ControlButton>
          <ControlButton $color="#e91e63" onClick={() => adjustTime(0, 30)} data-testid="add-minute">
            <Plus size={20} /> 30 Min
          </ControlButton>
          <ControlButton $color="#f39c12" onClick={() => adjustTime(-1, 0)} data-testid="sub-hour">
            <Minus size={20} /> 1 Hour
          </ControlButton>
          <ControlButton $color="#e91e63" onClick={() => adjustTime(0, -30)} data-testid="sub-minute">
            <Minus size={20} /> 30 Min
          </ControlButton>
          
          <SubmitButton $color="#646cff" onClick={handleSubmit} data-testid="submit-answer">
            CHECK! <CheckCircle size={24} style={{ marginLeft: '10px' }} />
          </SubmitButton>
        </Controls>

        <AnimatePresence>
          {feedback && (
            <Feedback
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              data-testid="feedback"
            >
              {feedback}
            </Feedback>
          )}
        </AnimatePresence>

        <div style={{ position: 'absolute', top: '70px', right: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
          Score: {score}
        </div>
      </GameArea>
    </GameContainer>
  );
};

export default ClockQuest;
