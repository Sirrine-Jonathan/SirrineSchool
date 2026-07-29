import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';
import { useIsMobile } from '../../hooks/useIsMobile';

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  height: 100%;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
  gap: 0.5rem;

  @media (min-width: 768px) {
    padding: 1rem 2rem;
    gap: 1rem;
  }
`;

const InstructionsCard = styled.div<{ $themeColor: string }>`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 0.5rem 1rem;
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 48px;

  h3 {
    margin: 0;
    font-size: 0.95rem;
    color: #ffffff;
    span {
      color: ${props => props.$themeColor};
      font-weight: bold;
    }
  }

  @media (min-width: 768px) {
    padding: 0.75rem 1.5rem;
    h3 {
      font-size: 1.2rem;
    }
  }
`;

const ToggleButton = styled.button<{ $active: boolean, $themeColor: string }>`
  background: ${props => props.$active ? props.$themeColor : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$active ? '#000000' : '#ffffff'};
  border: none;
  border-radius: 20px;
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? props.$themeColor : 'rgba(255, 255, 255, 0.2)'};
  }

  @media (min-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
`;

const NumberLineArea = styled.div`
  width: 100%;
  max-width: 850px;
  height: 120px;
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 0.25rem;
  display: flex;
  align-items: flex-end;
  padding-bottom: 25px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    height: 160px;
    padding-bottom: 35px;
    margin-bottom: 0.5rem;
  }
`;

const SvgOverlay = styled.svg`
  position: absolute;
  top: 0;
  left: 5%;
  width: 90%;
  height: calc(100% - 25px);
  pointer-events: none;
  z-index: 2;

  @media (min-width: 768px) {
    height: calc(100% - 35px);
  }
`;

const LineContainer = styled.div`
  position: relative;
  width: 90%;
  margin: 0 auto;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
`;

const TickWrapper = styled.div<{ $left: number }>`
  position: absolute;
  left: ${props => props.$left}%;
  top: -6px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 3;
  width: 28px;
  height: 50px;

  @media (min-width: 768px) {
    top: -8px;
    width: 36px;
    height: 70px;
  }
`;

const TickMark = styled.div<{ $isActive: boolean, $isStart: boolean, $themeColor: string }>`
  width: 2px;
  height: 16px;
  background: ${props => 
    props.$isStart ? '#ffd700' : 
    props.$isActive ? props.$themeColor : 
    'rgba(255, 255, 255, 0.5)'
  };
  transition: all 0.2s ease;
  transform: scaleX(${props => (props.$isActive || props.$isStart) ? 2 : 1});

  @media (min-width: 768px) {
    height: 20px;
    width: 3px;
  }
`;

const TickLabel = styled.div<{ $isActive: boolean, $isStart: boolean, $themeColor: string }>`
  margin-top: 4px;
  font-size: 0.7rem;
  font-weight: ${props => (props.$isActive || props.$isStart) ? 'bold' : 'normal'};
  color: ${props => 
    props.$isStart ? '#ffd700' : 
    props.$isActive ? props.$themeColor : 
    'rgba(255, 255, 255, 0.6)'
  };
  transition: all 0.2s ease;
  user-select: none;

  @media (min-width: 768px) {
    margin-top: 6px;
    font-size: 0.9rem;
  }
`;

const RunnerContainer = styled(motion.div)`
  position: absolute;
  bottom: 21px; // Align just above the line
  z-index: 5;
  width: 40px;
  height: 40px;
  margin-left: -20px; // Center aligning
  display: flex;
  justify-content: center;
  align-items: center;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));

  @media (min-width: 768px) {
    bottom: 31px;
    width: 56px;
    height: 56px;
    margin-left: -28px;
  }
`;

const RunnerEmoji = styled.div`
  font-size: 1.8rem;
  line-height: 1;
  user-select: none;

  @media (min-width: 768px) {
    font-size: 2.8rem;
  }
`;

const FlagIcon = styled.div`
  position: absolute;
  bottom: 21px;
  margin-left: -10px;
  font-size: 1.1rem;
  z-index: 4;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));

  @media (min-width: 768px) {
    bottom: 31px;
    margin-left: -14px;
    font-size: 1.6rem;
  }
`;

const MainGrid = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 850px;
  gap: 0.5rem;
  flex: 1;
  min-height: 0;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1rem;
  }
`;

const ProblemCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex: 1;
  min-height: 0;

  @media (min-width: 768px) {
    padding: 1.5rem;
    gap: 1rem;
  }
`;

const EquationDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 1.8rem;
  font-weight: bold;
  width: 100%;

  @media (min-width: 768px) {
    gap: 0.8rem;
    font-size: 2.8rem;
  }
`;

const NumberBox = styled.div<{ $color: string }>`
  background: ${props => props.$color};
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: white;
  box-shadow: 0 3px 0 rgba(0,0,0,0.25);
  font-family: inherit;

  @media (min-width: 768px) {
    width: 70px;
    height: 70px;
    border-radius: 16px;
    box-shadow: 0 4px 0 rgba(0,0,0,0.25);
  }
`;

const OpBox = styled.div`
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  width: 24px;

  @media (min-width: 768px) {
    font-size: 2.2rem;
    width: 40px;
  }
`;

const AnswerInput = styled.input<{ $themeColor: string }>`
  width: 56px;
  font-size: 1.6rem;
  padding: 0.2rem;
  border-radius: 10px;
  border: 3px solid #646cff;
  background: #121212;
  color: white;
  text-align: center;
  font-weight: bold;
  height: 40px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    width: 90px;
    font-size: 2.4rem;
    padding: 0.4rem;
    border-radius: 16px;
    height: 70px;
  }

  &:focus {
    outline: none;
    border-color: ${props => props.$themeColor};
  }
`;

const KeypadPanel = styled.div`
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
  justify-content: center;

  @media (min-width: 768px) {
    width: 320px;
    padding: 0.8rem;
    gap: 0.6rem;
  }
`;

const QuickHopRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;

  @media (min-width: 768px) {
    gap: 0.6rem;
  }
`;

const KeypadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;

  @media (min-width: 768px) {
    gap: 0.6rem;
  }
`;

const Key = styled.button<{ $bgColor?: string }>`
  background: ${props => props.$bgColor || 'rgba(255, 255, 255, 0.12)'};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.4rem 0.2rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  user-select: none;
  box-shadow: 0 2px 0 rgba(0,0,0,0.2);

  @media (min-width: 768px) {
    border-radius: 12px;
    padding: 0.65rem 0.5rem;
    font-size: 1.25rem;
    min-height: 48px;
  }

  &:hover {
    background: ${props => props.$bgColor ? `${props.$bgColor}cc` : 'rgba(255, 255, 255, 0.2)'};
  }

  &:active {
    transform: translateY(2px);
    box-shadow: none;
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
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.9);
  font-size: 2.2rem;

  @media (min-width: 768px) {
    font-size: 4rem;
  }
`;

const StepsTracker = styled.div`
  display: flex;
  gap: 0.3rem;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: auto;
  padding-top: 0.4rem;

  @media (min-width: 768px) {
    gap: 0.5rem;
    padding-top: 0.8rem;
  }
`;

const StepDot = styled.div<{ $status: 'current' | 'done' | 'pending', $themeColor: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => 
    props.$status === 'done' ? '#4caf50' : 
    props.$status === 'current' ? props.$themeColor : 
    'rgba(255, 255, 255, 0.2)'
  };
  box-shadow: ${props => props.$status === 'current' ? `0 0 6px ${props.$themeColor}` : 'none'};
  transition: all 0.3s ease;

  @media (min-width: 768px) {
    width: 12px;
    height: 12px;
  }
`;

const NumberLineRunner: React.FC = () => {
  const { addXP, currentUser, users, recordGameWin } = useUser();
  const isMobile = useIsMobile();
  
  // Theme styling configurations
  const user = currentUser ? users[currentUser] : null;
  const isSpace = user?.theme === 'space_princess';
  const themeColor = isSpace ? '#e94560' : '#4caf50'; // Pink for space, green for skater/monster
  const secondaryColor = '#2196f3'; // Blue helper
  
  // Game states
  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+' as '+' | '-', answer: 0 });
  const [startNum, setStartNum] = useState(0);
  const [runnerPosition, setRunnerPosition] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [stepsCompleted, setStepsCompleted] = useState(0);
  const [showTrophy, setShowTrophy] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [jumpToggle, setJumpToggle] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const TOTAL_STEPS = 10;

  // Emojis based on themes
  const startEmoji = isSpace ? '🌍' : '🛹';
  const runnerEmoji = isSpace ? '🧑‍🚀' : '👾';
  
  // Generate a random addition/subtraction problem within 0-20
  const generateProblem = () => {
    const isSub = Math.random() > 0.5;
    let a = 0, b = 0, answer = 0;
    
    if (isSub) {
      // Subtraction: start between 5 and 20, subtract between 1 and a, keeping output >= 0
      a = Math.floor(Math.random() * 16) + 5; // 5 to 20
      b = Math.floor(Math.random() * Math.min(a, 8)) + 1; // 1 to min(a, 8)
      answer = a - b;
    } else {
      // Addition: start between 1 and 12, add between 1 and 8, keeping output <= 20
      a = Math.floor(Math.random() * 12) + 1; // 1 to 12
      b = Math.floor(Math.random() * 8) + 1; // 1 to 8
      answer = a + b;
    }

    setProblem({ a, b, op: isSub ? '-' : '+', answer });
    setStartNum(a);
    setRunnerPosition(a);
    setUserAnswer('');
    setFeedback(null);
    
    // Auto-focus input on mount/generation
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Initial load
  useEffect(() => {
    generateProblem();
    
    const keepFocus = () => inputRef.current?.focus();
    window.addEventListener('click', keepFocus);
    return () => window.removeEventListener('click', keepFocus);
  }, []);

  // Make runner jump whenever runnerPosition changes
  useEffect(() => {
    setJumpToggle(prev => !prev);
  }, [runnerPosition]);

  // Handle +1 / -1 jumps directly on number line
  const handleStepHop = (direction: 'forward' | 'backward') => {
    if (feedback) return;
    setRunnerPosition(prev => {
      const next = direction === 'forward' ? Math.min(prev + 1, 20) : Math.max(prev - 1, 0);
      setUserAnswer(next.toString());
      return next;
    });
  };

  // Handle clicking a number tick directly on the number line
  const handleTickClick = (num: number) => {
    if (feedback) return;
    setRunnerPosition(num);
    setUserAnswer(num.toString());
  };

  // Keypad key press
  const handleKeypadPress = (val: string) => {
    if (feedback) return;
    if (val === 'clear') {
      setUserAnswer('');
      setRunnerPosition(startNum); // Reset runner to start position
    } else {
      const currentAnswer = userAnswer + val;
      // Truncate to max 2 digits since max number is 20
      if (currentAnswer.length <= 2) {
        setUserAnswer(currentAnswer);
        const parsed = parseInt(currentAnswer, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 20) {
          setRunnerPosition(parsed);
        }
      }
    }
  };

  // Answer Submission
  const handleSubmit = () => {
    if (!userAnswer || feedback) return;

    if (showTrophy) setShowTrophy(false);

    const numericAnswer = parseInt(userAnswer, 10);
    
    if (numericAnswer === problem.answer) {
      setFeedback(isSpace ? 'STELLAR! 🚀' : 'RADICAL! 🛹');
      
      const nextSteps = stepsCompleted + 1;
      
      if (nextSteps >= TOTAL_STEPS) {
        setStepsCompleted(0);
        setShowTrophy(true);
        if (currentUser) recordGameWin(currentUser, 'number-line');
      } else {
        setStepsCompleted(nextSteps);
      }

      if (currentUser) addXP(currentUser, 15);
      setTimeout(generateProblem, 1500);
    } else {
      setFeedback('Oops, try again! 🐸');
      // Return runner back to start position
      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
        setRunnerPosition(startNum);
      }, 1500);
    }
  };

  // Generate SVG arches representing the count jumps (hints)
  const hopArches = useMemo(() => {
    if (!showHints) return null;
    const paths: React.ReactNode[] = [];
    const { a, b, op } = problem;

    // We draw b individual hops
    for (let i = 0; i < b; i++) {
      const fromVal = op === '+' ? a + i : a - i;
      const toVal = op === '+' ? a + i + 1 : a - i - 1;

      // Coordinate computations
      const x1 = (fromVal / 20) * 1000;
      const x2 = (toVal / 20) * 1000;
      const xMid = (x1 + x2) / 2;
      const yBase = 95;
      const yPeak = 45; // Height of arc

      paths.push(
        <path
          key={`hop-${i}`}
          d={`M ${x1} ${yBase} Q ${xMid} ${yPeak} ${x2} ${yBase}`}
          fill="none"
          stroke={op === '+' ? '#4caf50' : '#ff5722'}
          strokeWidth="3"
          strokeDasharray="5,5"
          markerEnd={op === '+' ? 'url(#arrow-add)' : 'url(#arrow-sub)'}
        />
      );
    }

    return paths;
  }, [problem, showHints]);

  // Framer-motion runner left positioning
  const leftPercent = 5 + (runnerPosition / 20) * 90;
  const startFlagLeftPercent = 5 + (startNum / 20) * 90;

  return (
    <GameContainer title="Number Line Runner">
      <GameArea>
        {/* Instructions */}
        <InstructionsCard $themeColor={themeColor}>
          <h3>
            Start at <span>{startNum}</span>, then jump {problem.op === '+' ? 'forward' : 'backward'} <span>{problem.b}</span> steps.
          </h3>
          <ToggleButton 
            $active={showHints} 
            $themeColor={themeColor} 
            onClick={() => setShowHints(!showHints)}
          >
            <HelpCircle size={16} />
            {showHints ? 'Hide Helpers' : 'Show Helpers'}
          </ToggleButton>
        </InstructionsCard>

        {/* The Number Line */}
        <NumberLineArea>
          {/* SVG Hops Overlay */}
          <SvgOverlay viewBox="0 0 1000 120" preserveAspectRatio="none">
            <defs>
              <marker id="arrow-add" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4caf50" />
              </marker>
              <marker id="arrow-sub" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff5722" />
              </marker>
            </defs>
            {hopArches}
          </SvgOverlay>

          {/* Line and Ticks */}
          <LineContainer>
            {/* Start Flag */}
            <FlagIcon style={{ left: `${startFlagLeftPercent}%` }}>
              {startEmoji}
            </FlagIcon>

            {/* Runner Sprite */}
            <RunnerContainer
              animate={{
                left: `${leftPercent}%`,
                y: jumpToggle ? [0, -35, 0] : [0, -35, 0],
                rotate: feedback?.includes('! ') ? [0, -15, 15, -15, 0] : 0,
                scale: feedback?.includes('! ') ? [1, 1.3, 0.9, 1] : 1
              }}
              transition={{
                left: { type: 'spring', stiffness: 90, damping: 12 },
                y: { duration: 0.35, ease: 'easeOut' },
                scale: { duration: 0.4 }
              }}
            >
              <RunnerEmoji>{runnerEmoji}</RunnerEmoji>
              {feedback?.includes('! ') && (
                <motion.span
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -25 }}
                  style={{ fontSize: '1rem', position: 'absolute', top: -12 }}
                >
                  ⭐
                </motion.span>
              )}
            </RunnerContainer>

            {/* The tick marks & click targets */}
            {Array.from({ length: 21 }, (_, i) => {
              const tickPosPercent = (i / 20) * 100;
              return (
                <TickWrapper 
                  key={i} 
                  $left={tickPosPercent}
                  onClick={() => handleTickClick(i)}
                  data-testid={`tick-${i}`}
                >
                  <TickMark 
                    $isActive={i === runnerPosition} 
                    $isStart={i === startNum}
                    $themeColor={themeColor}
                  />
                  <TickLabel 
                    $isActive={i === runnerPosition} 
                    $isStart={i === startNum}
                    $themeColor={themeColor}
                  >
                    {i}
                  </TickLabel>
                </TickWrapper>
              );
            })}
          </LineContainer>

          {/* Trophy Win Screen overlay */}
          <AnimatePresence>
            {showTrophy && (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.8, opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  x: '-50%',
                  y: '-50%',
                  fontSize: isMobile ? '5rem' : '7rem',
                  zIndex: 25,
                  filter: 'drop-shadow(0 0 25px rgba(255, 215, 0, 0.9))',
                  pointerEvents: 'none'
                }}
              >
                🏆
              </motion.div>
            )}
          </AnimatePresence>
        </NumberLineArea>

        {/* Problem Card + Input + Keypad */}
        <MainGrid>
          {/* Problem Display Card */}
          <ProblemCard
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <EquationDisplay>
              <NumberBox $color={themeColor} data-testid="num-a">
                {problem.a}
              </NumberBox>
              <OpBox data-testid="operator">
                {problem.op}
              </OpBox>
              <NumberBox $color={secondaryColor} data-testid="num-b">
                {problem.b}
              </NumberBox>
              <OpBox>=</OpBox>
              <AnswerInput
                ref={inputRef}
                type="text"
                inputMode="none" // Prevent virtual mobile keyboard
                data-testid="answer-input"
                $themeColor={themeColor}
                value={userAnswer}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setUserAnswer(val);
                  const parsed = parseInt(val, 10);
                  if (!isNaN(parsed) && parsed >= 0 && parsed <= 20) {
                    setRunnerPosition(parsed);
                  }
                }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="?"
                autoFocus
              />
            </EquationDisplay>
          </ProblemCard>

          {/* Keypad & Tactile Hopping */}
          <KeypadPanel>
            {/* Step-by-Step Tactile Hopping */}
            <QuickHopRow>
              <Key 
                $bgColor="#d84315" 
                onClick={() => handleStepHop('backward')}
                tabIndex={-1}
                data-testid="btn-hop-back"
              >
                -1 Hop
              </Key>
              <Key 
                $bgColor="#2e7d32" 
                onClick={() => handleStepHop('forward')}
                tabIndex={-1}
                data-testid="btn-hop-forward"
              >
                +1 Hop
              </Key>
            </QuickHopRow>

            {/* Numbers Keypad */}
            <KeypadGrid>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <Key 
                  key={n} 
                  onClick={() => handleKeypadPress(n.toString())}
                  tabIndex={-1}
                  data-testid={`key-${n}`}
                >
                  {n}
                </Key>
              ))}
              <Key 
                $bgColor="#c62828" 
                onClick={() => handleKeypadPress('clear')}
                tabIndex={-1}
                data-testid="key-clear"
              >
                Clear
              </Key>
              <Key 
                onClick={() => handleKeypadPress('0')}
                tabIndex={-1}
                data-testid="key-0"
              >
                0
              </Key>
              <Key 
                $bgColor={themeColor}
                style={{ color: '#000000' }}
                onClick={handleSubmit}
                tabIndex={-1}
                data-testid="key-go"
              >
                GO!
              </Key>
            </KeypadGrid>
          </KeypadPanel>
        </MainGrid>

        {/* Score & Step Progress Tracker */}
        <StepsTracker>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
            let status: 'current' | 'done' | 'pending' = 'pending';
            if (i < stepsCompleted) status = 'done';
            else if (i === stepsCompleted) status = 'current';
            return (
              <StepDot 
                key={i} 
                $status={status} 
                $themeColor={themeColor} 
              />
            );
          })}
        </StepsTracker>

        {/* Feedback Messages */}
        <AnimatePresence>
          {feedback && (
            <Feedback
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{ color: feedback.includes('! ') ? '#4caf50' : '#f44336' }}
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

export default NumberLineRunner;
