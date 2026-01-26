
import { StyleSheet } from 'react-native';

export const colors = {
  light: {
    background: 'hsl(140, 25%, 98%)',
    backgroundRgb: 'rgb(245, 252, 248)',
    card: 'hsl(140, 25%, 95%)',
    cardRgb: 'rgb(237, 247, 242)',
    primary: 'hsl(152, 75%, 45%)',
    primaryRgb: 'rgb(29, 200, 130)',
    secondary: 'hsl(160, 60%, 50%)',
    secondaryRgb: 'rgb(51, 204, 153)',
    accent: 'hsl(85, 70%, 50%)',
    accentRgb: 'rgb(174, 217, 38)',
    text: 'hsl(140, 25%, 15%)',
    textRgb: 'rgb(29, 48, 38)',
    textSecondary: 'hsl(140, 15%, 45%)',
    textSecondaryRgb: 'rgb(98, 122, 108)',
    border: 'hsl(140, 20%, 85%)',
    borderRgb: 'rgb(209, 227, 217)',
  },
  dark: {
    background: 'hsl(240, 3%, 11%)',
    backgroundRgb: 'rgb(28, 28, 30)',
    card: 'hsl(240, 3%, 14%)',
    cardRgb: 'rgb(36, 36, 38)',
    primary: 'hsl(152, 75%, 45%)',
    primaryRgb: 'rgb(29, 200, 130)',
    secondary: 'hsl(160, 60%, 50%)',
    secondaryRgb: 'rgb(51, 204, 153)',
    accent: 'hsl(85, 70%, 50%)',
    accentRgb: 'rgb(174, 217, 38)',
    text: 'hsl(0, 0%, 95%)',
    textRgb: 'rgb(242, 242, 242)',
    textSecondary: 'hsl(0, 0%, 65%)',
    textSecondaryRgb: 'rgb(166, 166, 166)',
    border: 'hsl(240, 3%, 20%)',
    borderRgb: 'rgb(51, 51, 54)',
  },
};

export const commonStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    width: '100%',
  },
});
