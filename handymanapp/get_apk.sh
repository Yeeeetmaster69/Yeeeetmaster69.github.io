#!/bin/bash

# Quick APK Builder for Handyman Pro
# Simple interactive script to get your APK

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔨 Handyman Pro - Quick APK Builder${NC}"
echo "=================================="
echo

echo "This script will help you build an APK of the Handyman Pro app."
echo "You can install the APK on any Android device."
echo

echo "📋 What you need:"
echo "• An Expo account (free at https://expo.dev)"
echo "• Internet connection"
echo

read -p "Ready to continue? (y/n): " ready
if [[ $ready != "y" && $ready != "Y" ]]; then
    echo "Goodbye!"
    exit 0
fi

echo
echo -e "${BLUE}Step 1: Checking environment...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the handymanapp directory"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js not found"
    echo "Please install Node.js first: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo
echo -e "${BLUE}Step 2: Setting up EAS CLI...${NC}"

# Check for EAS CLI
if ! ./node_modules/.bin/eas --version &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npx expo install @expo/eas-cli
fi

echo "✅ EAS CLI ready"

echo
echo -e "${BLUE}Step 3: Login to Expo...${NC}"

# Check if logged in
if ! ./node_modules/.bin/eas whoami &> /dev/null; then
    echo "🔐 Please log in to your Expo account:"
    ./node_modules/.bin/eas login
else
    echo "✅ Already logged in as: $(./node_modules/.bin/eas whoami)"
fi

echo
echo -e "${BLUE}Step 4: Building your APK...${NC}"

echo "🏗️  Starting cloud build..."
echo "This will take 5-15 minutes depending on queue."

./node_modules/.bin/eas build --platform android --profile preview

echo
echo -e "${GREEN}🎉 Build complete!${NC}"
echo
echo "Your APK is ready to download from:"
echo "👉 https://expo.dev (check your builds page)"
echo
echo "📱 To install on Android:"
echo "1. Download the APK file"
echo "2. Enable 'Install from Unknown Sources' in Android Settings"
echo "3. Open the APK file to install"
echo
echo -e "${YELLOW}💡 Tip: Bookmark the build URL to share with others!${NC}"