import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type FontSize = 'Small' | 'Standard' | 'Compact' | 'Editorial (Large)';
type FontStyle = 'Sans' | 'Serif' | 'Mono';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  fontStyle: FontStyle;
  setFontStyle: (style: FontStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('documind-theme');
    return (saved as Theme) || 'light';
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('documind-font-size');
    return (saved as FontSize) || 'Standard';
  });

  const [fontStyle, setFontStyle] = useState<FontStyle>(() => {
    const saved = localStorage.getItem('documind-font-style');
    return (saved as FontStyle) || 'Sans';
  });

  useEffect(() => {
    localStorage.setItem('documind-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('documind-font-size', fontSize);
    const root = document.documentElement;
    root.classList.remove('font-size-small', 'font-size-standard', 'font-size-compact', 'font-size-editorial');
    
    if (fontSize === 'Small') root.classList.add('font-size-small');
    if (fontSize === 'Standard') root.classList.add('font-size-standard');
    if (fontSize === 'Compact') root.classList.add('font-size-compact');
    if (fontSize === 'Editorial (Large)') root.classList.add('font-size-editorial');
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('documind-font-style', fontStyle);
    const root = document.documentElement;
    root.classList.remove('font-style-sans', 'font-style-serif', 'font-style-mono');
    
    if (fontStyle === 'Sans') root.classList.add('font-style-sans');
    if (fontStyle === 'Serif') root.classList.add('font-style-serif');
    if (fontStyle === 'Mono') root.classList.add('font-style-mono');
  }, [fontStyle]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize, fontStyle, setFontStyle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
