# 📱 Handyman Pro APK Files

# 📱 Handyman Pro APK Files

## 🚀 Download & Build Options

### ✅ OPTION 1: Build Latest APKs

**🚀 GitHub Actions Build** - Get the freshest APKs
- **[⚡ Build APK Now](https://github.com/Yeeeetmaster69/Yeeeetmaster69.github.io/actions/workflows/build-apk.yml)** - Latest debug version
- **[📦 Build Release](https://github.com/Yeeeetmaster69/Yeeeetmaster69.github.io/actions/workflows/build-release.yml)** - Production version

Click → "Run workflow" → Download from Artifacts (~5 minutes)

### 🛠️ OPTION 2: Build Your Own APK

**📦 HandymanPro-SourceCode.zip** - Complete source code package
- **100% working source code** included
- **5-minute build process** with included instructions  
- **Fully functional APK** with all features
- **Step-by-step guide** in BUILD_INSTRUCTIONS.md

### 📥 Available Downloads

Choose your preferred option:

**🎯 OPTION 1: On-Demand APK Build**
- **[⚡ Build Latest APK](https://github.com/Yeeeetmaster69/Yeeeetmaster69.github.io/actions/workflows/build-apk.yml)** - Fresh build from source
- **[📦 Build Release APK](https://github.com/Yeeeetmaster69/Yeeeetmaster69.github.io/actions/workflows/build-release.yml)** - Production optimized

**🛠️ OPTION 2: Build Your Own**

| File | Type | Description |
|------|------|-------------|
| `HandymanPro-SourceCode.zip` | **Source Code** | **Complete project** - Build your own APK |
| **GitHub Actions** | **Live APK Build** | **[⚡ Build fresh APK](https://github.com/Yeeeetmaster69/Yeeeetmaster69.github.io/actions/workflows/build-apk.yml)** (5 min) |
| **Release Build** | **Production APK** | **[📦 Build optimized release](https://github.com/Yeeeetmaster69/Yeeeetmaster69.github.io/actions/workflows/build-release.yml)** |

### 📍 File Location

**Directory**: `/apk/`  
**Full Path**: `https://github.com/Yeeeetmaster69/Yeeeetmaster69.github.io/tree/main/apk`

### 🔗 Quick Access Links

- **🚀 [Download Source Code](./HandymanPro-SourceCode.zip)** - Build your own APK
- **📖 [View Build Instructions](../BUILD_AND_DEPLOY_APK.md)** - How to build APKs
- **📁 [Browse This Directory](./)** - See all files

### 🚀 Quick Installation (GitHub Actions APKs)

**For Latest APKs:**
1. **Click** the "Build APK Now" link above
2. **Click** "Run workflow" button (GitHub sign-in required)  
3. **Wait** for build completion (~5 minutes)
4. **Download** APK from "Artifacts" section at bottom of workflow page
5. **Enable** "Install from Unknown Sources" on your Android device
6. **Install** the downloaded APK file
7. **Launch** "Handyman Pro" and login with demo credentials below

### 🔨 Build Instructions

**Step 1:** Download HandymanPro-SourceCode.zip above

**Step 2:** Extract and build your APK:
```bash
# Extract the ZIP file
# Open terminal in handymanapp folder
npm install
npx eas build --platform android --profile preview --local
```

**Step 3:** Install your built APK:
1. **Enable** "Install from Unknown Sources" on your Android device
2. **Transfer** your built APK to your phone  
3. **Install** the APK file
4. **Launch** "Handyman Pro" from your app drawer

### 🔐 Demo Login Credentials

Test the app with these demo accounts:

- **Admin**: Username: `admin` / Password: `admin123`
- **Worker**: Username: `worker` / Password: `worker123`
- **Client**: Username: `client` / Password: `client123`

### ℹ️ App Information

- **Package Name**: `com.handyman.pro`
- **App Name**: Handyman Pro
- **Built With**: Expo SDK 52.0.18, React Native 0.79.5
- **Android Support**: Minimum SDK 24, Target SDK 35
- **Last Built**: August 25, 2025

### 🛠️ Technical Details

For technical documentation and build information, see:
- [APK Build Documentation](../APK_BUILD_README.md)
- [Build Verification Log](../APK_BUILD_VERIFICATION.txt)

---

**Note**: APK files are generated fresh using GitHub Actions build system. This ensures you always get the latest version with all features functional.