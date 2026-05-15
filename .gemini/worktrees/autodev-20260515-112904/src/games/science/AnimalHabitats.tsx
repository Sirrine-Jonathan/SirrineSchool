import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Trees, Sun, HelpCircle } from 'lucide-react';
import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 1rem;
  overflow: hidden;
  position: relative;
`;

const AnimalContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  z-index: 5;
`;

const AnimalCard = styled(motion.div)`
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  box-shadow: 0 10px 20px rgba(0,0,0,0.3);
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  @media (min-width: 768px) {
    width: 180px;
    height: 180px;
    font-size: 6rem;
  }
`;

const HabitatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  padding-bottom: 1rem;

  @media (min-width: 768px) {
    gap: 2rem;
    padding-bottom: 2rem;
  }
`;

const HabitatBox = styled(motion.div)<{ $color: string, $isOver: boolean }>`
  aspect-ratio: 1;
  background: ${props => props.$isOver ? props.$color : 'rgba(255, 255, 255, 0.1)'};
  border: 4px dashed ${props => props.$color};
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: ${props => props.$isOver ? 'white' : props.$color};
  transition: all 0.2s ease;

  svg {
    width: 40px;
    height: 40px;
    @media (min-width: 768px) {
      width: 60px;
      height: 60px;
    }
  }

  span {
    font-weight: bold;
    font-size: 0.9rem;
    @media (min-width: 768px) {
      font-size: 1.2rem;
    }
  }
`;

const Feedback = styled(motion.div)`
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-weight: bold;
  z-index: 20;
  pointer-events: none;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);

  @media (min-width: 768px) {
    font-size: 5rem;
  }
`;

const Instructions = styled.div`
  background: rgba(0, 0, 0, 0.4);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  backdrop-filter: blur(5px);

  @media (min-width: 768px) {
    font-size: 1.1rem;
    padding: 0.75rem 1.5rem;
  }
`;

type HabitatType = 'ocean' | 'forest' | 'desert';

interface Animal {
  emoji: string;
  habitat: HabitatType;
  name: string;
}

const ANIMALS: Animal[] = [
  // Ocean
  { emoji: '🐋', habitat: 'ocean', name: 'Whale' },
  { emoji: '🦈', habitat: 'ocean', name: 'Shark' },
  { emoji: '🐙', habitat: 'ocean', name: 'Octopus' },
  { emoji: '🐢', habitat: 'ocean', name: 'Sea Turtle' },
  { emoji: '🦀', habitat: 'ocean', name: 'Crab' },
  { emoji: '🐬', habitat: 'ocean', name: 'Dolphin' },
  // Forest
  { emoji: '🦌', habitat: 'forest', name: 'Deer' },
  { emoji: '🐻', habitat: 'forest', name: 'Bear' },
  { emoji: '🐿️', habitat: 'forest', name: 'Squirrel' },
  { emoji: '🦊', habitat: 'forest', name: 'Fox' },
  { emoji: '🦉', habitat: 'forest', name: 'Owl' },
  { emoji: '🦝', habitat: 'forest', name: 'Raccoon' },
  // Desert
  { emoji: '🐫', habitat: 'desert', name: 'Camel' },
  { emoji: '🐍', habitat: 'desert', name: 'Snake' },
  { emoji: '🦂', habitat: 'desert', name: 'Scorpion' },
  { emoji: '🦎', habitat: 'desert', name: 'Lizard' },
  { emoji: '🌵', habitat: 'desert', name: 'Cactus' },
  { emoji: '🏜️', habitat: 'desert', name: 'Desert' },
];

const AnimalHabitats: React.FC = () => {
  const [currentAnimal, setCurrentAnimal] = useState<Animal | null>(null);
  const [feedback, setFeedback] = useState<{ text: string, color: string } | null>(null);
  const [isOver, setIsOver] = useState<HabitatType | null>(null);
  const { addXP, currentUser } = useUser();

  const getNewAnimal = useCallback(() => {
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    setCurrentAnimal(randomAnimal);
  }, []);

  useEffect(() => {
    getNewAnimal();
  }, [getNewAnimal]);

  const handleDragEnd = (_event: any, info: any) => {
    setIsOver(null);
    if (!currentAnimal) return;

    // Determine which habitat the animal was dropped on
    const y = info.point.y;
    const x = info.point.x;
    
    // Simple spatial detection
    const habitats = document.getElementById('habitats-grid');
    if (!habitats) return;

    const boxes = habitats.querySelectorAll('[data-habitat]');
    let droppedOn: HabitatType | null = null;

    boxes.forEach((box: any) => {
      const rect = box.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        droppedOn = box.getAttribute('data-habitat') as HabitatType;
      }
    });

    if (droppedOn) {
      if (droppedOn === currentAnimal.habitat) {
        setFeedback({ text: 'AMAZING! 🌟', color: '#4caf50' });
        if (currentUser) addXP(currentUser, 15);
        setTimeout(() => {
          setFeedback(null);
          getNewAnimal();
        }, 1500);
      } else {
        setFeedback({ text: 'Try Again! 🦊', color: '#f44336' });
        setTimeout(() => setFeedback(null), 1000);
      }
    }
  };

  const handleDrag = (_event: any, info: any) => {
    const y = info.point.y;
    const x = info.point.x;
    
    const habitats = document.getElementById('habitats-grid');
    if (!habitats) return;

    const boxes = habitats.querySelectorAll('[data-habitat]');
    let over: HabitatType | null = null;

    boxes.forEach((box: any) => {
      const rect = box.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        over = box.getAttribute('data-habitat') as HabitatType;
      }
    });

    setIsOver(over);
  };

  return (
    <GameContainer title="Animal Habitats">
      <GameArea>
        <Instructions>
          <HelpCircle size={20} />
          Drag the animal to its correct home!
        </Instructions>

        <AnimatePresence>
          {feedback && (
            <Feedback
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              style={{ color: feedback.color }}
              data-testid="feedback"
            >
              {feedback.text}
            </Feedback>
          )}
        </AnimatePresence>

        <AnimalContainer>
          <AnimatePresence mode="wait">
            {currentAnimal && !feedback && (
              <AnimalCard
                key={currentAnimal.emoji}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.8}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9, cursor: 'grabbing' }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                data-testid="animal-card"
                data-animal-name={currentAnimal.name}
              >
                {currentAnimal.emoji}
              </AnimalCard>
            )}
          </AnimatePresence>
        </AnimalContainer>

        <HabitatsContainer id="habitats-grid">
          <HabitatBox 
            $color="#2196f3" 
            $isOver={isOver === 'ocean'}
            data-habitat="ocean"
            data-testid="habitat-ocean"
          >
            <Waves />
            <span>Ocean</span>
          </HabitatBox>
          <HabitatBox 
            $color="#4caf50" 
            $isOver={isOver === 'forest'}
            data-habitat="forest"
            data-testid="habitat-forest"
          >
            <Trees />
            <span>Forest</span>
          </HabitatBox>
          <HabitatBox 
            $color="#ff9800" 
            $isOver={isOver === 'desert'}
            data-habitat="desert"
            data-testid="habitat-desert"
          >
            <Sun />
            <span>Desert</span>
          </HabitatBox>
        </HabitatsContainer>
      </GameArea>
    </GameContainer>
  );
};

export default AnimalHabitats;
