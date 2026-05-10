import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
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

const SentenceDisplay = styled.div`
  background: rgba(44, 62, 80, 0.8);
  padding: 1.5rem;
  border-radius: 24px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border: 4px dashed #2196f3;
  min-height: 100px;
  width: 100%;
  max-width: 800px;

  @media (min-width: 768px) {
    padding: 2rem;
    gap: 1rem;
    min-height: 150px;
    margin-bottom: 3rem;
  }
`;

const WordSlot = styled(motion.div)<{ $filled?: boolean }>`
  background: ${props => props.$filled ? '#2196f3' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 1.2rem;
  min-width: 60px;
  text-align: center;
  box-shadow: ${props => props.$filled ? '0 4px 0 #1976d2' : 'none'};

  @media (min-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 2rem;
    border-radius: 16px;
    min-width: 100px;
  }
`;

const WordGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 800px;

  @media (min-width: 768px) {
    gap: 1.5rem;
  }
`;

const WordButton = styled.button<{ $used?: boolean, $active?: boolean }>`
  font-size: 1.2rem;
  padding: 0.75rem 1.25rem;
  background: ${props => props.$active ? '#2196f3' : '#34495e'};
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 4px 0 #1976d2' : '0 4px 0 #1a252f'};
  opacity: ${props => props.$used ? 0 : 1};
  pointer-events: ${props => props.$used ? 'none' : 'auto'};
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 768px) {
    font-size: 2rem;
    padding: 1rem 2rem;
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
  font-size: 0.7rem;
  opacity: 0.6;
  margin-top: 0.25rem;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`;

const Feedback = styled(motion.div)`
  margin-top: 1.5rem;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.2);

  @media (min-width: 768px) {
    margin-top: 2rem;
    font-size: 3rem;
  }
`;

const ListenButton = styled.button`
  background: #2196f3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-bottom: 1rem;
  font-size: 1rem;
  box-shadow: 0 4px 0 #1976d2;

  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #1976d2;
  }
`;

const SENTENCES = [
  "The cat is red",
  "I like to play",
  "The sun is hot",
  "I see the moon",
  "The dog can jump",
  "Look at the bird",
  "I have a big ball",
  "We go to school",
  "The fish can swim",
  "A bug is on the leaf",
  "The blue car is fast",
  "I love my family",
  "The apple is sweet"
];

const SentenceScramble: React.FC = () => {
  const [targetSentence, setTargetSentence] = useState<string[]>([]);
  const [scrambledWords, setScrambledWords] = useState<{word: string, originalIndex: number, used: boolean}[]>([]);
  const [currentSentence, setCurrentSentence] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { addXP, currentUser } = useUser();

  const speak = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  const generateProblem = useCallback(() => {
    const sentence = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
    const words = sentence.split(' ');
    setTargetSentence(words);
    
    const scrambled = words.map((word, index) => ({
      word,
      originalIndex: index,
      used: false
    })).sort(() => Math.random() - 0.5);
    
    setScrambledWords(scrambled);
    setCurrentSentence([]);
    setFeedback(null);
    setSelectedIndex(0);
    
    speak("Listen to the sentence.");
    setTimeout(() => speak(sentence), 1000);
  }, [speak]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const handleWordClick = (index: number) => {
    if (feedback) return;
    
    const wordObj = scrambledWords[index];
    if (wordObj.used) return;

    // Check if it's the correct next word
    const nextWordIndex = currentSentence.length;
    if (wordObj.word === targetSentence[nextWordIndex]) {
      const newScrambled = [...scrambledWords];
      newScrambled[index].used = true;
      setScrambledWords(newScrambled);
      
      const newCurrent = [...currentSentence, wordObj.word];
      setCurrentSentence(newCurrent);
      speak(wordObj.word);

      if (newCurrent.length === targetSentence.length) {
        setFeedback("AWESOME! 🌟");
        speak("You did it!");
        speak(targetSentence.join(' '));
        if (currentUser) addXP(currentUser, 30);
        setTimeout(generateProblem, 3000);
      } else {
        // Find next unused index for selection
        const nextUnused = newScrambled.findIndex(w => !w.used);
        if (nextUnused !== -1) setSelectedIndex(nextUnused);
      }
    } else {
      setFeedback("Try again! 🔄");
      speak("Try again.");
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback) return;

      const unusedIndices = scrambledWords
        .map((w, i) => w.used ? -1 : i)
        .filter(i => i !== -1);

      if (unusedIndices.length === 0) return;

      if (e.key === 'ArrowRight') {
        const currentPos = unusedIndices.indexOf(selectedIndex);
        const nextPos = (currentPos + 1) % unusedIndices.length;
        setSelectedIndex(unusedIndices[nextPos]);
      } else if (e.key === 'ArrowLeft') {
        const currentPos = unusedIndices.indexOf(selectedIndex);
        const nextPos = (currentPos - 1 + unusedIndices.length) % unusedIndices.length;
        setSelectedIndex(unusedIndices[nextPos]);
      } else if (e.key === 'Enter') {
        handleWordClick(selectedIndex);
      } else if (e.key === ' ') {
        speak(targetSentence.join(' '));
      } else {
        // Number keys 1-9
        const num = parseInt(e.key);
        if (num >= 1 && num <= scrambledWords.length) {
          handleWordClick(num - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrambledWords, selectedIndex, feedback, targetSentence, speak]);

  return (
    <GameContainer title="Sentence Scramble">
      <GameArea data-target={targetSentence.join(' ')}>
        <ListenButton onClick={() => speak(targetSentence.join(' '))}>
          <Volume2 size={24} /> Listen to sentence
        </ListenButton>

        <SentenceDisplay>
          {targetSentence.map((_, index) => (
            <WordSlot 
              key={index} 
              $filled={index < currentSentence.length}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {currentSentence[index] || ""}
            </WordSlot>
          ))}
        </SentenceDisplay>

        <WordGrid>
          {scrambledWords.map((wordObj, index) => (
            <WordButton
              key={`${wordObj.word}-${index}`}
              $used={wordObj.used}
              $active={selectedIndex === index}
              onClick={() => handleWordClick(index)}
              onMouseEnter={() => !wordObj.used && setSelectedIndex(index)}
              data-word={wordObj.word}
            >
              {wordObj.word}
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

export default SentenceScramble;
