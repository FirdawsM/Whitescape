import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { useState, useEffect, useRef } from "react";
import { SOUND_MAP } from "../constants/sounds";
import { logger } from "../utils/logger";

export function useAudio() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          shouldDuckAndroid: false,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        logger.warn("Audio mode setup failed", e);
      }
    };

    configureAudio();
  }, []);

  const stopCurrent = async () => {
    const sound = soundRef.current;
    if (!sound) return;

    soundRef.current = null;

    try {
      const status = await sound.getStatusAsync();

      if (status.isLoaded) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
    } catch (e) {
      logger.warn("Error stopping audio", e);
    }
  };

  const playSound = async (id: string) => {
    if (isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      if (activeId === id) {
        await stopCurrent();
        setActiveId(null);
        setIsPlaying(false);
        return;
      }

      await stopCurrent();
      const soundData = SOUND_MAP[id];
      if (!soundData) {
        throw new Error("Sound not found");
      }

      const { sound } = await Audio.Sound.createAsync(soundData.asset, {
        isLooping: true,
      });
      soundRef.current = sound;
      setActiveId(id);
      setIsPlaying(true);
      await sound.playAsync();
    } catch (e) {
      setError("Unable to play sound. Please try again.");
      logger.warn("Audio error:", e);
      setActiveId(null);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopSound = async () => {
    await stopCurrent();
    setActiveId(null);
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopCurrent();
    };
  }, []);

  return { activeId, isPlaying, isLoading, error, playSound, stopSound };
}
