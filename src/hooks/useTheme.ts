import { useContext } from 'react';
import { ThemeStateContext, ThemeActionsContext } from '../context/ThemeContext';
import type { ThemeState, ThemeActions } from '../types/theme';

export function useTheme(): ThemeState {
  const context = useContext(ThemeStateContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useThemeActions(): ThemeActions {
  const context = useContext(ThemeActionsContext);
  if (context === undefined) {
    throw new Error('useThemeActions must be used within a ThemeProvider');
  }
  return context;
}
