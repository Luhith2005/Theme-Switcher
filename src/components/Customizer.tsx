import React from 'react';
import { useTheme, useThemeActions } from '../hooks/useTheme';
import type { CustomThemeColors } from '../types/theme';
import { PaintbrushIcon } from './Icons';
import { RenderCounterBadge } from './RenderVisualizer';

interface CustomPreset {
  name: string;
  colors: CustomThemeColors;
}

const CUSTOM_PRESETS: CustomPreset[] = [
  {
    name: 'Neon Velvet',
    colors: {
      primary: '#d946ef',
      background: '#0a0516',
      surface: '#160d2b',
      text: '#fdfaff',
      accent: '#06b6d4',
    },
  },
  {
    name: 'Cyberpunk Toxic',
    colors: {
      primary: '#facc15',
      background: '#090d16',
      surface: '#111827',
      text: '#38bdf8',
      accent: '#f43f5e',
    },
  },
  {
    name: 'Warm Sunset',
    colors: {
      primary: '#f97316',
      background: '#1c1917',
      surface: '#292524',
      text: '#fafaf9',
      accent: '#e11d48',
    },
  },
  {
    name: 'Deep Oceanic',
    colors: {
      primary: '#3b82f6',
      background: '#020617',
      surface: '#0f172a',
      text: '#f8fafc',
      accent: '#10b981',
    },
  },
];

export const Customizer: React.FC = () => {
  const { currentTheme, customThemeColors } = useTheme();
  const { updateCustomColors, setTheme } = useThemeActions();

  const handleColorChange = (key: keyof CustomThemeColors, value: string) => {
    updateCustomColors({ [key]: value });
  };

  const applyPreset = (presetColors: CustomThemeColors) => {
    updateCustomColors(presetColors);
    if (currentTheme !== 'custom') {
      setTheme('custom');
    }
  };

  const exportCSS = () => {
    const cssText = `/* Custom Theme Variable Export */
:root[data-theme="custom"] {
  --custom-primary: ${customThemeColors.primary};
  --custom-background: ${customThemeColors.background};
  --custom-surface: ${customThemeColors.surface};
  --custom-text: ${customThemeColors.text};
  --custom-accent: ${customThemeColors.accent};
}`;
    
    try {
      navigator.clipboard.writeText(cssText);
      alert('CSS variables copied to clipboard!');
    } catch (err) {
      alert('Failed to copy code. Here is the CSS:\n\n' + cssText);
    }
  };

  const colorLabels: Record<keyof CustomThemeColors, string> = {
    primary: 'Primary Accent',
    background: 'Root Background',
    surface: 'Surface Card Background',
    text: 'Main Text Content',
    accent: 'Secondary Glow / Badge',
  };

  return (
    <div className="customizer-card">
      <div className="card-header">
        <h3>
          Custom Theme Builder
          <RenderCounterBadge name="Customizer" />
        </h3>
        <span className="subtitle">Tune custom values. Activate custom theme to see live changes.</span>
      </div>

      {currentTheme !== 'custom' && (
        <div className="customizer-warning" style={{
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'var(--accent-color)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <PaintbrushIcon size={16} />
          <span>Note: Select the <strong>Custom Builder</strong> preset to preview your inputs.</span>
        </div>
      )}

      <div className="card-content">
        <div className="customizer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          
          {/* Preset Swatches */}
          <div className="presets-section">
            <h4>Quick Color Presets</h4>
            <div className="presets-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {CUSTOM_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset.colors)}
                  className="preset-btn"
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontWeight: 'bold' }}>{preset.name}</span>
                  <div className="preset-swatches" style={{ display: 'flex', gap: '3px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.colors.primary }} />
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.colors.background }} />
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.colors.surface }} />
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.colors.accent }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker Sliders */}
          <div className="pickers-section">
            <h4>Fine Tune Variable Colors</h4>
            <div className="pickers-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(Object.keys(customThemeColors) as Array<keyof CustomThemeColors>).map((key) => (
                <div key={key} className="picker-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label htmlFor={`color-${key}`} style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {colorLabels[key]}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                      {customThemeColors[key]}
                    </span>
                    <input
                      type="color"
                      id={`color-${key}`}
                      value={customThemeColors[key]}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      style={{
                        width: '32px',
                        height: '24px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={exportCSS}
          className="export-btn"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--accent-color)',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.2s',
            boxShadow: '0 4px 6px var(--accent-glow)'
          }}
        >
          Export & Copy Custom Theme CSS
        </button>
      </div>
    </div>
  );
};
