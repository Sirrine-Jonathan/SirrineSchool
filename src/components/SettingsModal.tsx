import React from 'react';
import styled from 'styled-components';
import { useUser } from '../hooks/useUser';
import { X } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const Modal = styled.div`
  background: #2c3e50;
  padding: 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  color: white;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1.2rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = useUser();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}><X /></CloseButton>
        <h2 style={{ color: '#ffd700', marginBottom: '2rem' }}>Settings</h2>
        
        <FormGroup style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Label>Show Typing Hints</Label>
          <input 
            type="checkbox" 
            style={{ width: '25px', height: '25px' }}
            checked={settings.typingHintEnabled} 
            onChange={(e) => updateSettings({ typingHintEnabled: e.target.checked })}
          />
        </FormGroup>

        <FormGroup>
          <Label>Hint Delay (milliseconds)</Label>
          <Input 
            type="number" 
            value={settings.typingHintDelay}
            onChange={(e) => updateSettings({ typingHintDelay: parseInt(e.target.value) || 0 })}
          />
        </FormGroup>

        <ActionButton 
          style={{ width: '100%', marginTop: '1rem', background: '#4caf50' }} 
          onClick={onClose}
        >
          Save & Close (Enter)
        </ActionButton>
      </Modal>
    </Overlay>
  );
};

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  padding: 0.8rem 1.5rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background: #ff5e78;
    transform: translateY(-2px);
  }
`;

export default SettingsModal;
