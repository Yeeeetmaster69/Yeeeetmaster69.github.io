const fs = require('fs');
const path = require('path');

// Load secrets.json if it exists, otherwise use empty object
let secrets = {};
const secretsPath = path.join(__dirname, 'secrets.json');
if (fs.existsSync(secretsPath)) {
  try {
    secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
  } catch (error) {
    console.warn('Error reading secrets.json:', error.message);
  }
}

export default {
  expo: {
    name: "Handyman Pro",
    slug: "handyman-pro",
    version: "1.1.4",
    updates: {
      enabled: process.env.EXPO_UPDATES_ENABLED === 'true' || secrets.EXPO_UPDATES_ENABLED === 'true' || false,
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundler: "metro"
    },
    android: {
      package: "com.handyman.pro",
      versionCode: 114,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || secrets.GOOGLE_MAPS_API_KEY || "AIzaSyC67hd7nFUPyrwKmfQIIWw9mCDL9SXm9Ec"
        }
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "INTERNET",
        "CAMERA", 
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION"
      ]
    },
    web: {
      bundler: "metro",
      output: "static"
    },
    plugins: [
      "expo-notifications",
      [
        "expo-location",
        {
          isAndroidBackgroundLocationEnabled: true,
          locationAlwaysAndWhenInUsePermission: "Allow Handyman Pro to access your location"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID || secrets.EAS_PROJECT_ID || "c6f6c8c3-e58b-41c1-9d23-f37c7c5125f2"
      },
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY || secrets.FIREBASE_API_KEY || "AIzaSyDgto5b14cf1FATduNMWUn01qxySlD8YiE",
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || secrets.FIREBASE_AUTH_DOMAIN || "handyman-c1eee.firebaseapp.com",
        projectId: process.env.FIREBASE_PROJECT_ID || secrets.FIREBASE_PROJECT_ID || "handyman-c1eee",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || secrets.FIREBASE_STORAGE_BUCKET || "handyman-c1eee.firebasestorage.app",
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || secrets.FIREBASE_MESSAGING_SENDER_ID || "26293725527",
        appId: process.env.FIREBASE_APP_ID || secrets.FIREBASE_APP_ID || "1:26293725527:web:31d81e346d5b1f2dc83612",
        measurementId: process.env.FIREBASE_MEASUREMENT_ID || secrets.FIREBASE_MEASUREMENT_ID || "G-5H02SSPNKL"
      },
      functionsBaseUrl: process.env.FUNCTIONS_BASE_URL || secrets.FUNCTIONS_BASE_URL || "https://us-central1-handyman-c1eee.cloudfunctions.net",
      googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || secrets.GOOGLE_OAUTH_CLIENT_ID || "26293725527-1848t2av0e2tmp38bidnec4mvc64ante.apps.googleusercontent.com",
      // Commercial features configuration
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || secrets.STRIPE_PUBLISHABLE_KEY || "",
      squareAppId: process.env.SQUARE_APP_ID || secrets.SQUARE_APP_ID || "",
      squareLocationId: process.env.SQUARE_LOCATION_ID || secrets.SQUARE_LOCATION_ID || "",
      // App feature toggles
      enableOnboarding: process.env.ENABLE_ONBOARDING !== 'false',
      enableGeofencedTracking: process.env.ENABLE_GEOFENCED_TRACKING !== 'false',
      enablePayments: process.env.ENABLE_PAYMENTS === 'true' || secrets.ENABLE_PAYMENTS === 'true',
      // API endpoints
      adminPortalUrl: process.env.ADMIN_PORTAL_URL || secrets.ADMIN_PORTAL_URL || "https://admin.handymanpro.app",
    }
  }
};