import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Music, Fingerprint } from 'lucide-react';
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
  border: 4px solid #9c27b0;
  box-shadow: 0 5px 0 #7b1fa2;
  cursor: pointer;
  transition: transform 0.1s;
  width: 100%;
  max-width: 400px;

  @media (min-width: 768px) {
    padding: 3rem;
    border-radius: 30px;
    margin-bottom: 3rem;
    box-shadow: 0 10px 0 #7b1fa2;
  }

  &:active {
    transform: translateY(3px);
    box-shadow: 0 1px 0 #7b1fa2;
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

const SmashArea = styled.button`
  width: 100%;
  max-width: 600px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border: 4px dashed rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &:active {
    background: rgba(156, 39, 176, 0.2);
  }
`;

const SyllableDot = styled(motion.div)`
  width: 40px;
  height: 40px;
  background: #9c27b0;
  border-radius: 50%;
  box-shadow: 0 4px 0 #7b1fa2;

  @media (min-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button<{ $color: string }>`
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  background: ${props => props.$color};
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 0 rgba(0,0,0,0.2);

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 rgba(0,0,0,0.2);
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

const WORDS = [
  { word: 'CAT', syllables: 1 },
  { word: 'DOG', syllables: 1 },
  { word: 'SUN', syllables: 1 },
  { word: 'FISH', syllables: 1 },
  { word: 'APPLE', syllables: 2 },
  { word: 'TIGER', syllables: 2 },
  { word: 'PIZZA', syllables: 2 },
  { word: 'ROBOT', syllables: 2 },
  { word: 'BANANA', syllables: 3 },
  { word: 'COMPUTER', syllables: 3 },
  { word: 'DINOSAUR', syllables: 3 },
  { word: 'GALAXY', syllables: 3 },
  { word: 'HELICOPTER', syllables: 4 },
  { word: 'WATERMELON', syllables: 4 },
  { word: 'CATERPILLAR', syllables: 4 },
  { word: 'ELEVATOR', syllables: 4 }
];

const SyllableSmash: React.FC = () => {
  const [currentWord, setCurrentWord] = useState(WORDS[0]);
  const [taps, setTaps] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { addXP, currentUser } = useUser();

  const speak = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }, []);

  const generateProblem = useCallback(() => {
    const nextWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(nextWord);
    setTaps(0);
    setFeedback(null);
    speak(`Smash the syllables in ${nextWord.word}`);
  }, [speak]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const handleTap = () => {
    if (feedback) return;
    setTaps(prev => prev + 1);
    speak(currentWord.word); // Optional: repeat word or make a sound
  };

  const checkResult = () => {
    if (feedback) return;

    if (taps === currentWord.syllables) {
      setFeedback('SMASHED IT! 💥');
      speak(`Correct! ${currentWord.word} has ${currentWord.syllables} syllables.`);
      if (currentUser) addXP(currentUser, 25);
      setTimeout(generateProblem, 2500);
    } else {
      setFeedback('Try again! 🔄');
      speak(`${currentWord.word} has ${currentWord.syllables} syllables. You tapped ${taps} times.`);
      setTimeout(() => {
        setFeedback(null);
        setTaps(0);
      }, 2000);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback) return;
      if (e.key === ' ') handleTap();
      if (e.key === 'Enter') checkResult();
      if (e.key === 'r') setTaps(0);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedback, taps, currentWord]);

  return (
    <GameContainer title="Syllable Smash">
      <GameArea>
        <TargetBox onClick={() => speak(currentWord.word)}>
          <Music size={40} color="#9c27b0" style={{ marginBottom: '0.5rem' }} />
          <h2>How many syllables?</h2>
          <h1>{currentWord.word}</h1>
          <Volume2 size={32} color="#9c27b0" />
        </TargetBox>

        <SmashArea onClick={handleTap} data-testid="smash-area">
          <AnimatePresence>
            {Array.from({ length: taps }).map((_, i) => (
              <SyllableDot
                key={i}
                data-testid="syllable-dot"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              />
            ))}
          </AnimatePresence>
          {taps === 0 && (
            <div style={{ opacity: 0.5, textAlign: 'center' }}>
              <Fingerprint size={48} />
              <p>Tap here for each syllable!</p>
            </div>
          )}
        </SmashArea>

        <Controls>
          <Button $color="#e91e63" onClick={() => setTaps(0)}>Reset (R)</Button>
          <Button $color="#4caf50" onClick={checkResult} data-testid="check-button">Check (Enter)</Button>
        </Controls>

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

export default SyllableSmash;
