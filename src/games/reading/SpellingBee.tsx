import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Send, RotateCcw, Award, CheckCircle, XCircle } from 'lucide-react';
import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  gap: 2rem;
`;

const WordDisplay = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ListenButton = styled(motion.button)`
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 0 #1976d2;

  &:active {
    transform: translateY(4px);
    box-shadow: 0 4px 0 #1976d2;
  }
`;

const InputGroup = styled.form`
  display: flex;
  width: 100%;
  gap: 0.5rem;
`;

const SpellingInput = styled.input`
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  color: white;
  font-size: 1.5rem;
  text-align: center;
  text-transform: lowercase;

  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const SubmitButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

const FeedbackMessage = styled(motion.div)<{ $isCorrect: boolean }>`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.$isCorrect ? '#4caf50' : '#f44336'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 1.1rem;
  opacity: 0.8;
`;

const GameOver = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const WORD_LIST = [
  'cat', 'dog', 'apple', 'banana', 'school', 
  'friend', 'happy', 'purple', 'rocket', 'planet',
  'yellow', 'orange', 'garden', 'summer', 'winter'
];

const SpellingBee: React.FC = () => {
  const [currentWords, setCurrentWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean, text: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const { addXP, currentUser, recordGameWin } = useUser();

  const startNewGame = useCallback(() => {
    const shuffled = [...WORD_LIST].sort(() => Math.random() - 0.5).slice(0, 5);
    setCurrentWords(shuffled);
    setCurrentIndex(0);
    setUserInput('');
    setFeedback(null);
    setIsGameOver(false);
    setScore(0);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const speakWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (currentWords.length > 0 && !isGameOver && !feedback) {
      speakWord(currentWords[currentIndex]);
    }
  }, [currentIndex, currentWords, isGameOver, feedback]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || feedback) return;

    const correct = userInput.trim().toLowerCase() === currentWords[currentIndex].toLowerCase();
    
    if (correct) {
      setFeedback({ isCorrect: true, text: 'Correct! Well done!' });
      setScore(s => s + 1);
      if (currentUser) addXP(currentUser, 10);
    } else {
      setFeedback({ isCorrect: false, text: `Oops! It's spelled: ${currentWords[currentIndex]}` });
    }

    setTimeout(() => {
      if (currentIndex < currentWords.length - 1) {
        setCurrentIndex(i => i + 1);
        setUserInput('');
        setFeedback(null);
      } else {
        setIsGameOver(true);
        const finalScore = score + (correct ? 1 : 0);
        if (currentUser && finalScore >= 4) {
          recordGameWin(currentUser, 'spelling');
        }
      }
    }, 2000);
  };

  if (isGameOver) {
    return (
      <GameContainer title="Spelling Bee">
        <GameArea>
          <GameOver>
            <Award size={100} color="#ffd700" />
            <h2>Game Over!</h2>
            <p style={{ fontSize: '1.5rem' }}>You spelled {score} out of {currentWords.length} words correctly!</p>
            <SubmitButton onClick={startNewGame} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
              <RotateCcw size={24} style={{ marginRight: '0.5rem' }} /> Play Again
            </SubmitButton>
          </GameOver>
        </GameArea>
      </GameContainer>
    );
  }

  return (
    <GameContainer title="Spelling Bee">
      <GameArea>
        <ProgressInfo>
          <span>Word {currentIndex + 1} of {currentWords.length}</span>
          <span>Score: {score}</span>
        </ProgressInfo>

        <WordDisplay>
          <ListenButton
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => speakWord(currentWords[currentIndex])}
            data-testid="listen-button"
            data-word={currentWords[currentIndex]}
          >
            <Volume2 size={40} />
          </ListenButton>
          <p>Click to hear the word</p>

          <InputGroup onSubmit={handleSubmit}>
            <SpellingInput
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the word here..."
              autoFocus
              disabled={!!feedback}
              data-testid="spelling-input"
            />
            <SubmitButton type="submit" disabled={!userInput.trim() || !!feedback} data-testid="submit-spelling">
              <Send size={24} />
            </SubmitButton>
          </InputGroup>

          <AnimatePresence>
            {feedback && (
              <FeedbackMessage
                $isCorrect={feedback.isCorrect}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                data-testid="spelling-feedback"
              >
                {feedback.isCorrect ? <CheckCircle /> : <XCircle />}
                {feedback.text}
              </FeedbackMessage>
            )}
          </AnimatePresence>
        </WordDisplay>
      </GameArea>
    </GameContainer>
  );
};

export default SpellingBee;
