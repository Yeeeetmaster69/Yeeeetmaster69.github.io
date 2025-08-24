# Build APK for Handyman Pro App

This guide will help you build an APK file that you can install on your Android phone.

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **Java Development Kit (JDK)** (version 17 or higher)
3. **Android SDK** or **Android Studio**
4. **Expo CLI** and **EAS CLI**

## Method 1: Using EAS Build (Recommended - Cloud Build)

EAS Build is the easiest way to build your APK as it handles all dependencies and build environment for you.

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Build APK
```bash
eas build --platform android --profile preview
```

The build will be uploaded to Expo's servers and you'll get a download link.

## Method 2: Local Build

If you prefer to build locally or EAS Build doesn't work:

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Fix Package Compatibility
```bash
npx expo install --fix
```

### Step 3: Generate Native Android Project
```bash
npx expo prebuild --platform android --clean
```

### Step 4: Build APK
```bash
cd android
./gradlew assembleRelease
```

The APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

## Method 3: Using Expo Development Build

For a development version that's easier to build:

### Step 1: Configure for Development Build
```bash
npx expo install expo-dev-client
```

### Step 2: Build Development APK
```bash
eas build --platform android --profile development
```

## Troubleshooting

### Common Issues:

1. **Network connectivity issues during build:**
   - Try building with a stable internet connection
   - Use EAS Build instead of local build

2. **Missing Android SDK:**
   - Install Android Studio which includes the SDK
   - Set ANDROID_HOME environment variable

3. **Java version issues:**
   - Ensure you have JDK 17 installed
   - Check with `java -version`

4. **Missing image assets:**
   - Ensure icon.png, adaptive-icon.png, and splash.png exist in assets folder

## Download and Install APK

Once your APK is built:

1. **Download the APK** to your phone
2. **Enable "Install from Unknown Sources"** in your Android settings
3. **Open the APK file** and follow installation prompts
4. **Grant necessary permissions** when the app starts

## App Features

Your Handyman Pro app includes:
- Role-based authentication (Client/Worker/Admin)
- GPS tracking and time logging
- Job management
- Photo uploads
- Push notifications
- Firebase backend integration

## Need Help?

If you encounter issues:
1. Check the build logs for specific error messages
2. Ensure all dependencies are properly installed
3. Try using EAS Build for the most reliable results
4. Contact support with specific error messages

---

**Note:** The APK generated will be a release build suitable for installation on any Android device. Make sure to test the app thoroughly before distributing to users.