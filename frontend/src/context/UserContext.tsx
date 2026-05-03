import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserInfo {
  name: string;
  email: string;
  timezone: string;
  profileImage: string;
  plan: string;
}

interface UserContextType {
  user: UserInfo;
  updateUser: (updates: Partial<UserInfo>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo>(() => {
    const saved = localStorage.getItem('documind-user');
    return saved ? JSON.parse(saved) : {
      name: 'User',
      email: '',
      timezone: 'UTC',
      profileImage: 'https://picsum.photos/seed/user/200',
      plan: 'Free Plan'
    };
  });

  useEffect(() => {
    localStorage.setItem('documind-user', JSON.stringify(user));
  }, [user]);

  const updateUser = (updates: Partial<UserInfo>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
