import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import WelcomeScreen from './src/screens/WelcomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import GPACalculatorScreen from './src/screens/GPACalculatorScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
import { storage } from './src/utils/storage';

// Reliable status bar height using expo-constants
// StatusBar.currentHeight can be null at module evaluation time on Android
const STATUS_BAR_H = Platform.OS === 'android' ? (Constants.statusBarHeight || 28) : 0;

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    checkPersistedSession();
  }, []);

  const checkPersistedSession = async () => {
    try {
      const token = await storage.getToken();
      const savedUser = await storage.getUser();
      if (token && savedUser) {
        setUser(savedUser);
        setCurrentScreen('dashboard');
      }
    } catch (e) {
      // Storage error — start fresh
    }
  };

  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    await storage.clear();
    setUser(null);
    setCurrentScreen('welcome');
  };

  const navigate = (screen) => setCurrentScreen(screen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onStart={() => navigate('register')}
            onLogin={() => navigate('login')}
            onForgotPassword={() => navigate('forgot-password')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onBack={() => navigate('welcome')}
            onForgotPassword={() => navigate('forgot-password')}
            onRegister={() => navigate('register')}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onRegisterSuccess={() => navigate('login')}
            onBack={() => navigate('welcome')}
            onLogin={() => navigate('login')}
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen
            user={user}
            onNavigate={navigate}
            onLogout={handleLogout}
          />
        );
      case 'gpa':
        return <GPACalculatorScreen onBack={() => navigate('dashboard')} />;
      case 'resources':
        return <ResourcesScreen onBack={() => navigate('dashboard')} />;
      case 'forgot-password':
        return (
          <ForgotPasswordScreen
            onBack={() => navigate('login')}
            onResetSent={() => navigate('reset-password')}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordScreen
            onComplete={() => navigate('login')}
          />
        );
      default:
        return <WelcomeScreen onStart={() => navigate('register')} onLogin={() => navigate('login')} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 
        translucent={false} = status bar is opaque and occupies real space.
        We add paddingTop manually so content starts below it.
      */}
      <StatusBar style="dark" translucent={false} backgroundColor={colors.background} />
      <View style={[styles.content, { paddingTop: STATUS_BAR_H }]}>
        {renderScreen()}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
