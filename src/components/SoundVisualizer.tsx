import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Easing } from "react-native";

const { width: W, height: H } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

type SoundKey =
  | "rain"
  | "ocean"
  | "fire"
  | "brown_noise"
  | "white_noise"
  | "forest"
  | "thunder"
  | "jazz"
  | "piano"
  | "campfire"
  | "wind"
  | "tibetan_bowl"
  | "gamma"
  | "gravity_water"
  | "default";

interface SoundVisualizerProps {
  soundKey: string;
  isPlaying: boolean;
  isVisible?: boolean;
  viewportHeight?: number;
}

const SOUND_ID_MAP: Record<string, SoundKey> = {
  rain: "rain",
  ocean: "gravity_water",
  waves: "gravity_water",
  beach: "gravity_water",
  storm: "thunder",
  fire: "fire",
  fireplace: "campfire",
  campfire: "campfire",
  brownnoise: "gamma",
  brown_noise: "gamma",
  whitenoise: "gamma",
  white_noise: "gamma",
  radio: "gamma",
  fan: "gamma",
  forest: "forest",
  bird: "forest",
  crickets: "forest",
  river: "gravity_water",
  underwater: "gravity_water",
  thunder: "thunder",
  jazz: "jazz",
  cafe: "gravity_water",
  piano: "piano",
  tibetan: "tibetan_bowl",
  tibetan_bowl: "tibetan_bowl",
  wind: "wind",
  train: "gamma",
  library: "gamma",
  classroom: "gamma",
  office: "gamma",
  aurora: "gamma",
  default: "default",
};

// ─── Colour palettes ──────────────────────────────────────────────────────────

const PALETTES: Record<
  SoundKey,
  { bg: string; accent: string; particles: string[]; glow: string }
> = {
  rain: {
    bg: "#05080f",
    accent: "#3a7bd5",
    glow: "#1a3a6e",
    particles: ["#5aa0f0", "#7bbcff", "#3a80d0", "#99ccff", "#2060aa"],
  },
  ocean: {
    bg: "#020810",
    accent: "#0d4f7c",
    glow: "#0a3352",
    particles: ["#1a6fa0", "#2a8fc0", "#0d5580", "#4ab0e0", "#062840"],
  },
  fire: {
    bg: "#080300",
    accent: "#f04500",
    glow: "#cc3300",
    particles: ["#ff6b00", "#ff9500", "#e84000", "#ffcc00", "#ff3300"],
  },
  brown_noise: {
    bg: "#050404",
    accent: "#5c3a20",
    glow: "#3d2510",
    particles: ["#8b5e3c", "#a87040", "#6b4226", "#c09060", "#4a2e18"],
  },
  white_noise: {
    bg: "#07070d",
    accent: "#8080a0",
    glow: "#404060",
    particles: ["#9090b0", "#b0b0d0", "#707090", "#d0d0f0", "#505070"],
  },
  forest: {
    bg: "#020805",
    accent: "#1a5c30",
    glow: "#0d3a1a",
    particles: ["#3aad6f", "#52c98a", "#1f7a40", "#80e0b0", "#0d4a20"],
  },
  thunder: {
    bg: "#04040a",
    accent: "#2a2a50",
    glow: "#1a1a3a",
    particles: ["#5050a0", "#7070c0", "#303070", "#9090e0", "#202050"],
  },
  jazz: {
    bg: "#080400",
    accent: "#c07820",
    glow: "#803a00",
    particles: ["#e09030", "#f0b040", "#c07820", "#ffd060", "#a05010"],
  },
  piano: {
    bg: "#050505",
    accent: "#505060",
    glow: "#2a2a3a",
    particles: ["#707080", "#909090", "#505060", "#b0b0c0", "#303040"],
  },
  campfire: {
    bg: "#060200",
    accent: "#e05000",
    glow: "#aa2800",
    particles: ["#ff7000", "#ffaa00", "#e05000", "#ffdd60", "#cc2800"],
  },
  wind: {
    bg: "#040810",
    accent: "#405878",
    glow: "#202840",
    particles: ["#608098", "#80a0c0", "#405060", "#a0c8e0", "#203040"],
  },
  tibetan_bowl: {
    bg: "#060500",
    accent: "#c09030",
    glow: "#805000",
    particles: ["#e0b050", "#f0d070", "#c09030", "#ffe890", "#906010"],
  },
  gamma: {
    bg: "#040408",
    accent: "#6c63ff",
    glow: "#202040",
    particles: ["#a0a0ff", "#8080ff", "#6c63ff", "#c0c0ff", "#4040ff"],
  },
  gravity_water: {
    bg: "#020810",
    accent: "#00a0ff",
    glow: "#004080",
    particles: ["#40c0ff", "#80e0ff", "#00a0ff", "#c0f0ff", "#0060aa"],
  },
  default: {
    bg: "#060609",
    accent: "#404870",
    glow: "#202040",
    particles: ["#606090", "#8080b0", "#404870", "#a0a0d0", "#303050"],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// ══════════════════════════════════════════════════════════════════════════════
// RAIN VISUALIZER
// Heavy streaks with puddle ripples and a deep blue glow layer
// ══════════════════════════════════════════════════════════════════════════════

const RainVisualizer: React.FC<{
  isPlaying: boolean;
  palette: (typeof PALETTES)["rain"];
}> = ({ isPlaying, palette }) => {
  const DROP_COUNT = 60;
  const drops = useRef(
    Array.from({ length: DROP_COUNT }, () => ({
      y: new Animated.Value(-rand(20, 200)),
      x: rand(0, W),
      height: rand(30, 90),
      speed: rand(400, 900),
      width: rand(0.8, 2.2),
      opacity: rand(0.3, 0.75),
      color:
        palette.particles[Math.floor(Math.random() * palette.particles.length)],
    })),
  ).current;

  const glowAnim = useRef(new Animated.Value(0)).current;
  const fogAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPlaying) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(fogAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(fogAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();

    drops.forEach((drop) => {
      const loop = () => {
        drop.y.setValue(-drop.height - rand(0, 300));
        Animated.timing(drop.y, {
          toValue: H + drop.height,
          duration: drop.speed,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start(() => loop());
      };
      setTimeout(() => loop(), rand(0, drop.speed));
    });

    return () => {
      drops.forEach((d) => d.y.stopAnimation());
      glowAnim.stopAnimation();
      fogAnim.stopAnimation();
    };
  }, [isPlaying]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.22],
  });
  const fogOpacity = fogAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.04, 0.12],
  });

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg }]}>
      {/* Deep blue ambient glow */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: palette.glow, opacity: glowOpacity },
        ]}
      />
      {/* Fog layer near bottom */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: H * 0.35,
          backgroundColor: "#0a1a30",
          opacity: fogOpacity,
        }}
      />
      {/* Rain drops */}
      {drops.map((drop, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: drop.x,
            width: drop.width,
            height: drop.height,
            backgroundColor: drop.color,
            opacity: drop.opacity,
            borderRadius: drop.width,
            transform: [{ translateY: drop.y }, { skewX: "-10deg" }],
          }}
        />
      ))}
      {/* Puddle ripples at bottom */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
        }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <RippleRing
            key={i}
            color={palette.accent}
            delay={i * 700}
            isPlaying={isPlaying}
          />
        ))}
      </View>
      {/* Ground reflection strip */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 40,
          backgroundColor: palette.glow,
          opacity: 0.18,
        }}
      />
    </View>
  );
};

const RippleRing: React.FC<{
  color: string;
  delay: number;
  isPlaying: boolean;
}> = ({ color, delay, isPlaying }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const xPos = useRef(rand(20, W - 20)).current;

  useEffect(() => {
    if (!isPlaying) return;
    const run = () => {
      scale.setValue(0);
      opacity.setValue(0.6);
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]).start(() => setTimeout(run, rand(400, 1200)));
    };
    setTimeout(run, delay);
  }, [isPlaying]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: 50,
        height: 18,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: color,
        opacity,
        transform: [{ scale }],
        left: xPos - 25,
        bottom: rand(5, 60),
      }}
    />
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FIRE / CAMPFIRE VISUALIZER
// Dense embers, layered glow cones, heat shimmer
// ══════════════════════════════════════════════════════════════════════════════

const FireVisualizer: React.FC<{
  isPlaying: boolean;
  palette: (typeof PALETTES)["fire"];
}> = ({ isPlaying, palette }) => {
  const EMBER_COUNT = 45;
  const embers = useRef(
    Array.from({ length: EMBER_COUNT }, () => ({
      y: new Animated.Value(H * 0.75),
      x: new Animated.Value(W / 2 + rand(-W * 0.25, W * 0.25)),
      opacity: new Animated.Value(0),
      size: rand(2, 7),
      duration: rand(1500, 3500),
      color:
        palette.particles[Math.floor(Math.random() * palette.particles.length)],
    })),
  ).current;

  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const flicker1 = useRef(new Animated.Value(0)).current;
  const flicker2 = useRef(new Animated.Value(0)).current;
  const coneAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPlaying) return;

    // Main glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.95,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Fast flicker layers
    Animated.loop(
      Animated.sequence([
        Animated.timing(flicker1, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(flicker1, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(flicker1, {
          toValue: 0.6,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(flicker1, {
          toValue: 0,
          duration: 60,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flicker2, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(flicker2, {
          toValue: 0.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(flicker2, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(flicker2, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Heat cone sway
    Animated.loop(
      Animated.sequence([
        Animated.timing(coneAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(coneAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();

    embers.forEach((ember) => {
      const rise = () => {
        const startX = W / 2 + rand(-W * 0.22, W * 0.22);
        ember.x.setValue(startX);
        ember.y.setValue(H * 0.72);
        ember.opacity.setValue(0);
        Animated.parallel([
          Animated.timing(ember.y, {
            toValue: rand(H * 0.05, H * 0.3),
            duration: ember.duration,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(ember.x, {
            toValue: startX + rand(-100, 100),
            duration: ember.duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.sequence([
            Animated.timing(ember.opacity, {
              toValue: rand(0.7, 1),
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(ember.opacity, {
              toValue: 0,
              duration: ember.duration - 200,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => setTimeout(rise, rand(0, 300)));
      };
      setTimeout(rise, rand(0, ember.duration));
    });

    return () => {
      embers.forEach((e) => {
        e.y.stopAnimation();
        e.x.stopAnimation();
        e.opacity.stopAnimation();
      });
      glowAnim.stopAnimation();
      flicker1.stopAnimation();
      flicker2.stopAnimation();
      coneAnim.stopAnimation();
    };
  }, [isPlaying]);

  const baseGlowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.45],
  });
  const flicker1Opacity = flicker1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.0, 0.12],
  });
  const flicker2Opacity = flicker2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.0, 0.08],
  });
  const coneX = coneAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 12],
  });

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg }]}>
      {/* Base orange glow flood */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#d03500", opacity: baseGlowOpacity },
        ]}
      />
      {/* Flicker layers */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#ff8c00", opacity: flicker1Opacity },
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#ffdd00", opacity: flicker2Opacity },
        ]}
      />

      {/* Heat cone — tall ellipse from bottom center */}
      <Animated.View
        style={{
          position: "absolute",
          width: W * 0.55,
          height: H * 0.65,
          borderRadius: W * 0.28,
          backgroundColor: "#ff5500",
          bottom: -H * 0.1,
          alignSelf: "center",
          opacity: 0.22,
          transform: [{ translateX: coneX }, { scaleY: 1.4 }],
        }}
      />
      {/* Inner bright cone */}
      <Animated.View
        style={{
          position: "absolute",
          width: W * 0.28,
          height: H * 0.4,
          borderRadius: W * 0.14,
          backgroundColor: "#ffcc00",
          bottom: -H * 0.05,
          alignSelf: "center",
          opacity: 0.15,
          transform: [{ translateX: coneX }],
        }}
      />

      {/* Ground glow pool */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: W * 0.1,
          right: W * 0.1,
          height: 60,
          borderRadius: 30,
          backgroundColor: palette.accent,
          opacity: 0.3,
        }}
      />

      {/* Embers */}
      {embers.map((ember, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: ember.size,
            height: ember.size,
            borderRadius: ember.size / 2,
            backgroundColor: ember.color,
            opacity: ember.opacity,
            transform: [{ translateX: ember.x }, { translateY: ember.y }],
          }}
        />
      ))}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// FOREST VISUALIZER
// Rising light motes + dark tree silhouettes at bottom
// ══════════════════════════════════════════════════════════════════════════════

const ForestVisualizer: React.FC<{
  isPlaying: boolean;
  palette: (typeof PALETTES)["forest"];
}> = ({ isPlaying, palette }) => {
  const MOTE_COUNT = 28;
  const motes = useRef(
    Array.from({ length: MOTE_COUNT }, () => ({
      x: rand(0, W),
      y: new Animated.Value(H * 0.5 + rand(0, H * 0.5)),
      opacity: new Animated.Value(0),
      size: rand(3, 9),
      duration: rand(4000, 9000),
      driftX: rand(-60, 60),
      color:
        palette.particles[Math.floor(Math.random() * palette.particles.length)],
    })),
  ).current;

  const canopyAnim = useRef(new Animated.Value(0)).current;
  const groundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPlaying) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(canopyAnim, {
          toValue: 1,
          duration: 7000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(canopyAnim, {
          toValue: 0.3,
          duration: 7000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(groundAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(groundAnim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();

    motes.forEach((mote) => {
      const float = () => {
        mote.y.setValue(H * 0.75 + rand(0, H * 0.25));
        mote.opacity.setValue(0);
        Animated.parallel([
          Animated.timing(mote.y, {
            toValue: rand(-60, H * 0.2),
            duration: mote.duration,
            useNativeDriver: true,
            easing: Easing.out(Easing.quad),
          }),
          Animated.sequence([
            Animated.timing(mote.opacity, {
              toValue: rand(0.5, 1),
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(mote.opacity, {
              toValue: rand(0.3, 0.7),
              duration: mote.duration - 2000,
              useNativeDriver: true,
            }),
            Animated.timing(mote.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => setTimeout(float, rand(300, 2000)));
      };
      setTimeout(float, rand(0, mote.duration));
    });

    return () => {
      motes.forEach((m) => {
        m.y.stopAnimation();
        m.opacity.stopAnimation();
      });
      canopyAnim.stopAnimation();
      groundAnim.stopAnimation();
    };
  }, [isPlaying]);

  const canopyOpacity = canopyAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.06, 0.2],
  });
  const groundOpacity = groundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.22],
  });

  // Tree trunk positions
  const trees = [
    { x: -W * 0.05, w: W * 0.18, h: H * 0.45 },
    { x: W * 0.08, w: W * 0.14, h: H * 0.38 },
    { x: W * 0.28, w: W * 0.12, h: H * 0.42 },
    { x: W * 0.5, w: W * 0.2, h: H * 0.5 },
    { x: W * 0.68, w: W * 0.13, h: H * 0.36 },
    { x: W * 0.82, w: W * 0.15, h: H * 0.44 },
    { x: W * 0.92, w: W * 0.16, h: H * 0.4 },
  ];

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg }]}>
      {/* Canopy glow from top */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: H * 0.4,
          backgroundColor: palette.glow,
          opacity: canopyOpacity,
        }}
      />
      {/* Ground mist */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: H * 0.25,
          backgroundColor: "#0d3a1a",
          opacity: groundOpacity,
        }}
      />

      {/* Light motes */}
      {motes.map((mote, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: mote.size,
            height: mote.size,
            borderRadius: mote.size / 2,
            backgroundColor: mote.color,
            left: mote.x,
            opacity: mote.opacity,
            transform: [{ translateY: mote.y }],
            shadowColor: mote.color,
            shadowRadius: mote.size * 2,
            shadowOpacity: 0.8,
            elevation: 4,
          }}
        />
      ))}

      {/* Tree silhouettes at bottom */}
      {trees.map((tree, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            bottom: 0,
            left: tree.x,
            width: tree.w,
            height: tree.h,
            backgroundColor: "#010a03",
            borderTopLeftRadius: tree.w * 0.5,
            borderTopRightRadius: tree.w * 0.5,
            opacity: 0.92,
          }}
        />
      ))}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// THUNDER VISUALIZER
// Dark storm clouds drifting + realistic double lightning bolt flash
// ══════════════════════════════════════════════════════════════════════════════

const ThunderVisualizer: React.FC<{
  isPlaying: boolean;
  palette: (typeof PALETTES)["thunder"];
}> = ({ isPlaying, palette }) => {
  const flashAnim = useRef(new Animated.Value(0)).current;
  const boltOpacity = useRef(new Animated.Value(0)).current;
  const cloudAnims = useRef(
    Array.from({ length: 4 }, () => ({
      x: new Animated.Value(0),
      opacity: new Animated.Value(rand(0.12, 0.22)),
    })),
  ).current;
  const rainOpacity = useRef(new Animated.Value(0.04)).current;

  useEffect(() => {
    if (!isPlaying) return;

    cloudAnims.forEach((cloud, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cloud.x, {
            toValue: i % 2 === 0 ? 18 : -18,
            duration: 7000 + i * 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(cloud.x, {
            toValue: 0,
            duration: 7000 + i * 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ]),
      ).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(rainOpacity, {
          toValue: 0.12,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rainOpacity, {
          toValue: 0.04,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const triggerLightning = () => {
      // Flash screen
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0.1,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0.7,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Bolt flash
      boltOpacity.setValue(1);
      setTimeout(() => {
        Animated.timing(boltOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 80);

      setTimeout(triggerLightning, rand(3000, 9000));
    };
    setTimeout(triggerLightning, 1500);

    return () => {
      flashAnim.stopAnimation();
      boltOpacity.stopAnimation();
      cloudAnims.forEach((c) => {
        c.x.stopAnimation();
        c.opacity.stopAnimation();
      });
      rainOpacity.stopAnimation();
    };
  }, [isPlaying]);

  const flashOpacity = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  // Cloud sizes/positions
  const cloudShapes = [
    { top: H * 0.04, left: -W * 0.1, width: W * 0.7, height: 110 },
    { top: H * 0.12, left: W * 0.25, width: W * 0.8, height: 90 },
    { top: H * 0.06, left: W * 0.5, width: W * 0.65, height: 100 },
    { top: H * 0.18, left: -W * 0.05, width: W * 0.55, height: 80 },
  ];

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg }]}>
      {/* Storm background gradient */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: H * 0.6,
          backgroundColor: "#06070e",
          opacity: 0.8,
        }}
      />

      {/* Cloud masses */}
      {cloudAnims.map((cloud, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            top: cloudShapes[i].top,
            left: cloudShapes[i].left,
            width: cloudShapes[i].width,
            height: cloudShapes[i].height,
            borderRadius: cloudShapes[i].height / 2,
            backgroundColor: palette.particles[i % palette.particles.length],
            opacity: cloud.opacity,
            transform: [{ translateX: cloud.x }],
          }}
        />
      ))}

      {/* Heavy rain overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#1a2040", opacity: rainOpacity },
        ]}
      />

      {/* Lightning bolt — jagged shape using stacked thin strips */}
      <Animated.View
        style={{
          position: "absolute",
          top: H * 0.22,
          left: W * 0.48,
          opacity: boltOpacity,
        }}
      >
        {/* Bolt segment 1 */}
        <View
          style={{
            width: 3,
            height: 60,
            backgroundColor: "#e8eeff",
            transform: [{ rotate: "12deg" }],
            shadowColor: "#a0b0ff",
            shadowRadius: 8,
            shadowOpacity: 1,
          }}
        />
        <View
          style={{
            width: 3,
            height: 50,
            backgroundColor: "#e8eeff",
            transform: [{ rotate: "-18deg" }, { translateX: 14 }],
            marginTop: -8,
            shadowColor: "#a0b0ff",
            shadowRadius: 8,
            shadowOpacity: 1,
          }}
        />
        <View
          style={{
            width: 3,
            height: 55,
            backgroundColor: "#e8eeff",
            transform: [{ rotate: "10deg" }, { translateX: 4 }],
            marginTop: -6,
            shadowColor: "#a0b0ff",
            shadowRadius: 8,
            shadowOpacity: 1,
          }}
        />
        <View
          style={{
            width: 2,
            height: 40,
            backgroundColor: "#c8d8ff",
            transform: [{ rotate: "-20deg" }, { translateX: 16 }],
            marginTop: -6,
            opacity: 0.7,
          }}
        />
      </Animated.View>

      {/* Screen lightning flash */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#d0dcff", opacity: flashOpacity },
        ]}
      />

      {/* Ground glow after strike */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          backgroundColor: "#4050a0",
          opacity: flashAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.2],
          }),
        }}
      />
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// JAZZ VISUALIZER
// Warm amber spotlight cone + slow drifting light orbs
// ══════════════════════════════════════════════════════════════════════════════

const JazzVisualizer: React.FC<{
  isPlaying: boolean;
  palette: (typeof PALETTES)["jazz"];
}> = ({ isPlaying, palette }) => {
  const spotlightAnim = useRef(new Animated.Value(0)).current;
  const ORBS = 8;
  const orbs = useRef(
    Array.from({ length: ORBS }, () => ({
      x: new Animated.Value(rand(0, W)),
      y: new Animated.Value(rand(0, H)),
      opacity: new Animated.Value(rand(0.05, 0.25)),
      size: rand(60, 180),
      duration: rand(6000, 12000),
      color:
        palette.particles[Math.floor(Math.random() * palette.particles.length)],
    })),
  ).current;
  const dustAnims = useRef(
    Array.from({ length: 20 }, () => ({
      x: rand(W * 0.2, W * 0.8),
      y: new Animated.Value(rand(H * 0.2, H * 0.7)),
      opacity: new Animated.Value(0),
      size: rand(1.5, 3.5),
    })),
  ).current;

  useEffect(() => {
    if (!isPlaying) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(spotlightAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(spotlightAnim, {
          toValue: 0.6,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();

    orbs.forEach((orb) => {
      const drift = () => {
        Animated.parallel([
          Animated.timing(orb.x, {
            toValue: rand(0, W),
            duration: orb.duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(orb.y, {
            toValue: rand(0, H),
            duration: orb.duration,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.sequence([
            Animated.timing(orb.opacity, {
              toValue: rand(0.15, 0.35),
              duration: orb.duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(orb.opacity, {
              toValue: rand(0.05, 0.15),
              duration: orb.duration / 2,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => drift());
      };
      drift();
    });

    // Dust motes in spotlight
    dustAnims.forEach((d) => {
      const rise = () => {
        d.y.setValue(rand(H * 0.4, H * 0.75));
        d.opacity.setValue(0);
        Animated.parallel([
          Animated.timing(d.y, {
            toValue: rand(H * 0.1, H * 0.35),
            duration: rand(5000, 9000),
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.sequence([
            Animated.timing(d.opacity, {
              toValue: rand(0.3, 0.7),
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(d.opacity, {
              toValue: 0,
              duration: rand(3000, 6000),
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => setTimeout(rise, rand(500, 2000)));
      };
      setTimeout(rise, rand(0, 4000));
    });

    return () => {
      orbs.forEach((o) => {
        o.x.stopAnimation();
        o.y.stopAnimation();
        o.opacity.stopAnimation();
      });
      dustAnims.forEach((d) => {
        d.y.stopAnimation();
        d.opacity.stopAnimation();
      });
      spotlightAnim.stopAnimation();
    };
  }, [isPlaying]);

  const spotlightOpacity = spotlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.28],
  });

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg }]}>
      {/* Drifting warm orbs */}
      {orbs.map((orb, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: orb.size,
            height: orb.size,
            borderRadius: orb.size / 2,
            backgroundColor: orb.color,
            opacity: orb.opacity,
            transform: [{ translateX: orb.x }, { translateY: orb.y }],
          }}
        />
      ))}

      {/* Spotlight cone from top center */}
      <Animated.View
        style={{
          position: "absolute",
          top: -20,
          alignSelf: "center",
          width: 0,
          height: 0,
          borderLeftWidth: W * 0.35,
          borderRightWidth: W * 0.35,
          borderTopWidth: 0,
          borderBottomWidth: H * 0.72,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: palette.accent,
          opacity: spotlightOpacity,
        }}
      />
      {/* Spotlight inner bright */}
      <Animated.View
        style={{
          position: "absolute",
          top: -20,
          alignSelf: "center",
          width: 0,
          height: 0,
          borderLeftWidth: W * 0.14,
          borderRightWidth: W * 0.14,
          borderTopWidth: 0,
          borderBottomWidth: H * 0.55,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: "#ffd060",
          opacity: spotlightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.04, 0.1],
          }),
        }}
      />

      {/* Dust motes in beam */}
      {dustAnims.map((d, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: d.size,
            height: d.size,
            borderRadius: d.size / 2,
            backgroundColor: "#ffd080",
            left: d.x,
            opacity: d.opacity,
            transform: [{ translateY: d.y }],
          }}
        />
      ))}

      {/* Stage floor glow */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          backgroundColor: palette.accent,
          opacity: 0.08,
        }}
      />
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// PIANO VISUALIZER
// Elegant black — slow silver ripples, gentle key glows
// ══════════════════════════════════════════════════════════════════════════════

const PianoVisualizer: React.FC<{
  isPlaying: boolean;
  palette: (typeof PALETTES)["piano"];
}> = ({ isPlaying, palette }) => {
  const RIPPLE_COUNT = 6;
  const ripples = useRef(
    Array.from({ length: RIPPLE_COUNT }, () => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      x: rand(W * 0.1, W * 0.9),
      y: rand(H * 0.2, H * 0.8),
    })),
  ).current;

  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPlaying) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();

    ripples.forEach((r, i) => {
      const pulse = () => {
        r.scale.setValue(0);
        r.opacity.setValue(0.5);
        Animated.parallel([
          Animated.timing(r.scale, {
            toValue: 1.8,
            duration: rand(4000, 7000),
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(r.opacity, {
            toValue: 0,
            duration: rand(4000, 7000),
            useNativeDriver: true,
          }),
        ]).start(() => setTimeout(pulse, rand(1000, 3000)));
      };
      setTimeout(pulse, i * 900);
    });

    return () => {
      ripples.forEach((r) => {
        r.scale.stopAnimation();
        r.opacity.stopAnimation();
      });
      shimmer.stopAnimation();
    };
  }, [isPlaying]);

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.02, 0.1],
  });

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: "#030303" }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#303040", opacity: shimmerOpacity },
        ]}
      />
      {ripples.map((r, i) => {
        const SIZE = rand(80, 160);
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              width: SIZE,
              height: SIZE,
              borderRadius: SIZE / 2,
              borderWidth: 1,
              borderColor: palette.particles[i % palette.particles.length],
              left: r.x - SIZE / 2,
              top: r.y - SIZE / 2,
              opacity: r.opacity,
              transform: [{ scale: r.scale }],
            }}
          />
        );
      })}
      {/* Faint horizontal line — piano keys suggestion */}
      <View
        style={{
          position: "absolute",
          bottom: H * 0.12,
          left: W * 0.08,
          right: W * 0.08,
          height: 1,
          backgroundColor: "#505060",
          opacity: 0.3,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: H * 0.12 - 12,
          left: W * 0.08,
          right: W * 0.08,
          height: 1,
          backgroundColor: "#404050",
          opacity: 0.2,
        }}
      />
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// WIND VISUALIZER
// Sweeping horizontal streaks with layered depth
// ══════════════════════════════════════════════════════════════════════════════

const WindVisualizer: React.FC<{
  isPlaying: boolean;
  palette: (typeof PALETTES)["wind"];
}> = ({ isPlaying, palette }) => {
  const STREAK_COUNT = 22;
  const streaks = useRef(
    Array.from({ length: STREAK_COUNT }, () => ({
      x: new Animated.Value(-W * rand(0.3, 1.2)),
      y: rand(0, H),
      opacity: rand(0.08, 0.35),
      width: rand(60, 240),
      height: rand(0.5, 2),
      speed: rand(800, 2200),
      color:
        palette.particles[Math.floor(Math.random() * palette.particles.length)],
    })),
  ).current;

  const swellAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPlaying) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(swellAnim, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(swellAnim, {
          toValue: 0.3,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();

    streaks.forEach((streak) => {
      const sweep = () => {
        streak.x.setValue(-streak.width - rand(0, W * 0.5));
        Animated.timing(streak.x, {
          toValue: W + streak.width,
          duration: streak.speed,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }).start(() => setTimeout(sweep, rand(0, 600)));
      };
      setTimeout(sweep, rand(0, streak.speed));
    });

    return () => {
      streaks.forEach((s) => s.x.stopAnimation());
      swellAnim.stopAnimation();
    };
  }, [isPlaying]);

  const swellOpacity = swellAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.04, 0.14],
  });

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: palette.glow, opacity: swellOpacity },
        ]}
      />
      {streaks.map((streak, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: streak.width,
            height: streak.height,
            backgroundColor: streak.color,
            top: streak.y,
            opacity: streak.opacity,
            borderRadius: streak.height,
            transform: [{ translateX: streak.x }],
          }}
        />
      ))}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// TIBETAN BOWL VISUALIZER
// Gold rings blooming from a glowing center with deep resonance
// ══════════════════════════════════════════════════════════════════════════════

const TibetanBowlVisualizer: React.FC<{
  isPlaying: boolean;
  palette: (typeof PALETTES)["tibetan_bowl"];
}> = ({ isPlaying, palette }) => {
  const RING_COUNT = 10;
  const rings = useRef(
    Array.from({ length: RING_COUNT }, () => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    })),
  ).current;

  const innerGlow = useRef(new Animated.Value(0.4)).current;
  const outerGlow = useRef(new Animated.Value(0)).current;
  const bgWarm = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPlaying) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(innerGlow, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(innerGlow, {
          toValue: 0.4,
          duration: 2500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(outerGlow, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(outerGlow, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bgWarm, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(bgWarm, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();

    const triggerBowl = () => {
      rings.forEach((ring, i) => {
        setTimeout(() => {
          ring.scale.setValue(0.04);
          ring.opacity.setValue(0.8 - i * 0.07);
          Animated.parallel([
            Animated.timing(ring.scale, {
              toValue: 3,
              duration: 6000,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(ring.opacity, {
              toValue: 0,
              duration: 6000,
              useNativeDriver: true,
            }),
          ]).start();
        }, i * 250);
      });
      setTimeout(triggerBowl, 7000);
    };
    triggerBowl();

    return () => {
      rings.forEach((r) => {
        r.scale.stopAnimation();
        r.opacity.stopAnimation();
      });
      innerGlow.stopAnimation();
      outerGlow.stopAnimation();
      bgWarm.stopAnimation();
    };
  }, [isPlaying]);

  const SIZE = Math.min(W, H) * 0.55;
  const bgOpacity = bgWarm.interpolate({
    inputRange: [0, 1],
    outputRange: [0.04, 0.16],
  });
  const outerOpacity = outerGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.06, 0.18],
  });

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg }]}>
      {/* Warm background breath */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#6a3800", opacity: bgOpacity },
        ]}
      />

      {/* Outer ambient halo */}
      <Animated.View
        style={{
          position: "absolute",
          width: SIZE * 2.2,
          height: SIZE * 2.2,
          borderRadius: SIZE * 1.1,
          backgroundColor: palette.accent,
          alignSelf: "center",
          top: H / 2 - SIZE * 1.1,
          opacity: outerOpacity,
        }}
      />

      {/* Bloom rings */}
      {rings.map((ring, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: i < 4 ? 2 : 1,
            borderColor: palette.particles[i % palette.particles.length],
            opacity: ring.opacity,
            alignSelf: "center",
            top: H / 2 - SIZE / 2,
            transform: [{ scale: ring.scale }],
          }}
        />
      ))}

      {/* Inner glow orb */}
      <Animated.View
        style={{
          position: "absolute",
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: palette.accent,
          alignSelf: "center",
          top: H / 2 - 30,
          opacity: innerGlow,
          shadowColor: palette.accent,
          shadowRadius: 30,
          shadowOpacity: 1,
          elevation: 20,
        }}
      />
      {/* Bright center */}
      <Animated.View
        style={{
          position: "absolute",
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: "#fff8d0",
          alignSelf: "center",
          top: H / 2 - 9,
          opacity: innerGlow,
        }}
      />
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// GAMMA VISUALIZER
// High-frequency shimmering particles representing 40Hz focus
// ══════════════════════════════════════════════════════════════════════════════

const GammaVisualizer: React.FC<{
  isPlaying: boolean;
  palette: (typeof PALETTES)["gamma"];
}> = ({ isPlaying, palette }) => {
  const PARTICLE_COUNT = 50;
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: rand(0, W),
      y: rand(0, H),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      color:
        palette.particles[Math.floor(Math.random() * palette.particles.length)],
    })),
  ).current;

  useEffect(() => {
    if (!isPlaying) return;

    particles.forEach((p) => {
      const shimmer = () => {
        p.opacity.setValue(0);
        p.scale.setValue(rand(0.2, 0.8));

        Animated.sequence([
          Animated.timing(p.opacity, {
            toValue: rand(0.4, 0.9),
            duration: rand(100, 300),
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: rand(100, 300),
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isPlaying) {
            shimmer();
          }
        });
      };
      setTimeout(shimmer, rand(0, 1000));
    });

    return () => particles.forEach((p) => p.opacity.stopAnimation());
  }, [isPlaying]);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg }]}>
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: p.color,
            opacity: p.opacity,
            transform: [{ scale: p.scale }],
          }}
        />
      ))}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// GRAVITY WATER VISUALIZER
// Buoyancy-based floating elements that bob on a liquid surface
// ══════════════════════════════════════════════════════════════════════════════

const GravityWaterVisualizer: React.FC<{
  isPlaying: boolean;
  palette: (typeof PALETTES)["gravity_water"];
}> = ({ isPlaying, palette }) => {
  const ELEMENT_COUNT = 12;
  const elements = useRef(
    Array.from({ length: ELEMENT_COUNT }, () => ({
      x: rand(30, W - 30),
      y: new Animated.Value(H * 0.6),
      scale: new Animated.Value(1),
      opacity: rand(0.4, 0.7),
      size: rand(30, 60),
      speed: rand(2500, 4500),
      color:
        palette.particles[Math.floor(Math.random() * palette.particles.length)],
    })),
  ).current;

  useEffect(() => {
    if (!isPlaying) return;

    elements.forEach((el) => {
      const run = () => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(el.y, {
                toValue: H * 0.55,
                duration: el.speed,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.sin),
              }),
              Animated.timing(el.scale, {
                toValue: 1.1,
                duration: el.speed,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.sin),
              }),
            ]),
            Animated.parallel([
              Animated.timing(el.y, {
                toValue: H * 0.65,
                duration: el.speed,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.sin),
              }),
              Animated.timing(el.scale, {
                toValue: 1,
                duration: el.speed,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.sin),
              }),
            ]),
          ]),
        ).start();
      };
      run();
    });

    return () => elements.forEach((el) => el.y.stopAnimation());
  }, [isPlaying]);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg }]}>
      {/* Liquid core glow */}
      <View
        style={{
          position: "absolute",
          bottom: -H * 0.1,
          left: -W * 0.2,
          right: -W * 0.2,
          height: H * 0.6,
          backgroundColor: palette.glow,
          borderRadius: W,
          opacity: 0.3,
        }}
      />

      {elements.map((el, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: el.x - el.size / 2,
            width: el.size,
            height: el.size,
            borderRadius: el.size / 2,
            backgroundColor: el.color,
            opacity: el.opacity,
            transform: [{ translateY: el.y }, { scale: el.scale }],
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export const SoundVisualizer: React.FC<SoundVisualizerProps> = ({
  soundKey: rawKey,
  isPlaying,
  isVisible = isPlaying,
  viewportHeight,
}) => {
  const mappedKey = SOUND_ID_MAP[rawKey] ?? "default";
  const lastSoundKeyRef = useRef<SoundKey>(mappedKey);
  const fadeAnim = useRef(new Animated.Value(isPlaying ? 1 : 0)).current;

  useEffect(() => {
    if (mappedKey !== "default") lastSoundKeyRef.current = mappedKey;
  }, [mappedKey]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 700,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, isVisible]);

  const soundKey = isPlaying ? mappedKey : lastSoundKeyRef.current;
  const palette = PALETTES[soundKey] ?? PALETTES.default;

  const renderVisualizer = () => {
    switch (soundKey) {
      case "rain":
        return <RainVisualizer isPlaying={isPlaying} palette={palette} />;
      case "fire":
        return <FireVisualizer isPlaying={isPlaying} palette={palette} />;
      case "campfire":
        return (
          <FireVisualizer isPlaying={isPlaying} palette={PALETTES.campfire} />
        );
      case "forest":
        return <ForestVisualizer isPlaying={isPlaying} palette={palette} />;
      case "thunder":
        return <ThunderVisualizer isPlaying={isPlaying} palette={palette} />;
      case "jazz":
        return <JazzVisualizer isPlaying={isPlaying} palette={palette} />;
      case "piano":
        return <PianoVisualizer isPlaying={isPlaying} palette={palette} />;
      case "wind":
        return <WindVisualizer isPlaying={isPlaying} palette={palette} />;
      case "tibetan_bowl":
        return (
          <TibetanBowlVisualizer isPlaying={isPlaying} palette={palette} />
        );
      case "gamma":
        return <GammaVisualizer isPlaying={isPlaying} palette={palette} />;
      case "gravity_water":
        return (
          <GravityWaterVisualizer isPlaying={isPlaying} palette={palette} />
        );
      default:
        return (
          <GravityWaterVisualizer
            isPlaying={isPlaying}
            palette={PALETTES.default}
          />
        );
    }
  };

  const stageStyle = viewportHeight
    ? [styles.embeddedStage, { top: -(H - viewportHeight) / 2 }]
    : StyleSheet.absoluteFill;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
    >
      <View style={stageStyle}>{renderVisualizer()}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  embeddedStage: {
    position: "absolute",
    left: 0,
    width: W,
    height: H,
  },
});

export default SoundVisualizer;
