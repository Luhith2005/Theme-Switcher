import React, { useRef } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '../context/ThemeContext';
import { useTheme, useThemeActions } from '../hooks/useTheme';

interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: null | ((e: any) => void);
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
}

let matchMediaListeners: ((e: any) => void)[] = [];
let isSystemDark = false;

const mockMatchMedia = (query: string): MockMediaQueryList => {
  const matches = query.includes('prefers-color-scheme: dark') ? isSystemDark : false;
  return {
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((event, callback) => {
      if (query.includes('prefers-color-scheme: dark') && event === 'change') {
        matchMediaListeners.push(callback);
      }
    }),
    removeEventListener: vi.fn((event, callback) => {
      if (event === 'change') {
        matchMediaListeners = matchMediaListeners.filter(c => c !== callback);
      }
    }),
    dispatchEvent: vi.fn(),
  };
};

describe('Theme Switcher System', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', mockMatchMedia);
    matchMediaListeners = [];
    isSystemDark = false;
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const TestThemeComponent = () => {
    const state = useTheme();
    const actions = useThemeActions();
    return (
      <div>
        <span data-testid="active">{state.activeTheme}</span>
        <span data-testid="applied">{state.currentTheme}</span>
        <button data-testid="set-dark" onClick={() => actions.setTheme('dark')}>Set Dark</button>
        <button data-testid="set-system" onClick={() => actions.setTheme('system')}>Set System</button>
      </div>
    );
  };

  it('defaults to system preference theme when no storage preference exists', () => {
    isSystemDark = true;
    render(
      <ThemeProvider>
        <TestThemeComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('active').textContent).toBe('system');
    expect(screen.getByTestId('applied').textContent).toBe('dark');
  });

  it('restores stored manual selection from localStorage', () => {
    localStorage.setItem('theme-switcher-pref', 'midnight');
    
    render(
      <ThemeProvider>
        <TestThemeComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('active').textContent).toBe('midnight');
    expect(screen.getByTestId('applied').textContent).toBe('midnight');
  });

  it('updates state and persists selection to localStorage when setTheme is executed', () => {
    render(
      <ThemeProvider>
        <TestThemeComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-dark'));

    expect(screen.getByTestId('active').textContent).toBe('dark');
    expect(screen.getByTestId('applied').textContent).toBe('dark');
    expect(localStorage.getItem('theme-switcher-pref')).toBe('dark');
  });

  it('listens for OS level system changes and updates the current theme dynamically', () => {
    render(
      <ThemeProvider>
        <TestThemeComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('active').textContent).toBe('system');
    expect(screen.getByTestId('applied').textContent).toBe('light');

    isSystemDark = true;
    act(() => {
      matchMediaListeners.forEach(listener => listener({ matches: true } as any));
    });

    expect(screen.getByTestId('applied').textContent).toBe('dark');
  });

  it('does NOT update theme on OS system change if manual override is selected', () => {
    render(
      <ThemeProvider>
        <TestThemeComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-dark'));
    expect(screen.getByTestId('active').textContent).toBe('dark');

    isSystemDark = false;
    act(() => {
      matchMediaListeners.forEach(listener => listener({ matches: false } as any));
    });

    expect(screen.getByTestId('active').textContent).toBe('dark');
    expect(screen.getByTestId('applied').textContent).toBe('dark');
  });

  it('guarantees components consuming only actions do not re-render on theme changes', () => {
    const rendersRef = { current: 0 };
    
    const ActionsOnlyComponent = () => {
      const actions = useThemeActions();
      rendersRef.current += 1;
      return (
        <button data-testid="trigger-btn" onClick={() => actions.setTheme('forest')}>
          Set Forest
        </button>
      );
    };

    const StateConsumerComponent = () => {
      const state = useTheme();
      return <div data-testid="state-display">{state.currentTheme}</div>;
    };

    render(
      <ThemeProvider>
        <StateConsumerComponent />
        <ActionsOnlyComponent />
      </ThemeProvider>
    );

    expect(rendersRef.current).toBe(1);

    fireEvent.click(screen.getByTestId('trigger-btn'));

    expect(screen.getByTestId('state-display').textContent).toBe('forest');
    expect(rendersRef.current).toBe(1);
  });
});
