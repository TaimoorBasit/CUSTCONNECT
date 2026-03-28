import React, { createContext, useContext, useState } from 'react';
import { lightColors, themeConfig } from '../theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Force Light Theme as per user request
    const [isDarkMode] = useState(false);

    const toggleTheme = () => {
        // Toggle disabled to keep it in light theme
        console.log("Theme toggle is disabled. App is fixed to light theme.");
    };

    const colors = lightColors;

    const theme = {
        colors,
        ...themeConfig,
        isDarkMode,
        toggleTheme
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
