import React from 'react';
import styled from 'styled-components';
import { useUser } from '../hooks/useUser';
import { X, Trash2, AlertTriangle } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const Modal = styled.div`
  background: #2c3e50;
  padding: 2rem;
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  color: white;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1.2rem;
  right: 1.2rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.label`
  font-size: 1.1rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.8);
`;

const Input = styled.input`
  padding: 0.8rem;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: white;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const DangerZone = styled.div`
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ConfirmationBox = styled.div`
  background: rgba(231, 76, 60, 0.1);
  border: 2px solid #e74c3c;
  padding: 1.5rem;
  border-radius: 16px;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings, currentUser, users, updateUserProfile, resetAllProgress } = useUser();
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const user = currentUser ? users[currentUser] : null;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && !showResetConfirm) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showResetConfirm]);

  const handleReset = () => {
    if (currentUser) {
      resetAllProgress(currentUser);
      setShowResetConfirm(false);
      onClose();
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}><X size={24} /></CloseButton>
        <h2 style={{ color: '#ffd700', marginBottom: '2.5rem', fontSize: '2rem' }}>Settings</h2>
        
        {user && (
          <FormGroup>
            <Label>Theme</Label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <ThemeButton 
                $active={user.theme === 'space_princess'}
                $color="#e94560"
                onClick={() => updateUserProfile(currentUser!, { theme: 'space_princess' })}
              >
                Space Princess
              </ThemeButton>
              <ThemeButton 
                $active={user.theme === 'monster_skate'}
                $color="#f39c12"
                onClick={() => updateUserProfile(currentUser!, { theme: 'monster_skate' })}
              >
                Monster Skate
              </ThemeButton>
            </div>
          </FormGroup>
        )}

        <FormGroup style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Label>Show Typing Hints</Label>
          <input 
            type="checkbox" 
            style={{ width: '25px', height: '25px', cursor: 'pointer' }}
            checked={settings.typingHintEnabled} 
            onChange={(e) => updateSettings({ typingHintEnabled: e.target.checked })}
          />
        </FormGroup>

        <FormGroup>
          <Label>Hint Delay (ms)</Label>
          <Input 
            type="number" 
            value={settings.typingHintDelay}
            onChange={(e) => updateSettings({ typingHintDelay: parseInt(e.target.value) || 0 })}
          />
        </FormGroup>

        <DangerZone>
          {!showResetConfirm ? (
            <ResetButton onClick={() => setShowResetConfirm(true)}>
              <Trash2 size={18} /> Reset All Progress
            </ResetButton>
          ) : (
            <ConfirmationBox>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#e74c3c' }}>
                <AlertTriangle size={20} />
                <strong style={{ fontSize: '1.1rem' }}>Are you sure?</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                This will wipe your XP, mastered games, and history. This cannot be undone!
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <ConfirmActionButton onClick={handleReset}>
                  Yes, Reset Everything
                </ConfirmActionButton>
                <CancelButton onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </CancelButton>
              </div>
            </ConfirmationBox>
          )}
        </DangerZone>

        {!showResetConfirm && (
          <SaveButton onClick={onClose}>
            Save & Close
          </SaveButton>
        )}
      </Modal>
    </Overlay>
  );
};

const ThemeButton = styled.button<{ $active: boolean, $color: string }>`
  flex: 1;
  padding: 1rem;
  border-radius: 12px;
  background: ${props => props.$active ? props.$color : 'rgba(255,255,255,0.05)'};
  color: ${props => props.$active ? '#000' : 'white'};
  border: 2px solid ${props => props.$active ? props.$color : 'rgba(255,255,255,0.1)'};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? props.$color : 'rgba(255,255,255,0.1)'};
  }
`;

const ResetButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: transparent;
  color: #e74c3c;
  border: 2px solid #e74c3c;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background: #e74c3c;
    color: white;
  }
`;

const ConfirmActionButton = styled.button`
  flex: 2;
  padding: 0.8rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  background: rgba(255,255,255,0.1);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const SaveButton = styled.button`
  width: 100%;
  margin-top: 2rem;
  padding: 1rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #45a049;
    transform: translateY(-2px);
  }
`;

export default SettingsModal;
