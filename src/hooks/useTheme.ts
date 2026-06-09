import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, ThemeName, Theme } from '../constants/themes';

const THEME_KEY = 'whitescape_theme';

export function useTheme() {
    const [themeName, setThemeName] = useState<ThemeName>('dark');
  const theme = themes[themeName] as Theme;

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'gray' || saved === 'white') {
        setThemeName(saved as ThemeName);
      }
    });
  }, []);

  const toggleTheme = async () => {
    const order: ThemeName[] = ['dark', 'gray', 'white'];
    const next = order[(order.indexOf(themeName) + 1) % order.length];
    setThemeName(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  };

  const icon = themeName === 'dark' ? '🌙' : themeName === 'gray' ? '☁️' : '☀️';

  return { theme, themeName, toggleTheme, icon };
}