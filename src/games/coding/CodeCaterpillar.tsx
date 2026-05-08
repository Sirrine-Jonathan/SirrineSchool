import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bug, Apple, Play, X, 
  ArrowUp, RefreshCw, RefreshCcw,
  GripVertical, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import GameContainer from '../../components/GameContainer';
import { useUser } from '../../hooks/useUser';

const GRID_SIZE = 8;

type CommandType = 'FORWARD' | 'ROTATE_CW' | 'ROTATE_CCW' | 'SLIDE_LEFT' | 'SLIDE_RIGHT';
type Heading = number; // Use raw degrees for smart rotation

interface CommandBlock {
  id: string;
  type: CommandType;
}

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 1rem;
  overflow-y: auto;
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem;
    gap: 2rem;
  }
`;

const GameBoardSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
`;

const ProgrammingSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 300px;
`;

const Grid = styled.div<{ $size: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$size}, 1fr);
  gap: 2px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px;
  border-radius: 12px;
  width: 100%;
  aspect-ratio: 1 / 1;
`;

const Cell = styled(motion.div)<{ $isHead?: boolean; $isBody?: boolean; $isFood?: boolean }>`
  background: ${props => 
    props.$isHead ? '#4caf50' : 
    props.$isBody ? '#81c784' : 
    props.$isFood ? 'transparent' : 'rgba(0,0,0,0.3)'};
  border-radius: ${props => props.$isHead || props.$isBody ? '50%' : '4px'};
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  position: relative;
  overflow: hidden;
  
  svg {
    width: 70%;
    height: 70%;
    color: ${props => props.$isFood ? '#ff5252' : 'white'};
  }
`;

const BugIcon = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.25rem;
  width: 100%;
  margin-top: 1rem;

  @media (min-width: 400px) {
    gap: 0.5rem;
  }
`;

const ControlBtn = styled.button`
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 0.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.6rem;
  font-weight: bold;
  box-shadow: 0 4px 0 #1a252f;
  transition: all 0.1s;
  min-width: 0;

  @media (min-width: 400px) {
    font-size: 0.7rem;
    padding: 0.75rem 0.25rem;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 0 #1a252f;
  }

  &:active:not(:disabled) {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #1a252f;
  }

  svg { width: 20px; height: 20px; }
  @media (min-width: 400px) {
    svg { width: 24px; height: 24px; }
  }
`;

const RegisterTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 0.9rem;
    opacity: 0.7;
  }
`;

const CommandList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-height: 100px;
  padding: 0.5rem;
  background: rgba(0,0,0,0.2);
  border-radius: 12px;
  overflow-y: auto;
  max-height: 400px;
`;

const StyledSortableItem = styled.div<{ $isDragging?: boolean }>`
  display: flex;
  align-items: center;
  background: #4caf50;
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  gap: 0.5rem;
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const RemoveBtn = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  border-radius: 4px;
  padding: 2px;
  margin-left: auto;
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover { background: rgba(255, 255, 255, 0.3); }
`;

const RunBtn = styled.button<{ $disabled: boolean }>`
  margin-top: 1rem;
  background: ${props => props.$disabled ? '#555' : '#e91e63'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 0 ${props => props.$disabled ? '#333' : '#ad1457'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};

  &:active {
    transform: ${props => props.$disabled ? 'none' : 'translateY(2px)'};
    box-shadow: 0 2px 0 #ad1457;
  }
`;

const Feedback = styled(motion.div)`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-weight: bold;
  color: #4caf50;
  text-shadow: 2px 2px 0 rgba(0,0,0,0.5);
  pointer-events: none;
  z-index: 100;
`;

const SortableItem = ({ id, block, onRemove }: { id: string, block: CommandBlock, onRemove: (id: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = block.type === 'FORWARD' ? ArrowUp : 
               block.type === 'ROTATE_CW' ? RefreshCw : 
               block.type === 'ROTATE_CCW' ? RefreshCcw :
               block.type === 'SLIDE_LEFT' ? ChevronsLeft : ChevronsRight;

  return (
    <StyledSortableItem ref={setNodeRef} style={style} $isDragging={isDragging}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
        <GripVertical size={20} opacity={0.6} />
      </div>
      <Icon size={20} />
      <span>{block.type.replace('_', ' ')}</span>
      <RemoveBtn onClick={() => onRemove(id)}>
        <X size={16} />
      </RemoveBtn>
    </StyledSortableItem>
  );
};

const CodeCaterpillar: React.FC = () => {
  const [caterpillar, setCaterpillar] = useState([{ x: 2, y: 3 }]);
  const [heading, setHeading] = useState<Heading>(0); // Normalized Heading
  const [food, setFood] = useState({ x: 5, y: 3 });
  const [program, setProgram] = useState<CommandBlock[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { addXP, currentUser } = useUser();

  const MAX_COMMANDS = 6;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const spawnFood = (currentCat: {x: number, y: number}[]) => {
    let newFood: { x: number, y: number };
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      if (!currentCat.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  };

  const addCommand = (type: CommandType) => {
    if (isRunning || program.length >= MAX_COMMANDS) return;
    const newBlock: CommandBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
    };
    setProgram(prev => [...prev, newBlock]);
  };

  const removeCommand = (id: string) => {
    if (isRunning) return;
    setProgram(prev => prev.filter(b => b.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setProgram((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const runProgram = async () => {
    if (isRunning || program.length === 0) return;
    
    setIsRunning(true);
    let currentCat = [...caterpillar];
    let currentHeading = heading;
    
    for (const block of program) {
      if (block.type === 'ROTATE_CW') {
        currentHeading = currentHeading + 90;
        setHeading(currentHeading);
        await new Promise(r => setTimeout(r, 400));
        continue;
      } else if (block.type === 'ROTATE_CCW') {
        currentHeading = currentHeading - 90;
        setHeading(currentHeading);
        await new Promise(r => setTimeout(r, 400));
        continue;
      }

      // Movement logic
      let normalizedHeading = ((currentHeading % 360) + 360) % 360;
      let dx = 0;
      let dy = 0;

      if (block.type === 'FORWARD') {
        if (normalizedHeading === 0) dy = -1;
        else if (normalizedHeading === 90) dx = 1;
        else if (normalizedHeading === 180) dy = 1;
        else if (normalizedHeading === 270) dx = -1;
      } else if (block.type === 'SLIDE_LEFT') {
        if (normalizedHeading === 0) dx = -1;
        else if (normalizedHeading === 90) dy = -1;
        else if (normalizedHeading === 180) dx = 1;
        else if (normalizedHeading === 270) dy = 1;
      } else if (block.type === 'SLIDE_RIGHT') {
        if (normalizedHeading === 0) dx = 1;
        else if (normalizedHeading === 90) dy = 1;
        else if (normalizedHeading === 180) dx = -1;
        else if (normalizedHeading === 270) dy = -1;
      }

      const head = currentCat[0];
      const newHead = { x: head.x + dx, y: head.y + dy };

      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setFeedback('BONK! 💥');
        setTimeout(() => setFeedback(null), 1000);
        break;
      }

      currentCat = [newHead, ...currentCat];
      let ate = false;
      if (newHead.x === food.x && newHead.y === food.y) {
        ate = true;
      } else {
        currentCat.pop();
      }

      setCaterpillar([...currentCat]);
      await new Promise(r => setTimeout(r, 400));
      
      if (ate) {
        setFeedback('YUM! 🍎');
        if (currentUser) addXP(currentUser, 15);
        spawnFood(currentCat);
        setTimeout(() => setFeedback(null), 1000);
        break;
      }
    }
    
    setIsRunning(false);
    setProgram([]);
  };

  return (
    <GameContainer title="Code Caterpillar">
      <GameArea>
        <GameBoardSection>
          <Grid $size={GRID_SIZE}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isHead = caterpillar[0].x === x && caterpillar[0].y === y;
              const isBody = caterpillar.some((seg, idx) => idx !== 0 && seg.x === x && seg.y === y);
              const isFood = food.x === x && food.y === y;

              return (
                <Cell 
                  key={i} 
                  $isHead={isHead} 
                  $isBody={isBody} 
                  $isFood={isFood}
                  layout
                >
                  {isHead && (
                    <BugIcon 
                      animate={{ rotate: heading }} 
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      layoutId="bug-head"
                    >
                      <Bug />
                    </BugIcon>
                  )}
                  {isFood && (
                    <motion.div 
                      key="apple"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ 
                        scale: { repeat: Infinity, duration: 1.5 },
                        initial: { duration: 0.3 }
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
                      layoutId="bug-food"
                    >
                      <Apple fill="#ff5252" />
                    </motion.div>
                  )}
                </Cell>
              );
            })}
          </Grid>
          
          <ControlsGrid>
            <ControlBtn onClick={() => addCommand('ROTATE_CCW')} disabled={program.length >= MAX_COMMANDS}>
              <RefreshCcw /> L
            </ControlBtn>
            <ControlBtn onClick={() => addCommand('SLIDE_LEFT')} disabled={program.length >= MAX_COMMANDS}>
              <ChevronsLeft /> SLIDE
            </ControlBtn>
            <ControlBtn onClick={() => addCommand('FORWARD')} disabled={program.length >= MAX_COMMANDS}>
              <ArrowUp /> FORW
            </ControlBtn>
            <ControlBtn onClick={() => addCommand('SLIDE_RIGHT')} disabled={program.length >= MAX_COMMANDS}>
              <ChevronsRight /> SLIDE
            </ControlBtn>
            <ControlBtn onClick={() => addCommand('ROTATE_CW')} disabled={program.length >= MAX_COMMANDS}>
              <RefreshCw /> R
            </ControlBtn>
          </ControlsGrid>
        </GameBoardSection>

        <ProgrammingSection>
          <RegisterTitle>
            Program <span>({program.length}/{MAX_COMMANDS})</span>
            {program.length > 0 && !isRunning && (
              <button 
                onClick={() => setProgram([])}
                style={{ fontSize: '0.8rem', background: 'transparent', border: '1px solid #ff5252', color: '#ff5252', padding: '2px 8px', borderRadius: '4px' }}
              >
                Clear
              </button>
            )}
          </RegisterTitle>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <CommandList>
              <SortableContext
                items={program.map(b => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {program.map((block) => (
                  <SortableItem 
                    key={block.id} 
                    id={block.id} 
                    block={block} 
                    onRemove={removeCommand} 
                  />
                ))}
              </SortableContext>
              {program.length === 0 && (
                <div style={{ opacity: 0.4, textAlign: 'center', marginTop: '2rem' }}>
                  Tap arrows to add steps!
                </div>
              )}
            </CommandList>
          </DndContext>

          <RunBtn 
            onClick={runProgram} 
            $disabled={isRunning || program.length === 0}
          >
            <Play fill="white" /> {isRunning ? 'RUNNING...' : 'RUN PROGRAM'}
          </RunBtn>
        </ProgrammingSection>

        <AnimatePresence>
          {feedback && (
            <Feedback
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
            >
              {feedback}
            </Feedback>
          )}
        </AnimatePresence>
      </GameArea>
    </GameContainer>
  );
};

export default CodeCaterpillar;