import React, { createContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';

const THEME_STORAGE_KEY = 'theme-switcher-pref';
const CUSTOM_COLORS_KEY = 'theme-switcher-custom-colors';
const ANIMATIONS_KEY = 'theme-switcher-animations';
const SOUNDS_KEY = 'theme-switcher-sounds';

const defaultCustomColors = {
  primary: '#d946ef',
  background: '#090514',
  surface: '#150d2a',
  text: '#fdfaff',
  accent: '#06b6d4',
};

export const ThemeStateContext = createContext(undefined);
export const ThemeActionsContext = createContext(undefined);

const playClickSound = (type) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'on') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {
    console.debug('Web Audio play failed:', e);
  }
};

export const ThemeProvider = ({ children }) => {
  const [activeTheme, setActiveThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      return stored || 'system';
    } catch {
      return 'system';
    }
  });

  const [customThemeColors, setCustomThemeColorsState] = useState(() => {
    if (typeof window === 'undefined') return defaultCustomColors;
    try {
      const stored = localStorage.getItem(CUSTOM_COLORS_KEY);
      return stored ? JSON.parse(stored) : defaultCustomColors;
    } catch {
      return defaultCustomColors;
    }
  });

  const [animationsEnabled, setAnimationsEnabledState] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem(ANIMATIONS_KEY);
      return stored !== 'false';
    } catch {
      return true;
    }
  });

  const [soundsEnabled, setSoundsEnabledState] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const stored = localStorage.getItem(SOUNDS_KEY);
      return stored !== 'false';
    } catch {
      return true;
    }
  });

  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const currentTheme = useMemo(() => {
    if (activeTheme === 'system') {
      return systemDark ? 'dark' : 'light';
    }
    return activeTheme;
  }, [activeTheme, systemDark]);

  const soundsEnabledRef = useRef(soundsEnabled);
  useEffect(() => {
    soundsEnabledRef.current = soundsEnabled;
  }, [soundsEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      setSystemDark(e.matches);
    };
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e) => {
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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    
    root.setAttribute('data-theme', currentTheme);

    root.classList.remove('light', 'dark', 'midnight', 'forest', 'cyberpunk', 'custom');
    root.classList.add(currentTheme);

    if (currentTheme === 'dark' || currentTheme === 'midnight' || currentTheme === 'cyberpunk') {
      root.classList.add('dark');
    } else if (currentTheme === 'light' || currentTheme === 'forest') {
      root.classList.add('light');
    }

    if (currentTheme === 'custom') {
      root.style.setProperty('--custom-primary', customThemeColors.primary);
      root.style.setProperty('--custom-background', customThemeColors.background);
      root.style.setProperty('--custom-surface', customThemeColors.surface);
      root.style.setProperty('--custom-text', customThemeColors.text);
      root.style.setProperty('--custom-accent', customThemeColors.accent);
    } else {
      root.style.removeProperty('--custom-primary');
      root.style.removeProperty('--custom-background');
      root.style.removeProperty('--custom-surface');
      root.style.removeProperty('--custom-text');
      root.style.removeProperty('--custom-accent');
    }

    if (animationsEnabled && !reducedMotion) {
      root.setAttribute('data-animations', 'enabled');
    } else {
      root.setAttribute('data-animations', 'disabled');
    }
  }, [currentTheme, customThemeColors, animationsEnabled, reducedMotion]);

  const setTheme = useCallback((theme) => {
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

  const updateCustomColors = useCallback((colors) => {
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
      if (updated) {
        playClickSound('on');
      }
      return updated;
    });
  }, []);

  const resetToSystem = useCallback(() => {
    setTheme('system');
  }, [setTheme]);

  const stateValue = useMemo(() => ({
    activeTheme,
    currentTheme,
    customThemeColors,
    animationsEnabled,
    soundsEnabled,
    reducedMotion,
  }), [activeTheme, currentTheme, customThemeColors, animationsEnabled, soundsEnabled, reducedMotion]);

  const actionsValue = useMemo(() => ({
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
