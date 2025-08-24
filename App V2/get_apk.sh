#!/bin/bash

# Quick APK Builder for Handyman Pro
# This script provides a simple way to get your APK

echo "🏗️  Handyman Pro APK Builder"
echo "=============================="
echo ""

# Check if we're in the right directory
if [[ ! -f "app.json" ]]; then
    echo "❌ Please run this script from the 'App V2' directory"
    exit 1
fi

echo "📋 Choose how you want to build your APK:"
echo ""
echo "1. 🌐 EAS Build (Cloud) - Easiest, no setup required"
echo "2. 💻 Local Build - Requires Android SDK setup"
echo "3. 📖 Show detailed instructions"
echo "4. ❌ Exit"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Starting EAS Cloud Build..."
        echo ""
        echo "📝 Steps you'll need to complete:"
        echo "   1. Create a free Expo account at https://expo.dev"
        echo "   2. Run: eas login"
        echo "   3. Run: eas build --platform android --profile preview"
        echo ""
        echo "🚀 The build will be uploaded to Expo's servers and you'll get a download link!"
        echo ""
        echo "Ready to start? The next commands to run are:"
        echo "   npm install"
        echo "   eas login"
        echo "   eas build --platform android --profile preview"
        ;;
        
    2)
        echo ""
        echo "💻 Local Build Requirements:"
        echo ""
        echo "❗ You need:"
        echo "   - Java JDK 17+"
        echo "   - Android Studio or Android SDK"
        echo "   - ANDROID_HOME environment variable set"
        echo ""
        echo "📝 Commands to run:"
        echo "   npm install"
        echo "   npx expo prebuild --platform android --clean"
        echo "   cd android && ./gradlew assembleRelease"
        echo ""
        echo "📱 Your APK will be at: android/app/build/outputs/apk/release/app-release.apk"
        ;;
        
    3)
        echo ""
        echo "📖 For detailed instructions, check these files:"
        echo "   - BUILD_APK.md (Complete guide)"
        echo "   - README.md (Quick start section)"
        echo ""
        echo "🌐 Online resources:"
        echo "   - Expo Documentation: https://docs.expo.dev/"
        echo "   - EAS Build Guide: https://docs.expo.dev/build/introduction/"
        ;;
        
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎯 Quick Tips:"
echo "   - EAS Build is recommended for beginners"
echo "   - The APK will work on any Android device"
echo "   - Enable 'Unknown Sources' to install the APK"
echo ""
echo "🚀 Your Handyman Pro app will be ready to install on your phone!"