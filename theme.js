import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const scheme = useColorScheme();
  return {
    colors: {
      primary: scheme === 'dark' ? '#1a1a1a' : '#3b3f40',
      background: scheme === 'dark' ? '#121212' : '#ffffff',
      text: scheme === 'dark' ? '#ffffff' : '#1a1a1a',
      accent: '#007AFF',
      card: 'rgba(255, 255, 255, 0.25)',
      border: 'rgba(255, 255, 255, 0.3)',
    },
    spacing: {
      small: 8,
      medium: 16,
      large: 24,
    },
    fonts: {
      regular: 'AvenirNext-Regular',
      bold: 'AvenirNext-Bold',
      italic: 'AvenirNext-Italic',
    },
  };
};