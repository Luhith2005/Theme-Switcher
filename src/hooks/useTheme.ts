import { useContext } from 'react';
import { ThemeStateContext, ThemeActionsContext } from '../context/ThemeContext';
import type { ThemeState, ThemeActions } from '../types/theme';

/**
 * Custom hook to access current theme state (active theme, applied theme, preferences)
 * Subscribes the component to theme state changes.
 */
export function useTheme(): ThemeState {
  const context = useContext(ThemeStateContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Custom hook to access theme actions (switching themes, updating colors, toggles)
 * Does NOT subscribe the component to theme state changes, preventing unnecessary re-renders.
 */
export function useThemeActions(): ThemeActions {
  const context = useContext(ThemeActionsContext);
  if (context === undefined) {
    throw new Error('useThemeActions must be used within a ThemeProvider');
  }
  return context;
}
