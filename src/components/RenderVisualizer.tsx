import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

export const RenderCounterBadge: React.FC<{ name: string }> = ({ name }) => {
  const renders = useRef(0);
  renders.current += 1;

  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    setFlashing(true);
    const timer = setTimeout(() => setFlashing(false), 300);
    return () => clearTimeout(timer);
  }, [renders.current]);

  return (
    <div
      className={`render-badge ${flashing ? 'flash' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        marginLeft: '8px',
        transition: 'all 0.15s ease',
        background: flashing ? 'var(--accent-glow, rgba(168, 85, 247, 0.4))' : 'rgba(0, 0, 0, 0.2)',
        color: flashing ? '#ffffff' : 'var(--text-muted, #888)',
        border: `1px solid ${flashing ? 'var(--accent-color, #a855f7)' : 'rgba(255, 255, 255, 0.1)'}`,
        boxShadow: flashing ? '0 0 8px var(--accent-glow, rgba(168, 85, 247, 0.3))' : 'none',
      }}
    >
      Renders: {renders.current}
    </div>
  );
};

interface RenderLogEntry {
  id: string;
  time: string;
  message: string;
  type: 'theme' | 'state' | 'action';
}

export const RenderVisualizer: React.FC = () => {
  const state = useTheme();
  const [logs, setLogs] = useState<RenderLogEntry[]>([]);
  const renderCount = useRef(0);
  renderCount.current += 1;

  const lastTheme = useRef(state.currentTheme);
  useEffect(() => {
    const time = new Date().toLocaleTimeString();
    const entry: RenderLogEntry = {
      id: Math.random().toString(),
      time,
      message: `Theme updated to "${state.currentTheme.toUpperCase()}" (Preference: "${state.activeTheme}")`,
      type: 'theme',
    };
    setLogs((prev) => [entry, ...prev.slice(0, 14)]);
    lastTheme.current = state.currentTheme;
  }, [state.currentTheme, state.activeTheme]);

  return (
    <div className="render-visualizer-card">
      <div className="card-header">
        <h3>
          React Render Visualizer
          <RenderCounterBadge name="RenderVisualizer" />
        </h3>
        <span className="subtitle">Real-time update stream and rendering statistics</span>
      </div>

      <div className="card-content">
        <div className="metric-row">
          <div className="metric-item">
            <span className="label">Current applied theme</span>
            <span className="value capitalize" style={{ color: 'var(--accent-color)' }}>
              {state.currentTheme}
            </span>
          </div>
          <div className="metric-item">
            <span className="label">System preference</span>
            <span className="value">
              {state.reducedMotion ? 'Reduced Motion (Reduced)' : 'Normal Motion'}
            </span>
          </div>
          <div className="metric-item">
            <span className="label">Sound Effects</span>
            <span className="value">{state.soundsEnabled ? 'ON' : 'OFF'}</span>
          </div>
        </div>

        <div className="log-console">
          <h4>Event Log Stream</h4>
          <div className="log-list">
            {logs.length === 0 ? (
              <div className="log-empty">No events logged yet. Try toggling themes!</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={`log-entry ${log.type}`}>
                  <span className="log-time">[{log.time}]</span>
                  <span className="log-msg">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="perf-explanation">
          <h5>⚡ Performance Note</h5>
          <p>
            The controls on the right (Theme Switches) are optimized. Using split state/actions contexts, they call
            <code>setTheme</code> without triggering parent re-renders. Only theme-dependent values update.
          </p>
        </div>
      </div>
    </div>
  );
};
