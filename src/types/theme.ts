export type ThemeType = 'light' | 'dark' | 'midnight' | 'forest' | 'cyberpunk' | 'custom';

export type ThemeOption = ThemeType | 'system';

export interface CustomThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
}

export interface ThemeState {
  activeTheme: ThemeOption; // Selected theme option (can be 'system')
  currentTheme: ThemeType;   // The theme currently applied ('light', 'dark', etc.)
  customThemeColors: CustomThemeColors;
  animationsEnabled: boolean;
  soundsEnabled: boolean;
  reducedMotion: boolean;
}

export interface ThemeActions {
  setTheme: (theme: ThemeOption) => void;
  updateCustomColors: (colors: Partial<CustomThemeColors>) => void;
  toggleAnimations: () => void;
  toggleSounds: () => void;
  resetToSystem: () => void;
}
