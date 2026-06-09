import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Sound } from '../constants/sounds';
import { Theme } from '../constants/themes';
import { SoundCard } from './SoundCard';

type Props = {
  sounds: Sound[];
  theme: Theme;
  activeId: string | null;
  onSoundPress: (sound: Sound) => void;
  favoriteIds?: string[];
  onFavoriteToggle?: (soundId: string) => void;
};

export function SoundGrid({ sounds, theme, activeId, onSoundPress, favoriteIds = [], onFavoriteToggle }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionLabel, { color: theme.subtext }]}>ALL SOUNDS</Text>
      <View style={styles.row}>
        {sounds.map((item) => (
          <View key={item.id} style={styles.cardWrapper}>
            <SoundCard
              sound={item}
              theme={theme}
              isActive={activeId === item.id}
              isFavorite={favoriteIds.includes(item.id)}
              onPress={() => onSoundPress(item)}
              onFavoritePress={() => onFavoriteToggle?.(item.id)}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 12,
  },
});