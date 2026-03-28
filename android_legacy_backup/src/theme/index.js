export const lightColors = {
    primary: '#A51C30', // Harvard Crimson
    primaryLight: '#C32E41',
    secondary: '#1a2744', // Dark Navy
    secondaryLight: '#2c3e66',
    accent: '#059669', // Emerald
    background: '#F8F7F4', // Off-white/Cream
    surface: '#FFFFFF',
    text: {
        primary: '#1a2744',
        secondary: '#64748b',
        light: '#94a3b8',
        white: '#FFFFFF',
    },
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#10b981',
    card: '#FFFFFF',
    overlay: 'rgba(26, 39, 68, 0.85)',
};

export const darkColors = {
    primary: '#A51C30',
    primaryLight: '#C32E41',
    secondary: '#E2E8F0', // Light Grey/Off-white for contrast
    secondaryLight: '#94A3B8',
    accent: '#10B981',
    background: '#0F172A', // Slate 900
    surface: '#1E293B', // Slate 800
    text: {
        primary: '#F8FAFC', // Slate 50
        secondary: '#CBD5E1', // Slate 300
        light: '#64748B', // Slate 500
        white: '#FFFFFF',
    },
    border: '#334155', // Slate 700
    error: '#f87171',
    success: '#34d399',
    card: '#1E293B',
    overlay: 'rgba(15, 23, 42, 0.9)',
};

export const themeConfig = {
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 40,
    },
    roundness: {
        xs: 8,
        sm: 12,
        md: 20,
        lg: 30,
        xl: 40,
        full: 999,
    },
    shadows: {
        sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
        md: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
        lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 10 },
    }
};

// For backward compatibility while we refactor
export const theme = {
    colors: lightColors,
    ...themeConfig
};
