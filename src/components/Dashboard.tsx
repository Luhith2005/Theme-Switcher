import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTheme, useThemeActions } from '../hooks/useTheme';
import type { ThemeOption } from '../types/theme';
import { Customizer } from './Customizer';
import { RenderVisualizer } from './RenderVisualizer';
import { PaintbrushIcon, VolumeIcon } from './Icons';

export const MemoizedCard: React.FC = React.memo(() => {
  const renders = useRef(0);
  renders.current += 1;

  return (
    <div className="card memoized-card">
      <h3>Memoized panel</h3>
      <p>
        This card does not subscribe to theme context. 
        Parent toggles should not thrash unrelated UI.
      </p>
      <div className="card-footer-note">
        Render count (dev): <span className="highlight-count">{renders.current}</span>
      </div>
    </div>
  );
});

export const SurfaceTokensCard: React.FC = () => {
  const renders = useRef(0);
  renders.current += 1;

  return (
    <div className="card surface-tokens-card">
      <h3>Surface tokens</h3>
      <p>
        Cards use Tailwind <code>dark:</code> variants. Inline script 
        in <code>index.html</code> applies the correct class before paint.
      </p>
      <div className="card-footer-note" style={{ opacity: 0.5, fontSize: '11px' }}>
        Render count (dev): {renders.current}
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const state = useTheme();
  const actions = useThemeActions();
  const [showDevPanel, setShowDevPanel] = useState(false);

  const appearanceLabel = useMemo(() => {
    const active = state.activeTheme;
    const current = state.currentTheme;
    if (active === 'system') {
      return (
        <>
          <strong>{current}</strong> <span className="os-note">(following OS)</span>
        </>
      );
    }
    return <strong>{current}</strong>;
  }, [state.activeTheme, state.currentTheme]);

  return (
    <div className="chroma-lab-container">
      <div className="floating-sound-control">
        <button
          type="button"
          className="sound-btn"
          onClick={actions.toggleSounds}
          aria-label={state.soundsEnabled ? "Mute clicks" : "Unmute clicks"}
          title={state.soundsEnabled ? "Mute click sounds" : "Unmute click sounds"}
        >
          <VolumeIcon muted={!state.soundsEnabled} size={16} />
        </button>
      </div>

      <main className="chroma-main">
        <header className="chroma-header">
          <span className="assignment-num">ASSIGNMENT 7</span>
          <h1 className="main-title">Chroma theme lab</h1>
          <p className="subtitle">Context API · persistence · system sync · no flash</p>
        </header>

        <section className="controls-row">
          <div className="pill-selector">
            <button
              type="button"
              className={`pill-btn ${state.activeTheme === 'light' ? 'active' : ''}`}
              onClick={() => actions.setTheme('light')}
              aria-pressed={state.activeTheme === 'light'}
            >
              Light
            </button>
            <button
              type="button"
              className={`pill-btn ${state.activeTheme === 'dark' ? 'active' : ''}`}
              onClick={() => actions.setTheme('dark')}
              aria-pressed={state.activeTheme === 'dark'}
            >
              Dark
            </button>
            <button
              type="button"
              className={`pill-btn ${state.activeTheme === 'system' ? 'active' : ''}`}
              onClick={() => actions.setTheme('system')}
              aria-pressed={state.activeTheme === 'system'}
            >
              System
            </button>
          </div>

          <button
            type="button"
            className="dashed-btn"
            onClick={actions.resetToSystem}
            aria-label="Reset selection back to OS preferences"
          >
            Reset to system
          </button>
        </section>

        <section className="status-row">
          <span>Active appearance: <span className="status-highlight">{appearanceLabel}</span></span>
        </section>

        <section className="cards-grid">
          <SurfaceTokensCard />
          <MemoizedCard />
        </section>

        <section className="dev-options-toggle-section">
          <button
            type="button"
            className="dev-toggle-btn"
            onClick={() => setShowDevPanel(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '8px 16px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '12px',
              transition: 'all 0.2s'
            }}
          >
            <PaintbrushIcon size={14} />
            <span>{showDevPanel ? 'Collapse Advanced Dev Sandbox' : 'Expand Advanced Dev Sandbox'}</span>
          </button>
        </section>

        {showDevPanel && (
          <div className="dev-panel-drawer animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', width: '100%', marginTop: '16px' }}>
            <Customizer />
            <RenderVisualizer />
          </div>
        )}
      </main>
    </div>
  );
};
