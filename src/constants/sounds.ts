export type SoundCategory = "Relax" | "Study" | "Walk" | "Focus" | "Hangout";

export type Sound = {
  id: string;
  name: string;
  icon: string;
  vibe: string;
  category: SoundCategory;
  asset: any;
};

export const SOUNDS: Sound[] = [
  {
    id: "rain",
    asset: require("../../assets/sounds/rain.mp3"),
    name: "Rain",
    icon: "🌧️",
    vibe: "Classic sleep",
    category: "Relax",
  },
  {
    id: "ocean",
    asset: require("../../assets/sounds/ocean.mp3"),
    name: "Ocean Waves",
    icon: "🌊",
    vibe: "Relaxing",
    category: "Relax",
  },
  {
    id: "forest",
    asset: require("../../assets/sounds/forest.mp3"),
    name: "Forest",
    icon: "🌲",
    vibe: "Nature",
    category: "Relax",
  },
  {
    id: "whitenoise",
    asset: require("../../assets/sounds/whitenoise.mp3"),
    name: "White Noise",
    icon: "📻",
    vibe: "Focus/sleep",
    category: "Focus",
  },
  {
    id: "fan",
    asset: require("../../assets/sounds/fan.mp3"),
    name: "Fan",
    icon: "🌀",
    vibe: "Familiar",
    category: "Relax",
  },
  {
    id: "thunder",
    asset: require("../../assets/sounds/thunder.mp3"),
    name: "Thunderstorm",
    icon: "⛈️",
    vibe: "Deep sleep",
    category: "Relax",
  },
  {
    id: "fireplace",
    asset: require("../../assets/sounds/fireplace.mp3"),
    name: "Fireplace",
    icon: "🔥",
    vibe: "Cozy",
    category: "Relax",
  },
  {
    id: "river",
    asset: require("../../assets/sounds/river.mp3"),
    name: "River Stream",
    icon: "💧",
    vibe: "Calm",
    category: "Relax",
  },
  {
    id: "bird",
    asset: require("../../assets/sounds/bird.mp3"),
    name: "Birds",
    icon: "🐦",
    vibe: "Morning calm",
    category: "Walk",
  },
  {
    id: "brownnoise",
    asset: require("../../assets/sounds/brownnoise.mp3"),
    name: "Brown Noise",
    icon: "🎙️",
    vibe: "Deep focus",
    category: "Focus",
  },
  {
    id: "cafe",
    asset: require("../../assets/sounds/cafe.mp3"),
    name: "Café",
    icon: "☕",
    vibe: "Focused work",
    category: "Focus",
  },
  {
    id: "wind",
    asset: require("../../assets/sounds/wind.mp3"),
    name: "Wind",
    icon: "🍃",
    vibe: "Airy",
    category: "Relax",
  },
  {
    id: "crickets",
    asset: require("../../assets/sounds/crickets.mp3"),
    name: "Crickets",
    icon: "🦗",
    vibe: "Night calm",
    category: "Relax",
  },
  {
    id: "underwater",
    asset: require("../../assets/sounds/underwater.mp3"),
    name: "Underwater",
    icon: "🐋",
    vibe: "Deep calm",
    category: "Relax",
  },
  {
    id: "jazz",
    asset: require("../../assets/sounds/jazz.mp3"),
    name: "Jazz Lounge",
    icon: "🎷",
    vibe: "Smooth vibes",
    category: "Hangout",
  },
  {
    id: "piano",
    asset: require("../../assets/sounds/piano.mp3"),
    name: "Piano Rain",
    icon: "🎹",
    vibe: "Emotional calm",
    category: "Relax",
  },
  {
    id: "tibetan",
    asset: require("../../assets/sounds/tibetan.mp3"),
    name: "Tibetan Bowl",
    icon: "🔔",
    vibe: "Meditation",
    category: "Relax",
  },
  {
    id: "train",
    asset: require("../../assets/sounds/train.mp3"),
    name: "Train Ride",
    icon: "🚂",
    vibe: "Nostalgic",
    category: "Walk",
  },
  {
    id: "library",
    asset: require("../../assets/sounds/library.mp3"),
    name: "Library",
    icon: "📚",
    vibe: "Study focus",
    category: "Study",
  },
  {
    id: "beach",
    asset: require("../../assets/sounds/beach.mp3"),
    name: "Beach",
    icon: "🏖️",
    vibe: "Summer calm",
    category: "Relax",
  },
  {
    id: "storm",
    asset: require("../../assets/sounds/storm.mp3"),
    name: "Storm at Sea",
    icon: "🌊",
    vibe: "Intense sleep",
    category: "Relax",
  },
  {
    id: "aurora",
    asset: require("../../assets/sounds/aurora.mp3"),
    name: "Aurora",
    icon: "🌌",
    vibe: "Cosmic peace",
    category: "Relax",
  },
  {
    id: "classroom",
    asset: require("../../assets/sounds/classroom.mp3"),
    name: "Classroom",
    icon: "🏫",
    vibe: "Focused study",
    category: "Study",
  },
  {
    id: "office",
    asset: require("../../assets/sounds/office.mp3"),
    name: "Office",
    icon: "🏢",
    vibe: "Productive hum",
    category: "Focus",
  },
  {
    id: "waves",
    asset: require("../../assets/sounds/waves.mp3"),
    name: "Waves",
    icon: "🌬️",
    vibe: "Gentle breeze",
    category: "Relax",
  },
  {
    id: "radio",
    asset: require("../../assets/sounds/radio.mp3"),
    name: "Radio Static",
    icon: "📡",
    vibe: "Retro noise",
    category: "Hangout",
  },
];

export const SOUND_MAP: Record<string, Sound> = SOUNDS.reduce(
  (map, sound) => {
    map[sound.id] = sound;
    return map;
  },
  {} as Record<string, Sound>,
);
