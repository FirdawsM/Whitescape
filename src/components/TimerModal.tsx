import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Theme } from '../constants/themes';

const TIMER_OPTIONS = [15, 30, 45, 60, 90, 120];

type Props = {
  visible: boolean;
  theme: Theme;
  isRunning: boolean;
  onSelect: (minutes: number) => void;
  onCancelTimer: () => void;
  onClose: () => void;
};

export function TimerModal({ visible, theme, isRunning, onSelect, onCancelTimer, onClose }: Props) {
  const [customMinutes, setCustomMinutes] = useState('');

  const submitCustomTimer = () => {
    const minutes = Number(customMinutes);
    if (minutes > 0) {
      onSelect(minutes);
      setCustomMinutes('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.box, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <Text style={[styles.title, { color: theme.text }]}>Sleep Timer</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>Sound stops automatically after...</Text>
          <View style={styles.timerGrid}>
            {TIMER_OPTIONS.map((mins) => (
              <TouchableOpacity
                key={mins}
                onPress={() => onSelect(mins)}
                style={[styles.timerOption, { backgroundColor: theme.background, borderColor: theme.accent }]}
              >
                <Text style={[styles.timerMins, { color: theme.accent }]}>{mins}</Text>
                <Text style={[styles.timerLabel, { color: theme.subtext }]}>min</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={customMinutes}
            onChangeText={setCustomMinutes}
            keyboardType="numeric"
            placeholder="Custom minutes"
            placeholderTextColor={theme.subtext}
            style={[styles.customInput, { color: theme.text, borderColor: theme.border }]}
          />
          <TouchableOpacity onPress={submitCustomTimer} style={styles.customButton}>
            <Text style={[styles.customButtonText, { color: theme.accent }]}>Set Custom Timer</Text>
          </TouchableOpacity>
          {isRunning && (
            <TouchableOpacity onPress={onCancelTimer} style={styles.cancelButton}>
              <Text style={[styles.cancelText, { color: 'tomato' }]}>Cancel Timer</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: theme.subtext }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  box: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    maxHeight: '90%',
  },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  timerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  timerOption: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
  },
  timerMins: { fontSize: 24, fontWeight: '700' },
  timerLabel: { fontSize: 11 },
  customInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 14,
    width: '100%',
  },
  customButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
  customButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cancelButton: { marginTop: 12, alignSelf: 'center' },
  cancelText: { textAlign: 'center', fontSize: 14, fontWeight: '700' },
  closeButton: { marginTop: 16, alignSelf: 'center' },
  closeText: { textAlign: 'center', fontSize: 14 },
});
