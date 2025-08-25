#!/bin/bash

# Build Verification Script for Handyman Pro APK
# This script verifies that the Android build process works correctly

set -e  # Exit on any error

echo "🔨 Starting Handyman Pro APK Build Verification..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "HandymanMinimal" ]; then
    echo "❌ Error: Please run this script from the repository root"
    exit 1
fi

echo "📂 Checking HandymanMinimal project structure..."
if [ ! -d "HandymanMinimal" ]; then
    echo "❌ Error: HandymanMinimal directory not found"
    exit 1
fi

cd HandymanMinimal

echo "📦 Installing npm dependencies..."
npm install

echo "🏗️  Building Android APK..."
cd android
chmod +x gradlew
./gradlew assembleRelease

# Check if APK was created
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK_PATH" ]; then
    echo "❌ Error: APK file not found at $APK_PATH"
    exit 1
fi

# Get APK file size
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
APK_SIZE_BYTES=$(stat -c%s "$APK_PATH")

echo "✅ Build completed successfully!"
echo "📱 APK Details:"
echo "   File: $APK_PATH"
echo "   Size: $APK_SIZE ($APK_SIZE_BYTES bytes)"
echo "   Type: $(file "$APK_PATH")"

# Verify APK size is reasonable (should be around 56MB)
MIN_SIZE=$((50 * 1024 * 1024))  # 50MB
MAX_SIZE=$((100 * 1024 * 1024)) # 100MB

if [ "$APK_SIZE_BYTES" -lt "$MIN_SIZE" ]; then
    echo "⚠️  Warning: APK size ($APK_SIZE) seems too small. Expected ~56MB"
elif [ "$APK_SIZE_BYTES" -gt "$MAX_SIZE" ]; then
    echo "⚠️  Warning: APK size ($APK_SIZE) seems too large. Expected ~56MB"
else
    echo "✅ APK size looks good!"
fi

echo ""
echo "🎉 Build verification completed successfully!"
echo "The APK can be found at: HandymanMinimal/android/$APK_PATH"