// Expo app config. Values that differ per build environment come from
// EXPO_PUBLIC_* env vars so a fresh clone runs without editing this file.
module.exports = {
  expo: {
    name: "Tie-Down Roping",
    slug: "tiedown",
    scheme: "tiedown",
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    splash: {
      resizeMode: 'contain',
      backgroundColor: "#12100e",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "pro.tiedown.app",
      infoPlist: {
        NSCameraUsageDescription: 'Record your runs so TieDown can analyse them.',
        NSMicrophoneUsageDescription: 'Capture audio alongside your run video.',
        NSPhotoLibraryUsageDescription: 'Pick a run video to analyse.',
        NSLocationWhenInUseUsageDescription:
          'Find rodeos near you and drop a pin on the grounds you are standing at.',
      },
      config: {
        // Absent in dev; the map falls back to a coordinate card without it.
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY,
      },
    },
    android: {
      package: "pro.tiedown.app",
      adaptiveIcon: {
        backgroundColor: "#12100e",
      },
      edgeToEdgeEnabled: true,
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY,
        },
      },
    },
    web: { bundler: 'metro', output: 'static' },
    plugins: [
      'expo-router',
      'expo-video',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'Find rodeos near you and drop a pin on the grounds you are standing at.',
        },
      ],
    ],
    experiments: { typedRoutes: true },
    extra: {
      domain: "tiedown.pro",
      eventType: "tiedown",
    },
  },
};
