#!/bin/bash

# Build APK Script for Handyman Pro
# This script automates the APK building process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -f "app.json" ]]; then
    print_error "This script must be run from the App V2 directory containing package.json and app.json"
    exit 1
fi

print_status "Starting APK build process for Handyman Pro..."

# Step 1: Install dependencies
print_status "Installing Node.js dependencies..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 2: Fix Expo compatibility
print_status "Fixing Expo package compatibility..."
if npx expo install --fix; then
    print_success "Package compatibility fixed"
else
    print_warning "Package compatibility check had issues, continuing..."
fi

# Step 3: Check for required assets
print_status "Checking for required assets..."
if [[ ! -f "assets/icon.png" ]]; then
    print_warning "Missing assets/icon.png, copying from root directory..."
    if [[ -f "../icon-512.png" ]]; then
        cp "../icon-512.png" "assets/icon.png"
        print_success "Icon copied successfully"
    else
        print_error "No icon file found. Please ensure you have an icon.png in the assets folder."
        exit 1
    fi
fi

if [[ ! -f "assets/splash.png" ]]; then
    print_warning "Missing assets/splash.png, using icon as splash..."
    cp "assets/icon.png" "assets/splash.png"
fi

if [[ ! -f "assets/adaptive-icon.png" ]]; then
    print_warning "Missing assets/adaptive-icon.png, using regular icon..."
    cp "assets/icon.png" "assets/adaptive-icon.png"
fi

# Step 4: Choose build method
print_status "Choose your build method:"
echo "1. EAS Build (Cloud build - Recommended)"
echo "2. Local build (Requires Android SDK)"
echo "3. Development build (EAS)"
echo "4. Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_status "Starting EAS Build (Cloud)..."
        print_status "Note: You need to be logged in to Expo. Run 'eas login' if needed."
        
        # Check if EAS CLI is installed
        if ! command -v eas &> /dev/null; then
            print_status "Installing EAS CLI..."
            npm install -g eas-cli
        fi
        
        print_status "Building APK with EAS..."
        if eas build --platform android --profile preview --non-interactive; then
            print_success "EAS build started! Check your email or Expo dashboard for the download link."
        else
            print_error "EAS build failed. You may need to run 'eas login' first."
            print_status "Try running: eas login"
            print_status "Then run: eas build --platform android --profile preview"
        fi
        ;;
        
    2)
        print_status "Starting local build..."
        
        # Check for Java
        if ! command -v java &> /dev/null; then
            print_error "Java is not installed. Please install JDK 17 or higher."
            exit 1
        fi
        
        # Check for Android SDK
        if [[ -z "$ANDROID_HOME" ]] && [[ -z "$ANDROID_SDK_ROOT" ]]; then
            print_error "ANDROID_HOME or ANDROID_SDK_ROOT not set."
            print_error "Please install Android Studio and set ANDROID_HOME environment variable."
            exit 1
        fi
        
        # Generate native Android project
        print_status "Generating native Android project..."
        if npx expo prebuild --platform android --clean; then
            print_success "Native Android project generated"
        else
            print_error "Failed to generate native Android project"
            exit 1
        fi
        
        # Build APK
        print_status "Building APK with Gradle..."
        cd android
        chmod +x gradlew
        if ./gradlew assembleRelease; then
            print_success "APK built successfully!"
            APK_PATH="app/build/outputs/apk/release/app-release.apk"
            if [[ -f "$APK_PATH" ]]; then
                print_success "APK location: android/$APK_PATH"
                print_status "You can now transfer this APK to your phone and install it."
            else
                print_warning "APK file not found at expected location. Check android/app/build/outputs/apk/ folder."
            fi
        else
            print_error "APK build failed"
            exit 1
        fi
        ;;
        
    3)
        print_status "Starting development build with EAS..."
        
        # Check if EAS CLI is installed
        if ! command -v eas &> /dev/null; then
            print_status "Installing EAS CLI..."
            npm install -g eas-cli
        fi
        
        print_status "Building development APK with EAS..."
        if eas build --platform android --profile development --non-interactive; then
            print_success "EAS development build started! Check your email or Expo dashboard for the download link."
        else
            print_error "EAS build failed. You may need to run 'eas login' first."
        fi
        ;;
        
    4)
        print_status "Exiting..."
        exit 0
        ;;
        
    *)
        print_error "Invalid choice. Please run the script again and choose 1, 2, 3, or 4."
        exit 1
        ;;
esac

print_success "Build process completed!"
print_status ""
print_status "Next steps:"
print_status "1. Download the APK to your phone"
print_status "2. Enable 'Install from Unknown Sources' in Android settings"
print_status "3. Open the APK file and install the app"
print_status "4. Grant necessary permissions when the app starts"
print_status ""
print_status "Your Handyman Pro app is ready to use!"