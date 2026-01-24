import { Platform } from 'react-native';

function normalizeHex(hex) {
  if (!hex) return '#000000';
  if (hex.startsWith('#')) hex = hex.slice(1);
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return hex;
}

function hexToRgba(hex, alpha = 1) {
  try {
    const h = normalizeHex(hex);
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch (e) {
    return `rgba(0, 0, 0, ${alpha})`;
  }
}

export default function boxShadow(shadowColor = '#000', offsetHeight = 2, radius = 4, opacity = 0.1) {
  if (Platform.OS !== 'web') return undefined;
  const color = hexToRgba(shadowColor, opacity);
  return `0px ${offsetHeight}px ${radius}px ${color}`;
}
