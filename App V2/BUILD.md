# Handyman Pro Build Instructions

## Building for Production

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed globally: `npm install -g expo-cli`
- EAS CLI installed: `npm install -g eas-cli`

### Building APK (Android)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure EAS Build (if not already done):**
   ```bash
   eas login
   eas init
   ```

3. **Build APK for testing:**
   ```bash
   eas build --platform android --profile preview
   ```

4. **Build APK for release:**
   ```bash
   eas build --platform android --profile production
   ```

### Building for iOS

1. **Build for iOS (requires Apple Developer account):**
   ```bash
   eas build --platform ios --profile production
   ```

### Local Development

1. **Start development server:**
   ```bash
   npm run start
   ```

2. **Run on Android:**
   ```bash
   npm run android
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```

### Environment Configuration

The app is configured with Firebase and uses the following services:
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Cloud Functions
- Push Notifications

### Build Configuration

The build is configured in `eas.json`:
- **Preview**: Internal distribution, APK format
- **Production**: App Store/Play Store distribution

### Testing

1. **Lint code:**
   ```bash
   npm run lint
   ```

2. **Test export:**
   ```bash
   npx expo export
   ```

3. **Test on device:**
   - Install Expo Go app
   - Scan QR code from `npm run start`

### Known Issues & Solutions

1. **Dependency version mismatches:** 
   - The app builds successfully despite version warnings
   - These are minor compatibility notices and don't affect functionality

2. **Firebase configuration:**
   - Ensure Firebase project is properly configured
   - Verify API keys in `app.json`

3. **Permissions:**
   - Location permissions are configured for background tracking
   - Notification permissions are set up for push messages

### Release Checklist

- [ ] Code linted without errors
- [ ] All TODO items resolved
- [ ] Accessibility features tested
- [ ] Firebase configuration verified
- [ ] Build successfully generated
- [ ] APK tested on multiple devices
- [ ] Performance tested on older devices
- [ ] Accessibility tested with screen readers

### Support

For build issues:
1. Check Expo documentation: https://docs.expo.dev/
2. Review Firebase setup: https://firebase.google.com/docs
3. EAS Build documentation: https://docs.expo.dev/build/introduction/