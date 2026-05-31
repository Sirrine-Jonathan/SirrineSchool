import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Music } from 'lucide-react';
import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;

  @media (min-width: 768px) {
    padding: 2rem;
    overflow: hidden;
  }
`;

const TargetBox = styled.div`
  background: #2c3e50;
  padding: 2rem;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border: 4px solid #2196f3;
  box-shadow: 0 5px 0 #1976d2;
  cursor: pointer;
  transition: transform 0.1s;
  width: 100%;
  max-width: 400px;

  @media (min-width: 768px) {
    padding: 3rem;
    border-radius: 30px;
    margin-bottom: 3rem;
    box-shadow: 0 10px 0 #1976d2;
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #1976d2;
  }

  h2 {
    font-size: 1.5rem;
    margin: 0;
    opacity: 0.8;
  }

  h1 {
    font-size: 3.5rem;
    margin: 0;
    letter-spacing: 4px;
    color: #fff;

    @media (min-width: 768px) {
      font-size: 5rem;
    }
  }
`;

const WordGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  max-width: 400px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 768px) {
    gap: 2rem;
    max-width: 800px;
  }
`;

const WordButton = styled.button<{ $active?: boolean }>`
  font-size: 1.4rem;
  padding: 1.2rem;
  background: ${props => props.$active ? '#2196f3' : '#34495e'};
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 4px 0 #1976d2' : '0 4px 0 #1a252f'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 80px;

  @media (min-width: 768px) {
    font-size: 2.2rem;
    padding: 2rem;
    border-radius: 20px;
    box-shadow: ${props => props.$active ? '0 8px 0 #1976d2' : '0 8px 0 #1a252f'};
    min-height: 140px;
  }

  &:hover {
    background: #3d566e;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #1a252f;
  }
`;

const Shortcut = styled.span`
  font-size: 0.8rem;
  opacity: 0.6;
  display: none;

  @media (min-width: 768px) {
    display: block;
    margin-top: 0.5rem;
  }
`;

const Feedback = styled(motion.div)`
  margin-top: 1.5rem;
  font-size: 1.8rem;
  font-weight: bold;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.2);

  @media (min-width: 768px) {
    margin-top: 2rem;
    font-size: 3rem;
  }
`;

const RHYME_GROUPS = [
  ['CAT', 'HAT', 'BAT', 'RAT', 'MAT', 'SAT'],
  ['DOG', 'LOG', 'FROG', 'HOG', 'JOG'],
  ['SUN', 'RUN', 'BUN', 'FUN', 'GUN'],
  ['CAR', 'STAR', 'FAR', 'JAR', 'BAR'],
  ['BEE', 'TREE', 'KNEE', 'FREE', 'SEE'],
  ['HOUSE', 'MOUSE'],
  ['BOAT', 'COAT', 'GOAT', 'FLOAT'],
  ['CAKE', 'LAKE', 'SNAKE', 'BAKE'],
  ['FISH', 'DISH', 'WISH'],
  ['MOON', 'SPOON', 'SOON'],
  ['BALL', 'TALL', 'WALL', 'FALL'],
  ['DUCK', 'TRUCK', 'LUCK'],
  ['KITE', 'WHITE', 'NIGHT', 'BITE']
];

const ALL_WORDS = RHYME_GROUPS.flat();

const RhymeTime: React.FC = () => {
  const [target, setTarget] = useState('');
  const [rhymingWord, setRhymingWord] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [score, setScore] = useState(0);
  const { addXP, currentUser, recordGameWin } = useUser();

  const speak = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  const generateProblem = useCallback(() => {
    // 1. Pick a rhyme group
    const groupIndex = Math.floor(Math.random() * RHYME_GROUPS.length);
    const group = RHYME_GROUPS[groupIndex];
    
    // 2. Pick target and rhyming word from the group
    const shuffledGroup = [...group].sort(() => 0.5 - Math.random());
    const newTarget = shuffledGroup[0];
    const newRhymingWord = shuffledGroup[1];
    
    setTarget(newTarget);
    setRhymingWord(newRhymingWord);
    
    // 3. Pick two distractors that don't rhyme with the target
    const distractors: string[] = [];
    while (distractors.length < 2) {
      const word = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
      if (!group.includes(word) && !distractors.includes(word)) {
        distractors.push(word);
      }
    }
    
    // 4. Shuffle options
    const choices = [newRhymingWord, ...distractors].sort(() => 0.5 - Math.random());
    setOptions(choices);
    setFeedback(null);
    setSelectedIndex(0);
    
    speak(`What rhymes with ${newTarget}?`);
  }, [speak]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const handleChoice = (word: string) => {
    if (feedback) return;

    if (word === rhymingWord) {
      setFeedback('PERFECT RHYME! 🎵');
      speak(`${word} rhymes with ${target}!`);
      const newScore = score + 1;
      setScore(newScore);
      if (currentUser) {
        addXP(currentUser, 20);
        if (newScore >= 5) {
          recordGameWin(currentUser, 'rhyme');
        }
      }
      setTimeout(generateProblem, 2500);
    } else {
      setFeedback('Try again! 🔄');
      speak(`Try again. ${word} doesn't rhyme with ${target}`);
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback) return;

      if (e.key === '1') handleChoice(options[0]);
      else if (e.key === '2') handleChoice(options[1]);
      else if (e.key === '3') handleChoice(options[2]);
      else if (e.key === 'ArrowRight') setSelectedIndex(prev => (prev + 1) % 3);
      else if (e.key === 'ArrowLeft') setSelectedIndex(prev => (prev - 1 + 3) % 3);
      else if (e.key === 'Enter') handleChoice(options[selectedIndex]);
      else if (e.key === ' ') speak(`What rhymes with ${target}?`);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, selectedIndex, feedback, target, speak, rhymingWord]);

  return (
    <GameContainer title="Rhyme Time">
      <GameArea>
        <TargetBox onClick={() => speak(`What rhymes with ${target}?`)}>
          <Music size={40} color="#2196f3" style={{ marginBottom: '0.5rem' }} />
          <h2>What rhymes with...</h2>
          <h1>{target}</h1>
          <Volume2 size={32} color="#2196f3" />
        </TargetBox>

        <WordGrid>
          {options.map((word, index) => (
            <WordButton 
              key={word} 
              $active={selectedIndex === index}
              onClick={() => handleChoice(word)}
              onMouseEnter={() => setSelectedIndex(index)}
              data-word={word}
              data-correct={word === rhymingWord}
            >
              {word}
              <Shortcut>({index + 1})</Shortcut>
            </WordButton>
          ))}
        </WordGrid>

        <AnimatePresence>
          {feedback && (
            <Feedback
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              style={{ color: feedback.includes('!') ? '#4caf50' : '#f44336' }}
            >
              {feedback}
            </Feedback>
          )}
        </AnimatePresence>
      </GameArea>
    </GameContainer>
  );
};

export default RhymeTime;