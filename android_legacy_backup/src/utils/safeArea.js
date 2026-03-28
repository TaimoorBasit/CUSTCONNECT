import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * The correct top inset to push content below the status bar/camera cutout.
 * 
 * Uses expo-constants' statusBarHeight which is reliably populated before
 * any component renders, unlike StatusBar.currentHeight which can be null
 * at module evaluation time on Android.
 */
export const STATUSBAR_HEIGHT = Platform.OS === 'android'
    ? (Constants.statusBarHeight || 28)
    : 0;
