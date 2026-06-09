import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sound } from '../constants/sounds';
import { Theme } from '../constants/themes';

type Props = {
  sound: Sound;
  theme: Theme;
  isLoading: boolean;
  onStop: () => void;
};

export function NowPlayingBar({ sound, theme, isLoading, onStop }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}> 
      <Text style={styles.icon}>{sound.icon}</Text>
      <View style={styles.details}>
        <Text style={[styles.name, { color: theme.text }]}>{sound.name}</Text>
        <Text style={[styles.status, { color: theme.subtext }]}> {isLoading ? 'Loading…' : 'Playing'} </Text>
      </View>
      <TouchableOpacity onPress={onStop} style={styles.stopBtn}>
        <Text style={[styles.stopText, { color: theme.accent }]}>■ STOP</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: { fontSize: 22, marginRight: 12 },
  details: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  status: { fontSize: 12, marginTop: 4 },
  stopBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  stopText: { fontSize: 12, fontWeight: '700' },
});
