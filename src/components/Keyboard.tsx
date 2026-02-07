import React from 'react';
import styled from 'styled-components';

const KeyboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  width: fit-content;
  margin: 0 auto;
`;

const Row = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

const Key = styled.div<{ $active: boolean }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$active ? '#ffd700' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.$active ? '#000' : '#fff'};
  border-radius: 5px;
  font-weight: bold;
  font-size: 1.2rem;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 0 15px #ffd700' : 'none'};
`;

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

interface KeyboardProps {
  highlightKey?: string;
}

const Keyboard: React.FC<KeyboardProps> = ({ highlightKey }) => {
  return (
    <KeyboardContainer>
      {ROWS.map((row, i) => (
        <Row key={i}>
          {row.map(key => (
            <Key key={key} $active={highlightKey === key}>
              {key}
            </Key>
          ))}
        </Row>
      ))}
    </KeyboardContainer>
  );
};

export default Keyboard;
