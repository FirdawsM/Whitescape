import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { Sound } from '../constants/sounds';
import { Theme } from '../constants/themes';

type Props = {
  sound: Sound;
  theme: Theme;
  isActive: boolean;
  isFavorite: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function SoundCard({ sound, theme, isActive, isFavorite, onPress, onFavoritePress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.035 : 1,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [isActive, scale]);

  return (
    <AnimatedTouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, { transform: [{ scale }] }]}
    >
      <View
        style={[
          styles.cardContainer,
          {
            borderColor: isActive ? theme.accent : theme.border,
            backgroundColor: theme.card,
          },
        ]}
      >
        <TouchableOpacity onPress={onFavoritePress} style={styles.favoriteButton}>
          <Text style={[styles.favoriteIcon, { color: isFavorite ? '#FF6D92' : theme.subtext }]}> {isFavorite ? '❤️' : '🤍'} </Text>
        </TouchableOpacity>
        <Text style={styles.icon}>{sound.icon}</Text>
        <Text style={[styles.soundName, { color: theme.text }]}>{sound.name}</Text>
        <Text style={[styles.vibe, { color: theme.subtext }]}>{sound.vibe}</Text>
        {isActive ? (
          <View style={[styles.playingBadge, { backgroundColor: theme.accentGlow }]}> 
            <Text style={[styles.playingBadgeText, { color: theme.accent }]}>Playing</Text>
          </View>
        ) : null}
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 16,
    flex: 1,
    minWidth: 160,
  },
  cardContainer: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    minHeight: 170,
    justifyContent: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 1,
  },
  favoriteIcon: {
    fontSize: 18,
  },
  icon: { fontSize: 42, marginBottom: 10 },
  soundName: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  vibe: { fontSize: 12, textAlign: 'center', marginTop: 4 },
  playingBadge: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  playingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
