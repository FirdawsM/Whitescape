import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Theme } from "../constants/themes";

type Props = {
  theme: Theme;
  themeName: string;
  icon: string;
  onToggleTheme: () => void;
  onOpenTimer: () => void;
  onOpenMenu: () => void;
  isTimerActive: boolean;
};

export function HeaderBar({
  theme,
  icon,
  onToggleTheme,
  onOpenTimer,
  onOpenMenu,
  isTimerActive,
}: Props) {
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.titles}>
        <Text style={[styles.title, { color: theme.text }]}>Whitescape</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          Find your frequency
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onToggleTheme} style={styles.actionButton}>
          <Text style={styles.actionIcon}>{icon}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenTimer} style={styles.actionButton}>
          <Text
            style={[
              styles.actionIcon,
              { color: isTimerActive ? theme.accent : theme.text },
            ]}
          >
            ⏱
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenMenu} style={styles.actionButton}>
          <Text style={[styles.actionIcon, { color: theme.text }]}>⋮</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titles: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  actionIcon: {
    fontSize: 20,
  },
});
