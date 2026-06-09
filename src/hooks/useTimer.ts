import { useState, useEffect, useRef } from "react";
import { Audio } from "expo-av";
import { logger } from "../utils/logger";

export function useTimer(onExpire: () => void) {
  const [minutes, setMinutes] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beepRef = useRef<Audio.Sound | null>(null);

  const playBeep = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/beep.mp3"),
        { volume: 1.0 },
      );
      beepRef.current = sound;
      await sound.playAsync();
      setTimeout(async () => {
        try {
          const status = await sound.getStatusAsync();

          if (status.isLoaded) {
            await sound.unloadAsync();
          }
        } catch (e) {
          logger.warn("Beep cleanup error:", e);
        }
      }, 1000);
    } catch (e) {
      logger.log("Beep error:", e);
    }
  };

  const start = (mins: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMinutes(mins);
    setSecondsLeft(mins * 60);
    setIsRunning(true);
  };

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setSecondsLeft(0);
    setMinutes(0);
  };

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === 4 || s === 3 || s === 2) {
          playBeep();
        }
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          setMinutes(0);
          onExpire();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onExpire]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (beepRef.current) {
        beepRef.current.unloadAsync().catch(() => undefined);
        beepRef.current = null;
      }
    };
  }, []);

  const display = isRunning
    ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`
    : null;

  return { start, stop, isRunning, display };
}
