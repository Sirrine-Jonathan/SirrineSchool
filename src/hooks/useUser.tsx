import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserStats {
  math_correct?: number;
  typing_wpm?: number;
  letters_identified?: number;
  typing_history?: number[];
}

interface UserProfile {
  name: string;
  age: number;
  theme: 'space_princess' | 'monster_skate';
  xp: number;
  inventory: string[];
  stats: UserStats;
  gameHistory: Record<string, number>; // gameId -> lastPlayedTimestamp
}

interface AppSettings {
  masterVolume: number;
  typingHintEnabled: boolean;
  typingHintDelay: number;
}

interface UserContextType {
  currentUser: string | null;
  setCurrentUser: (name: string | null) => void;
  users: Record<string, UserProfile>;
  settings: AppSettings;
  updateUserStats: (userName: string, stats: Partial<UserStats>) => void;
  updateUserProfile: (userName: string, profile: Partial<UserProfile>) => void;
  addXP: (userName: string, amount: number) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  recordGamePlay: (userName: string, gameId: string) => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  masterVolume: 0.8,
  typingHintEnabled: true,
  typingHintDelay: 3000,
};

const INITIAL_USERS: Record<string, UserProfile> = {
  player: {
    name: 'Player',
    age: 6,
    theme: 'space_princess',
    xp: 0,
    inventory: [],
    stats: {},
    gameHistory: {},
  },
  grace: {
    name: 'Grace',
    age: 7,
    theme: 'space_princess',
    xp: 0,
    inventory: [],
    stats: {},
    gameHistory: {},
  },
  charlie: {
    name: 'Charlie',
    age: 4,
    theme: 'monster_skate',
    xp: 0,
    inventory: [],
    stats: {},
    gameHistory: {},
  },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('sirrine_current_user') || 'player';
  });

  const [users, setUsers] = useState<Record<string, UserProfile>>(() => {
    const saved = localStorage.getItem('sirrine_users');
    const parsed = saved ? JSON.parse(saved) : INITIAL_USERS;
    // Ensure 'player' exists if migrating from old version
    if (!parsed.player) {
      parsed.player = INITIAL_USERS.player;
    }
    // Ensure gameHistory exists for all users
    Object.keys(parsed).forEach(key => {
      if (!parsed[key].gameHistory) {
        parsed[key].gameHistory = {};
      }
    });
    return parsed;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('sirrine_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('sirrine_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sirrine_current_user', currentUser);
    } else {
      localStorage.removeItem('sirrine_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sirrine_users', JSON.stringify(users));
  }, [users]);

  const updateUserStats = (userName: string, newStats: Partial<UserStats>) => {
    setUsers(prev => ({
      ...prev,
      [userName]: {
        ...prev[userName],
        stats: { ...prev[userName].stats, ...newStats }
      }
    }));
  };

  const updateUserProfile = (userName: string, profile: Partial<UserProfile>) => {
    setUsers(prev => ({
      ...prev,
      [userName]: {
        ...prev[userName],
        ...profile
      }
    }));
  };

  const addXP = (userName: string, amount: number) => {
    setUsers(prev => ({
      ...prev,
      [userName]: {
        ...prev[userName],
        xp: prev[userName].xp + amount
      }
    }));
  };

  const recordGamePlay = (userName: string, gameId: string) => {
    setUsers(prev => ({
      ...prev,
      [userName]: {
        ...prev[userName],
        gameHistory: {
          ...prev[userName].gameHistory,
          [gameId]: Date.now()
        }
      }
    }));
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, users, settings, updateUserStats, updateUserProfile, addXP, updateSettings, recordGamePlay }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};