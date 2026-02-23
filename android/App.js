import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import WelcomeScreen from './src/screens/WelcomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import GPACalculatorScreen from './src/screens/GPACalculatorScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const renderScreen = () => {
    // Basic navigation logic
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onStart={() => setCurrentScreen('register')}
            onLogin={() => setCurrentScreen('login')}
            onForgotPassword={() => setCurrentScreen('forgot-password')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={() => { setIsLoggedIn(true); setCurrentScreen('dashboard'); }}
            onBack={() => setCurrentScreen('welcome')}
            onForgotPassword={() => setCurrentScreen('forgot-password')}
            onRegister={() => setCurrentScreen('register')}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onRegisterSuccess={() => setCurrentScreen('login')}
            onBack={() => setCurrentScreen('welcome')}
            onLogin={() => setCurrentScreen('login')}
          />
        );
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            onLogout={() => { setIsLoggedIn(false); setCurrentScreen('welcome'); }}
          />
        );
      case 'gpa':
        return <GPACalculatorScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'resources':
        return <ResourcesScreen onBack={() => setCurrentScreen('dashboard')} />;
      case 'forgot-password':
        return (
          <ForgotPasswordScreen
            onBack={() => setCurrentScreen('welcome')}
            onResetSent={() => setCurrentScreen('reset-password')}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordScreen
            onComplete={() => setCurrentScreen('welcome')}
          />
        );
      default:
        return <WelcomeScreen onStart={() => setCurrentScreen('dashboard')} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7F4',
  },
});
