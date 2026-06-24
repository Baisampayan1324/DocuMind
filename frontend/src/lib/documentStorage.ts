export interface SavedDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  lastUsed: string;
  chatName: string;
  chatId: string;
  isFavorite?: boolean;
}

export const saveDocumentToLibrary = (file: File | { name: string, size: number }, chatName: string, chatId: string) => {
  const savedDocs: SavedDocument[] = JSON.parse(localStorage.getItem('documind_library') || '[]');
  
  const existingDocIndex = savedDocs.findIndex(d => d.name === file.name);
  
  if (existingDocIndex > -1) {
    savedDocs[existingDocIndex].lastUsed = new Date().toISOString();
    savedDocs[existingDocIndex].chatName = chatName;
    savedDocs[existingDocIndex].chatId = chatId;
  } else {
    const newDoc: SavedDocument = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      uploadDate: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      chatName,
      chatId,
      isFavorite: false
    };
    savedDocs.push(newDoc);
  }
  
  localStorage.setItem('documind_library', JSON.stringify(savedDocs));
};

export const getSavedDocuments = (): SavedDocument[] => {
  return JSON.parse(localStorage.getItem('documind_library') || '[]');
};

export const removeDocumentFromLibrary = (id: string) => {
  const savedDocs: SavedDocument[] = JSON.parse(localStorage.getItem('documind_library') || '[]');
  const filtered = savedDocs.filter(d => d.id !== id);
  localStorage.setItem('documind_library', JSON.stringify(filtered));
};

export const removeDocumentsFromLibrary = (ids: string[]) => {
  const savedDocs: SavedDocument[] = JSON.parse(localStorage.getItem('documind_library') || '[]');
  const filtered = savedDocs.filter(d => !ids.includes(d.id));
  localStorage.setItem('documind_library', JSON.stringify(filtered));
};

export const renameDocumentInLibrary = (id: string, newName: string) => {
  const savedDocs: SavedDocument[] = JSON.parse(localStorage.getItem('documind_library') || '[]');
  const index = savedDocs.findIndex(d => d.id === id);
  if (index > -1) {
    savedDocs[index].name = newName;
    localStorage.setItem('documind_library', JSON.stringify(savedDocs));
  }
};

export const toggleFavoriteInLibrary = (id: string) => {
  const savedDocs: SavedDocument[] = JSON.parse(localStorage.getItem('documind_library') || '[]');
  const index = savedDocs.findIndex(d => d.id === id);
  if (index > -1) {
    savedDocs[index].isFavorite = !savedDocs[index].isFavorite;
    localStorage.setItem('documind_library', JSON.stringify(savedDocs));
  }
};

export const clearLibrary = () => {
  localStorage.removeItem('documind_library');
};
