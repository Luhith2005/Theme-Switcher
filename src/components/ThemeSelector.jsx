import React from 'react';
import { useTheme, useThemeActions } from '../hooks/useTheme';
import { 
  SunIcon, 
  MoonIcon, 
  MonitorIcon, 
  SparklesIcon, 
  TreeIcon, 
  TerminalIcon, 
  PaintbrushIcon
} from './Icons';
import { RenderCounterBadge } from './RenderVisualizer';

const ThemeCard = ({ 
  id, 
  label, 
  description, 
  icon, 
  isActive, 
  onClick 
}) => {
  return (
    <button
      type="button"
      className={`theme-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Switch theme to ${label}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '16px',
        borderRadius: '12px',
        border: '2px solid var(--border-color)',
        background: isActive ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all var(--transition-speed, 0.25s) cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        outline: 'none',
      }}
    >
      {isActive && (
        <div className="card-accent-glow" />
      )}

      <div className="card-top" style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div className="icon-wrapper" style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
          {icon}
        </div>
        {isActive && (
          <span className="active-dot" />
        )}
      </div>

      <h4 className="title" style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px', color: 'var(--text-primary)' }}>
        {label}
      </h4>
      <p className="desc" style={{ fontSize: '12px', margin: 0, color: 'var(--text-muted)' }}>
        {description}
      </p>
    </button>
  );
};

export const ThemeSelector = () => {
  const { activeTheme } = useTheme();
  const { setTheme } = useThemeActions();

  const themesList = [
    {
      id: 'system',
      label: 'System Sync',
      description: 'Matches OS preferences dynamically',
      icon: <MonitorIcon size={20} />,
    },
    {
      id: 'light',
      label: 'Light Mode',
      description: 'Soft crisp colors, high contrast',
      icon: <SunIcon size={20} />,
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      description: 'Cool slate colors, reduced strain',
      icon: <MoonIcon size={20} />,
    },
    {
      id: 'midnight',
      label: 'Midnight Spark',
      description: 'High saturation, rich neon purple',
      icon: <SparklesIcon size={20} />,
    },
    {
      id: 'forest',
      label: 'Forest Calm',
      description: 'Muted natural greens and cream text',
      icon: <TreeIcon size={20} />,
    },
    {
      id: 'cyberpunk',
      label: 'Cyberpunk 2099',
      description: 'High energy electric neon yellow',
      icon: <TerminalIcon size={20} />,
    },
    {
      id: 'custom',
      label: 'Custom Builder',
      description: 'Craft your own HSL parameters',
      icon: <PaintbrushIcon size={20} />,
    },
  ];

  return (
    <div className="theme-selector-panel">
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <h3>
          Choose Theme Style
          <RenderCounterBadge name="ThemeSelector" />
        </h3>
        <span className="subtitle">Select a preset flavor or customize your own sandbox layout.</span>
      </div>

      <div className="themes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        {themesList.map((theme) => (
          <ThemeCard
            key={theme.id}
            id={theme.id}
            label={theme.label}
            description={theme.description}
            icon={theme.icon}
            isActive={activeTheme === theme.id}
            onClick={() => setTheme(theme.id)}
          />
        ))}
      </div>
    </div>
  );
};
