import { useContext } from 'react';
import { ThemeStateContext, ThemeActionsContext } from '../context/ThemeContext';

export function useTheme() {
  const context = useContext(ThemeStateContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeActions() {
  const context = useContext(ThemeActionsContext);
  if (context === undefined) {
    throw new Error('useThemeActions must be used within a ThemeProvider');
  }
  return context;
}
