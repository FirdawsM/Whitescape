import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { logger } from "../utils/logger";

export const BANNER_ID = process.env.EXPO_PUBLIC_AD_BANNER_ID || "";
export const INTERSTITIAL_ID = process.env.EXPO_PUBLIC_AD_INTERSTITIAL_ID || "";

const isExpoGo = typeof __DEV__ !== "undefined" && __DEV__ && !Platform.isTV;

export function useInterstitialAd() {
  const [loaded, setLoaded] = useState(false);
  const adRef = useRef<any>(null);

  useEffect(() => {
    if (isExpoGo) return;
    try {
      const {
        InterstitialAd,
        AdEventType,
      } = require("react-native-google-mobile-ads");
      const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_ID, {
        requestNonPersonalizedAdsOnly: true,
      });
      const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () =>
        setLoaded(true),
      );
      const unsubscribeClosed = ad.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          setLoaded(false);
          ad.load();
        },
      );
      ad.load();
      adRef.current = ad;
      return () => {
        unsubscribeLoaded();
        unsubscribeClosed();
      };
    } catch (e) {
      logger.log("Ads not available in Expo Go");
    }
  }, []);

  const showAd = () => {
    if (loaded && adRef.current) adRef.current.show();
  };

  return { showAd, loaded };
}
