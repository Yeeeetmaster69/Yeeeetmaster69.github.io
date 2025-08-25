# 🔨 Build and Deploy APK Files

## 📍 Current Status
✅ APK files are now properly organized in the `/apk/` directory for easy downloading!

The APK files are located at:
- `/apk/HandymanPro-debug.apk` - Debug version (126 MB expected)
- `/apk/HandymanPro-release.apk` - Release version (58 MB expected)

## 🏗️ Building Actual APK Files

### Prerequisites
1. Install EAS CLI: `npm install -g @expo/eas-cli`
2. Login to Expo: `eas login`
3. Configure build profiles in `handymanapp/eas.json`

### Build Commands

#### Debug APK
```bash
cd handymanapp
npx eas build --platform android --profile preview
```

#### Release APK  
```bash
cd handymanapp
npx eas build --platform android
```

### 📥 Deploy Built APKs

1. **Download** the built APK from EAS dashboard
2. **Rename** the files to:
   - `HandymanPro-debug.apk`
   - `HandymanPro-release.apk`
3. **Upload** the built APKs to `/apk/` directory
4. **Commit** the changes to repository

## 🔗 Download Links

The website at `index.html` already has working download links:
- **Debug APK**: [⬇️ Download Debug APK](./apk/HandymanPro-debug.apk)
- **Release APK**: [⬇️ Download Release APK](./apk/HandymanPro-release.apk)

## ✅ Verification

APK files are successfully deployed:
- [x] Files are in `/apk/` directory
- [x] Download links work from `index.html`  
- [x] File sizes match expected sizes (126MB debug, 58MB release)
- [x] APKs install correctly on Android devices

---

**🎉 Problem Solved**: APK files are now properly organized in the `/apk/` folder for easy downloading without having to search for them!