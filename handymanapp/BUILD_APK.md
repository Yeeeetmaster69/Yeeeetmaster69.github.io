# Building APK for Handyman Pro

This guide provides multiple ways to build the Handyman Pro app as an APK file that can be installed on Android devices.

## 🚀 Quick Start (Recommended)

The fastest way to get your APK:

```bash
./get_apk.sh
```

This interactive script will guide you through the entire process.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Expo account** (free at [expo.dev](https://expo.dev))
- **Internet connection**

## 🛠️ Build Methods

### Method 1: EAS Build (Cloud) - Recommended ⭐

**Best for:** Most users, no local setup required

```bash
# Install dependencies
npm install

# Log in to Expo (one-time setup)
npx eas login

# Build APK
npx eas build --platform android --profile preview
```

**Advantages:**
- No Android SDK required
- Builds in the cloud
- Consistent results
- Fast setup

**Time:** 5-15 minutes (depending on queue)

### Method 2: Local Build

**Best for:** Developers with Android SDK already installed

```bash
# Generate native Android project
npx expo prebuild --platform android --clean

# Build APK locally (requires Android SDK)
cd android
./gradlew assembleDebug
```

**Requirements:**
- Android SDK installed
- ANDROID_HOME environment variable set
- Java Development Kit (JDK)

### Method 3: Automated Script

Use the comprehensive build script:

```bash
./build_apk.sh
```

This script provides options for all build methods and handles common issues automatically.

## 📱 Installing the APK

Once you have your APK file:

1. **Download** the APK to your Android device
2. **Enable** "Install from Unknown Sources" in Android Settings:
   - Settings → Security → Unknown Sources (Android 7 and below)
   - Settings → Apps → Special Access → Install Unknown Apps (Android 8+)
3. **Open** the APK file to install
4. **Launch** the Handyman Pro app

## 🔧 Build Profiles

### Preview (Default)
- **Purpose:** Testing and distribution
- **Optimization:** Balanced
- **Debugging:** Limited
- **Size:** Smaller

```bash
npx eas build --platform android --profile preview
```

### Development
- **Purpose:** Development and debugging
- **Optimization:** None
- **Debugging:** Full
- **Size:** Larger

```bash
npx eas build --platform android --profile development
```

### Production
- **Purpose:** Play Store release
- **Optimization:** Maximum
- **Format:** AAB (Android App Bundle)

```bash
npx eas build --platform android --profile production
```

## 🚨 Troubleshooting

### Common Issues

#### "Not logged in to EAS"
```bash
npx eas login
```

#### "Android SDK not found" (Local builds only)
1. Install Android Studio
2. Set ANDROID_HOME environment variable
3. Add SDK tools to PATH

#### "Build failed - Out of memory"
The cloud build failed due to memory constraints. Try:
- Using the `preview` profile instead of `development`
- Removing unused dependencies
- Optimizing large assets

#### "Expo CLI not found"
```bash
npm install -g @expo/cli
# or use npx
npx expo --version
```

### Build Logs

Check build logs at:
- **EAS Builds:** https://expo.dev (your account → builds)
- **Local Builds:** Terminal output during build

## 📂 File Structure

After building, you'll find:

```
handymanapp/
├── builds/                 # Local APK outputs
│   └── handyman-pro-*.apk
├── android/                # Generated native code
│   ├── app/
│   └── build.gradle
├── build_apk.sh           # Comprehensive build script
├── get_apk.sh             # Quick start script
└── eas.json               # EAS build configuration
```

## ⚙️ Configuration

### EAS Configuration (`eas.json`)

```json
{
  "build": {
    "development": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal", 
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### App Configuration (`app.json`)

Key settings for APK builds:

```json
{
  "expo": {
    "name": "Handyman Pro",
    "slug": "handyman-pro",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "android": {
      "package": "com.handyman.pro",
      "versionCode": 1
    }
  }
}
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Build APK
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx eas build --platform android --profile preview --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## 📈 Performance Tips

### Reducing APK Size
- Remove unused dependencies
- Optimize images and assets
- Use app bundles for Play Store
- Enable ProGuard (production builds)

### Faster Builds
- Use `preview` profile for testing
- Cache `node_modules` in CI
- Pre-build locally for development

## 🆘 Support

If you encounter issues:

1. **Check logs** in terminal or EAS dashboard
2. **Update dependencies** with `npx expo install --fix`
3. **Clear cache** with `npx expo start --clear`
4. **Ask for help** in [Expo Discord](https://discord.gg/expo)

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android Development Guide](https://developer.android.com/guide)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)

---

**Ready to build?** Run `./get_apk.sh` to get started! 🚀