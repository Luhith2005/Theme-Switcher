import React, { createContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { ThemeOption, ThemeType, CustomThemeColors, ThemeState, ThemeActions } from '../types/theme';

// Local storage keys
const THEME_STORAGE_KEY = 'theme-switcher-pref';
const CUSTOM_COLORS_KEY = 'theme-switcher-custom-colors';
const ANIMATIONS_KEY = 'theme-switcher-animations';
const SOUNDS_KEY = 'theme-switcher-sounds';

// Default Custom Theme Colors
const defaultCustomColors: CustomThemeColors = {
  primary: '#d946ef',    // Neon magenta
  background: '#090514', // Cyber dark
  surface: '#150d2a',    // Dark purple surface
  text: '#fdfaff',       // Clean bright text
  accent: '#06b6d4',     // Cyan neon
};

// Split contexts for performance optimization:
// 1. ThemeStateContext: for components that need to read the active theme and state.
// 2. ThemeActionsContext: for components that only need to trigger mutations (theme switches, toggles)
// This ensures that components triggering theme shifts do not re-render when the theme state changes.
export const ThemeStateContext = createContext<ThemeState | undefined>(undefined);
export const ThemeActionsContext = createContext<ThemeActions | undefined>(undefined);

// Web Audio API synthesized click sounds for rich UX
const playClickSound = (type: 'on' | 'off') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'on') {
      // Shorter, higher-pitched soft click
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else {
      // Deeper click
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {
    // Fail silently if audio context is blocked by browser policy or unsupported
    console.debug('Web Audio play failed:', e);
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read initial states synchronously from localStorage to prevent render flash
  const [activeTheme, setActiveThemeState] = useState<ThemeOption>(() => {
    if (typeof window === 'undefined') return 'system';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return (stored as ThemeOption) || 'system';
    } catch {
      return 'system';
    }
  });

  const [customThemeColors, setCustomThemeColorsState] = useState<CustomThemeColors>(() => {
    if (typeof window === 'undefined') return defaultCustomColors;
    try {
      const stored = localStorage.getItem(CUSTOM_COLORS_KEY);
      return stored ? JSON.parse(stored) : defaultCustomColors;
    } catch {
      return defaultCustomColors;
    }
  });

  const [animationsEnabled, setAnimationsEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem(ANIMATIONS_KEY);
      return stored !== 'false'; // Default to true
    } catch {
      return true;
    }
  });

  const [soundsEnabled, setSoundsEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem(SOUNDS_KEY);
      return stored !== 'false'; // Default to true
    } catch {
      return true;
    }
  });

  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Calculate the current active theme based on selected theme and system preferences
  const currentTheme = useMemo<ThemeType>(() => {
    if (activeTheme === 'system') {
      return systemDark ? 'dark' : 'light';
    }
    return activeTheme;
  }, [activeTheme, systemDark]);

  // Keep references to play sound actions safely
  const soundsEnabledRef = useRef(soundsEnabled);
  useEffect(() => {
    soundsEnabledRef.current = soundsEnabled;
  }, [soundsEnabled]);

  // Detect and update system dark preference at runtime
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };

    // Use addEventListener with fallback support for compatibility
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, []);

  // Listen for reduced motion preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
    } else {
      motionQuery.addListener(handleMotionChange);
    }

    return () => {
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
      } else {
        motionQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  // Set attributes on root html tag and style properties for custom themes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    
    // Apply layout theme attribute
    root.setAttribute('data-theme', currentTheme);

    // Sync standard dark/light classes on the document element
    root.classList.remove('light', 'dark', 'midnight', 'forest', 'cyberpunk', 'custom');
    root.classList.add(currentTheme);

    // Standard dark variant compatibility
    if (currentTheme === 'dark' || currentTheme === 'midnight' || currentTheme === 'cyberpunk') {
      root.classList.add('dark');
    } else if (currentTheme === 'light' || currentTheme === 'forest') {
      root.classList.add('light');
    }

    // Apply custom colors if custom theme is chosen
    if (currentTheme === 'custom') {
      root.style.setProperty('--custom-primary', customThemeColors.primary);
      root.style.setProperty('--custom-background', customThemeColors.background);
      root.style.setProperty('--custom-surface', customThemeColors.surface);
      root.style.setProperty('--custom-text', customThemeColors.text);
      root.style.setProperty('--custom-accent', customThemeColors.accent);
    } else {
      // Clear custom properties
      root.style.removeProperty('--custom-primary');
      root.style.removeProperty('--custom-background');
      root.style.removeProperty('--custom-surface');
      root.style.removeProperty('--custom-text');
      root.style.removeProperty('--custom-accent');
    }

    // Handle animations toggle and system reduced motion rules
    if (animationsEnabled && !reducedMotion) {
      root.setAttribute('data-animations', 'enabled');
    } else {
      root.setAttribute('data-animations', 'disabled');
    }

  }, [currentTheme, customThemeColors, animationsEnabled, reducedMotion]);

  // Actions context definitions
  const setTheme = useCallback((theme: ThemeOption) => {
    setActiveThemeState(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Storage permission error:', e);
    }
    
    if (soundsEnabledRef.current) {
      playClickSound(theme === 'dark' || theme === 'midnight' || theme === 'cyberpunk' ? 'off' : 'on');
    }
  }, []);

  const updateCustomColors = useCallback((colors: Partial<CustomThemeColors>) => {
    setCustomThemeColorsState((prev) => {
      const updated = { ...prev, ...colors };
      try {
        localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage permission error:', e);
      }
      return updated;
    });
  }, []);

  const toggleAnimations = useCallback(() => {
    setAnimationsEnabledState((prev) => {
      const updated = !prev;
      try {
        localStorage.setItem(ANIMATIONS_KEY, String(updated));
      } catch (e) {
        console.warn('Storage permission error:', e);
      }
      if (soundsEnabledRef.current) {
        playClickSound(updated ? 'on' : 'off');
      }
      return updated;
    });
  }, []);

  const toggleSounds = useCallback(() => {
    setSoundsEnabledState((prev) => {
      const updated = !prev;
      try {
        localStorage.setItem(SOUNDS_KEY, String(updated));
      } catch (e) {
        console.warn('Storage permission error:', e);
      }
      // Play indicator sound on turning it back on
      if (updated) {
        playClickSound('on');
      }
      return updated;
    });
  }, []);

  const resetToSystem = useCallback(() => {
    setTheme('system');
  }, [setTheme]);

  // Memoize state context and actions context separately to guarantee no invalid re-renders
  const stateValue = useMemo<ThemeState>(() => ({
    activeTheme,
    currentTheme,
    customThemeColors,
    animationsEnabled,
    soundsEnabled,
    reducedMotion,
  }), [activeTheme, currentTheme, customThemeColors, animationsEnabled, soundsEnabled, reducedMotion]);

  const actionsValue = useMemo<ThemeActions>(() => ({
    setTheme,
    updateCustomColors,
    toggleAnimations,
    toggleSounds,
    resetToSystem,
  }), [setTheme, updateCustomColors, toggleAnimations, toggleSounds, resetToSystem]);

  return (
    <ThemeStateContext.Provider value={stateValue}>
      <ThemeActionsContext.Provider value={actionsValue}>
        {children}
      </ThemeActionsContext.Provider>
    </ThemeStateContext.Provider>
  );
};
