import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import { TourProvider } from './context/TourContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <UserProvider>
        <TourProvider>
          <App />
        </TourProvider>
      </UserProvider>
    </ThemeProvider>
  </StrictMode>,
);
