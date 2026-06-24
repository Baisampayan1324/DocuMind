export interface ChatHistoryItem {
  id: string;
  title: string;
  date: string;
  timestamp: number;
  preview: string;
  messages: { role: 'user' | 'assistant', content: string, timestamp: number }[];
}

const STORAGE_KEY = 'documind_chat_history';

export const getChatHistory = (): ChatHistoryItem[] => {
  const history = localStorage.getItem(STORAGE_KEY);
  return history ? JSON.parse(history) : [];
};

export const saveChatToHistory = (chat: ChatHistoryItem) => {
  const history = getChatHistory();
  const index = history.findIndex(c => c.id === chat.id);
  
  if (index > -1) {
    history[index] = chat;
  } else {
    history.unshift(chat);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const deleteChatFromHistory = (id: string) => {
  const history = getChatHistory();
  const filtered = history.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getChatById = (id: string): ChatHistoryItem | undefined => {
  const history = getChatHistory();
  return history.find(c => c.id === id);
};

export const clearChatHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};
