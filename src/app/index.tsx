import { AdBanner } from "../components/AdBanner";
import { useInterstitialAd } from "../hooks/useAds";
import { logger } from "../utils/logger";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../hooks/useTheme";
import { useAudio } from "../hooks/useAudio";
import { useTimer } from "../hooks/useTimer";
import { SOUNDS, SOUND_MAP, Sound, SoundCategory } from "../constants/sounds";
import { SoundCard as SoundCardComponent } from "../components/SoundCard";
import { SoundVisualizer } from "../components/SoundVisualizer";
import { TimerModal } from "../components/TimerModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Share,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = "48%";
const VISUALIZER_EXPANDED_HEIGHT = 260;
const VISUALIZER_MINIMIZED_HEIGHT = 92;
const FULLSCREEN_VISUALIZER_HEIGHT = height;
const ONBOARDING_KEY = "whitescape_onboarding_seen";
const FAVORITES_KEY = "whitescape_favorites";
const CATEGORIES: Array<"All" | SoundCategory> = [
  "All",
  "Relax",
  "Study",
  "Walk",
  "Focus",
  "Hangout",
];

type Page = "home" | "favorites" | "referrals";

export default function HomeScreen() {
  const { theme, themeName, toggleTheme } = useTheme();
  const { activeId, isLoading, error, playSound, stopSound } = useAudio();
  const { start, stop, isRunning, display } = useTimer(() => stopSound());
  const [showTimer, setShowTimer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [page, setPage] = useState<Page>("home");
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | SoundCategory
  >("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [isVisualizerExpanded, setIsVisualizerExpanded] = useState(true);
  const [showFullScreenVisualizer, setShowFullScreenVisualizer] =
    useState(false);
  const [displayedSound, setDisplayedSound] = useState<Sound | undefined>();
  const [showPlayerCard, setShowPlayerCard] = useState(false);
  const { showAd, loaded: adLoaded } = useInterstitialAd();

  useEffect(() => {
    const initReferral = async () => {
      try {
        let code = await SecureStore.getItemAsync("whitescape_referral_code");

        // Migration from AsyncStorage if needed
        if (!code) {
          const oldCode = await AsyncStorage.getItem(
            "whitescape_referral_code",
          );
          if (oldCode) {
            code = oldCode;
            await SecureStore.setItemAsync("whitescape_referral_code", code);
            await AsyncStorage.removeItem("whitescape_referral_code");
          }
        }

        if (code) {
          setReferralCode(code);
        } else {
          const newCode = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();
          setReferralCode(newCode);
          await SecureStore.setItemAsync("whitescape_referral_code", newCode);
        }
      } catch (error) {
        logger.warn("Referral init failed", error);
      }
    };
    initReferral();
  }, []);

  const expoLink =
    "https://expo.dev/accounts/alnuur/projects/whitescape/builds/192f4552-5898-45ff-ae31-03bae0d497f4";

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
        const onboardingSeen = await AsyncStorage.getItem(ONBOARDING_KEY);

        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
        setShowOnboarding(onboardingSeen !== "true");
      } catch (error) {
        logger.warn("Failed to load app state", error);
      }
    };

    loadState();
  }, []);

  const saveFavorites = async (ids: string[]) => {
    setFavorites(ids);
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    } catch (error) {
      logger.warn("Could not save favorites", error);
    }
  };

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((favoriteId) => favoriteId !== id)
      : [...favorites, id];

    saveFavorites(updated);
  };

  const handleDismissOnboarding = async () => {
    setShowOnboarding(false);
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch (error) {
      logger.warn("Onboarding save failed", error);
    }
  };

  const handleSoundPress = (sound: Sound) => {
    if (activeId && activeId !== sound.id) {
      const currentSound = SOUND_MAP[activeId];
      Alert.alert(
        "Switch sound?",
        `Stop ${currentSound?.name ?? "current sound"} and play ${sound.name}?`,
        [
          { text: "Keep Playing", style: "cancel" },
          {
            text: "Switch",
            onPress: () => {
              showAd();
              playSound(sound.id);
            },
          },
        ],
      );
      return;
    }

    playSound(sound.id);
  };

  const handleTimerSelect = (minutes: number) => {
    start(minutes);
    setShowTimer(false);
  };

  const handleCancelTimer = () => {
    stop();
    setShowTimer(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: "Share Whitescape",
        message: `Check out Whitescape on Expo: ${expoLink}?ref=${referralCode}`,
      });
    } catch (error) {
      logger.warn("Share failed", error);
    }
  };

  const filteredSounds = useMemo(() => {
    const source =
      page === "favorites"
        ? SOUNDS.filter((sound) => favorites.includes(sound.id))
        : SOUNDS;

    return selectedCategory === "All"
      ? source
      : source.filter((sound) => sound.category === selectedCategory);
  }, [favorites, page, selectedCategory]);

  const activeSound = activeId ? SOUND_MAP[activeId] : undefined;
  const visualizerHeight = isVisualizerExpanded
    ? VISUALIZER_EXPANDED_HEIGHT
    : VISUALIZER_MINIMIZED_HEIGHT;

  const playAdjacentSound = (direction: 1 | -1) => {
    const currentId = activeId ?? displayedSound?.id;
    const currentIndex = SOUNDS.findIndex((sound) => sound.id === currentId);
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex + direction + SOUNDS.length) % SOUNDS.length;

    const nextSound = SOUNDS[nextIndex];
    setDisplayedSound(nextSound);
    setShowPlayerCard(true);
    setShowFullScreenVisualizer(true);
    playSound(nextSound.id);
  };

  useEffect(() => {
    if (activeSound) {
      setDisplayedSound(activeSound);
      setShowPlayerCard(true);
      setIsVisualizerExpanded(true);
      setShowFullScreenVisualizer(true);
    }
  }, [activeId]);

  const toggleDisplayedSound = () => {
    if (!displayedSound) return;

    if (activeSound) {
      stopSound();
      return;
    }

    setShowPlayerCard(true);
    playSound(displayedSound.id);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={themeName === "white" ? "dark-content" : "light-content"}
        backgroundColor={theme.background}
      />
      <SafeAreaView style={styles.safe}>
        <View style={[styles.topBar, { backgroundColor: theme.background }]}>
          <View style={styles.topTitle}>
            <Text style={[styles.title, { color: theme.text }]}>
              Whitescape
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
              Find your frequency
            </Text>
          </View>

          <View style={styles.rightActions}>
            <TouchableOpacity
              onPress={() => setShowTimer(true)}
              style={styles.topActionButton}
            >
              <Text style={[styles.topActionText, { color: theme.text }]}>
                ⏱
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowMenu(true)}
              style={[styles.menuButton, styles.menuRightButton]}
            >
              <Text style={[styles.menuIcon, { color: theme.text }]}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showPlayerCard && displayedSound ? (
          <View
            style={[
              styles.playerCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={styles.playerHeader}>
              <Text style={styles.playerIcon}>{displayedSound.icon}</Text>
              <View style={styles.playerDetails}>
                <Text
                  style={[styles.playerName, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {displayedSound.name}
                </Text>
                <Text style={[styles.playerStatus, { color: theme.subtext }]}>
                  {isLoading ? "Loading" : activeSound ? "Playing" : "Paused"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsVisualizerExpanded((expanded) => !expanded)}
                style={[styles.miniHandleButton, { borderColor: theme.border }]}
              >
                <View
                  style={[
                    styles.miniHandleLine,
                    { backgroundColor: theme.text },
                  ]}
                />
                <View
                  style={[
                    styles.miniHandleLine,
                    styles.miniHandleLineShort,
                    { backgroundColor: theme.text },
                  ]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFullScreenVisualizer(true)}
                style={[styles.playerIconButton, { borderColor: theme.border }]}
              >
                <Text
                  style={[styles.fullscreenButtonText, { color: theme.text }]}
                >
                  ⛶
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleDisplayedSound}
                style={[styles.stopButton, { borderColor: theme.border }]}
              >
                <Text style={[styles.stopButtonText, { color: theme.accent }]}>
                  {activeSound ? "■" : "▶"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => setShowFullScreenVisualizer(true)}
              style={[
                styles.visualizerFrame,
                { height: visualizerHeight, backgroundColor: theme.timerBg },
              ]}
            >
              <SoundVisualizer
                soundKey={displayedSound.id}
                isPlaying={!isLoading && !!activeSound}
                isVisible={!!displayedSound}
                viewportHeight={visualizerHeight}
              />
            </TouchableOpacity>
          </View>
        ) : null}

        {error ? (
          <View
            style={[
              styles.banner,
              { backgroundColor: theme.card, borderColor: theme.accent },
            ]}
          >
            <Text style={[styles.bannerText, { color: theme.accent }]}>
              {error}
            </Text>
          </View>
        ) : null}

        {isRunning ? (
          <View
            style={[
              styles.timerBar,
              { backgroundColor: theme.timerBg, borderColor: theme.accent },
            ]}
          >
            <Text style={[styles.timerText, { color: theme.accent }]}>
              ⏱ {display} remaining — tap the timer button to change
            </Text>
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {page === "home" || page === "favorites" ? (
            <>
              <Text style={[styles.sectionLabel, { color: theme.subtext }]}>
                {" "}
                {page === "home" ? "ALL SOUNDS" : "FAVORITES"}{" "}
              </Text>
              <ScrollView
                style={styles.chipScroll}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipContainer}
              >
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor:
                          selectedCategory === category
                            ? theme.accent
                            : theme.card,
                        borderColor:
                          selectedCategory === category
                            ? theme.accent
                            : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color:
                            selectedCategory === category
                              ? "#fff"
                              : theme.subtext,
                        },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredSounds.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    No sounds found
                  </Text>
                  <Text style={[styles.emptyCopy, { color: theme.subtext }]}>
                    Try a different category or add a favorite.
                  </Text>
                </View>
              ) : (
                <View style={styles.row}>
                  {filteredSounds.map((sound) => (
                    <View key={sound.id} style={styles.cardWrapper}>
                      <SoundCardComponent
                        sound={sound}
                        theme={theme}
                        isActive={activeId === sound.id}
                        isFavorite={favorites.includes(sound.id)}
                        onPress={() => handleSoundPress(sound)}
                        onFavoritePress={() => toggleFavorite(sound.id)}
                      />
                    </View>
                  ))}
                </View>
              )}

              {page === "home" && (
                <Text style={[styles.soonText, { color: theme.subtext }]}>
                  More sounds coming soon
                </Text>
              )}
            </>
          ) : (
            <View style={styles.pageContent}>
              <Text style={[styles.pageTitle, { color: theme.text }]}>
                Referral Program
              </Text>
              <Text style={[styles.pageCopy, { color: theme.subtext }]}>
                Share Whitescape with friends using a safe Expo link. Your
                referral code never tracks personal details.
              </Text>
              <View
                style={[
                  styles.codeCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.codeLabel, { color: theme.subtext }]}>
                  Your referral code
                </Text>
                <Text style={[styles.codeValue, { color: theme.text }]}>
                  {referralCode}
                </Text>
                <Text style={[styles.linkText, { color: theme.accent }]}>
                  {expoLink}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleShare}
                style={[styles.ctaButton, { backgroundColor: theme.accent }]}
              >
                <Text style={styles.ctaText}>Share your referral link</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <TimerModal
          visible={showTimer}
          theme={theme}
          isRunning={isRunning}
          onSelect={handleTimerSelect}
          onCancelTimer={handleCancelTimer}
          onClose={() => setShowTimer(false)}
        />

        <Modal visible={showMenu} transparent animationType="fade">
          <View style={styles.menuOverlay}>
            <TouchableOpacity
              style={styles.menuBackdrop}
              activeOpacity={1}
              onPress={() => setShowMenu(false)}
            />
            <View
              style={[
                styles.menuBox,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text
                style={[
                  styles.menuTitle,
                  {
                    color: theme.text,
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                Settings
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setPage("home");
                  setShowMenu(false);
                }}
                style={styles.menuItem}
              >
                <Text style={[styles.menuText, { color: theme.text }]}>
                  Home
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setPage("favorites");
                  setShowMenu(false);
                }}
                style={styles.menuItem}
              >
                <Text style={[styles.menuText, { color: theme.text }]}>
                  Favorites
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setPage("referrals");
                  setShowMenu(false);
                }}
                style={styles.menuItem}
              >
                <Text style={[styles.menuText, { color: theme.text }]}>
                  Referrals
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  toggleTheme();
                  setShowMenu(false);
                }}
                style={styles.menuItem}
              >
                <Text style={[styles.menuText, { color: theme.text }]}>
                  Toggle theme ({themeName})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleShare();
                  setShowMenu(false);
                }}
                style={styles.menuItem}
              >
                <Text style={[styles.menuText, { color: theme.text }]}>
                  Share app
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowTimer(true);
                  setShowMenu(false);
                }}
                style={styles.menuItem}
              >
                <Text style={[styles.menuText, { color: theme.text }]}>
                  Set timer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <AdBanner />

        <Modal
          visible={showFullScreenVisualizer && !!displayedSound}
          animationType="fade"
        >
          {displayedSound ? (
            <View
              style={[
                styles.fullscreenPlayer,
                { backgroundColor: theme.background },
              ]}
            >
              <SoundVisualizer
                soundKey={displayedSound.id}
                isPlaying={!isLoading && !!activeSound}
                isVisible={!!displayedSound}
                viewportHeight={FULLSCREEN_VISUALIZER_HEIGHT}
              />

              <View style={styles.fullscreenVignette} />

              <SafeAreaView style={styles.fullscreenOverlay}>
                <View style={styles.fullscreenTopBar}>
                  <TouchableOpacity
                    onPress={() => setShowFullScreenVisualizer(false)}
                    style={styles.collapseHandle}
                  >
                    <View style={styles.collapseLine} />
                    <View
                      style={[styles.collapseLine, styles.collapseLineShort]}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowTimer(true);
                    }}
                    style={styles.glassControl}
                  >
                    <Text style={styles.timerControlText}>⏱</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.fullscreenCenter}>
                  <Text style={styles.fullscreenEyebrow}>
                    {isLoading
                      ? "LOADING"
                      : activeSound
                        ? "NOW PLAYING"
                        : "PAUSED"}
                  </Text>
                  <Text style={styles.fullscreenTitle} numberOfLines={2}>
                    {displayedSound.name}
                  </Text>
                  <Text style={styles.fullscreenSubtitle} numberOfLines={1}>
                    {displayedSound.vibe}
                  </Text>
                </View>

                <View style={styles.transportPanel}>
                  {isRunning ? (
                    <Text style={styles.fullscreenTimer}>
                      {display} remaining
                    </Text>
                  ) : (
                    <Text style={styles.fullscreenTimer}>No timer set</Text>
                  )}

                  <View style={styles.transportRow}>
                    <TouchableOpacity
                      onPress={() => playAdjacentSound(-1)}
                      style={styles.transportButton}
                    >
                      <Text style={styles.transportButtonText}>‹‹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={toggleDisplayedSound}
                      style={styles.primaryTransportButton}
                    >
                      <Text style={styles.primaryTransportText}>
                        {activeSound ? "■" : "▶"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => playAdjacentSound(1)}
                      style={styles.transportButton}
                    >
                      <Text style={styles.transportButtonText}>››</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
            </View>
          ) : null}
        </Modal>

        <Modal visible={showOnboarding} animationType="slide" transparent>
          <View style={styles.onboardingOverlay}>
            <View
              style={[
                styles.onboardingCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.onboardingTitle, { color: theme.text }]}>
                Welcome to Whitescape
              </Text>
              <Text style={[styles.onboardingCopy, { color: theme.subtext }]}>
                Find your perfect sound for relaxing, studying, walking,
                focusing, or hanging out. Pick a category, tap a card, favorite
                what you love, and set a timer to stay in the zone.
              </Text>
              <View style={styles.onboardingSteps}>
                <View style={styles.stepRow}>
                  <Text style={[styles.stepBullet, { color: theme.accent }]}>
                    1
                  </Text>
                  <Text style={[styles.stepText, { color: theme.text }]}>
                    Browse categories to match your mood.
                  </Text>
                </View>
                <View style={styles.stepRow}>
                  <Text style={[styles.stepBullet, { color: theme.accent }]}>
                    2
                  </Text>
                  <Text style={[styles.stepText, { color: theme.text }]}>
                    Tap to play and save favorites.
                  </Text>
                </View>
                <View style={styles.stepRow}>
                  <Text style={[styles.stepBullet, { color: theme.accent }]}>
                    3
                  </Text>
                  <Text style={[styles.stepText, { color: theme.text }]}>
                    Use the timer for focus sessions and get a notification when
                    time is up.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.ctaButton,
                  { backgroundColor: theme.accent, marginTop: 12 },
                ]}
                onPress={handleDismissOnboarding}
              >
                <Text style={styles.ctaText}>Start exploring</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  topTitle: {
    flex: 1,
  },
  title: { fontSize: 30, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 2, lineHeight: 16 },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  menuRightButton: {
    marginLeft: 10,
  },
  menuIcon: { fontSize: 24 },
  topActionButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  topActionText: { fontSize: 18 },
  playerCard: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
    overflow: "hidden",
  },
  playerHeader: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  playerIcon: {
    width: 36,
    fontSize: 24,
    marginRight: 10,
    textAlign: "center",
  },
  playerDetails: {
    flex: 1,
    minWidth: 0,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "800",
  },
  playerStatus: {
    fontSize: 12,
    marginTop: 3,
    fontWeight: "600",
  },
  playerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  miniHandleButton: {
    width: 42,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  miniHandleLine: {
    width: 18,
    height: 2,
    borderRadius: 2,
    marginVertical: 2,
  },
  miniHandleLineShort: {
    width: 12,
    opacity: 0.65,
  },
  playerIconButtonText: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 24,
  },
  fullscreenButtonText: {
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 22,
  },
  stopButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  stopButtonText: {
    fontSize: 12,
    fontWeight: "900",
  },
  visualizerFrame: {
    position: "relative",
    borderRadius: 14,
    overflow: "hidden",
  },
  fullscreenPlayer: {
    flex: 1,
  },
  fullscreenVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.26)",
  },
  fullscreenOverlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 26,
  },
  fullscreenTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  glassControl: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  collapseHandle: {
    width: 56,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  collapseLine: {
    width: 24,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginVertical: 2,
  },
  collapseLineShort: {
    width: 16,
    opacity: 0.72,
  },
  timerControlText: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 22,
  },
  fullscreenCenter: {
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: "auto",
    marginBottom: "auto",
  },
  fullscreenEyebrow: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: 12,
  },
  fullscreenTitle: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 44,
    maxWidth: width - 48,
  },
  fullscreenSubtitle: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  transportPanel: {
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    backgroundColor: "rgba(12, 12, 18, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  fullscreenTimer: {
    color: "rgba(255, 255, 255, 0.74)",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },
  transportRow: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  transportButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  transportButtonText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 32,
  },
  primaryTransportButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 22,
    backgroundColor: "#FFFFFF",
  },
  primaryTransportText: {
    color: "#111118",
    fontSize: 17,
    fontWeight: "900",
  },
  grid: { paddingHorizontal: 16, paddingBottom: 140 },
  chipScroll: { marginBottom: 14 },
  chipContainer: { paddingVertical: 4 },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 10,
  },
  categoryText: { fontSize: 13, fontWeight: "700" },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardWrapper: { width: CARD_WIDTH, marginBottom: 16 },
  banner: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  bannerText: { fontSize: 13, textAlign: "center" },
  timerBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  timerText: { fontSize: 13, fontWeight: "600" },
  pageContent: { paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: "700", marginBottom: 10 },
  pageCopy: { fontSize: 14, lineHeight: 20, marginBottom: 18 },
  codeCard: { borderRadius: 18, borderWidth: 1, padding: 20, marginBottom: 20 },
  codeLabel: { fontSize: 11, textTransform: "uppercase", marginBottom: 8 },
  codeValue: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  linkText: { fontSize: 12, lineHeight: 18 },
  ctaButton: { borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  ctaText: { color: "#fff", fontWeight: "700" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  soonText: { fontSize: 12, marginTop: 12, textAlign: "center" },
  emptyState: { marginTop: 20, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  emptyCopy: { fontSize: 13, textAlign: "center", maxWidth: width * 0.7 },
  onboardingOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 15, 0.85)",
    justifyContent: "center",
    padding: 24,
  },
  onboardingCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
  },
  onboardingTitle: { fontSize: 24, fontWeight: "800", marginBottom: 12 },
  onboardingCopy: { fontSize: 15, lineHeight: 22, marginBottom: 20 },
  menuOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuBox: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 16,
  },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  menuText: {
    fontSize: 16,
    fontWeight: "600",
  },
  onboardingSteps: {},
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  stepBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "800",
    marginRight: 12,
    backgroundColor: "rgba(108, 99, 255, 0.12)",
  },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
