#!/bin/bash

# Handyman Pro APK Build Script
# This script provides comprehensive APK build functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$PROJECT_ROOT/builds"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

print_status "Handyman Pro APK Builder"
print_status "Project directory: $PROJECT_ROOT"

# Create builds directory
mkdir -p "$BUILD_DIR"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if project name matches
if ! grep -q '"name": "handyman-pro"' package.json; then
    print_warning "Project name doesn't match expected 'handyman-pro'"
fi

# Function to check requirements
check_requirements() {
    print_status "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js: $(node --version)"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm: $(npm --version)"
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found. Installing dependencies..."
        npm install
    fi
}

# Function to install/setup EAS
setup_eas() {
    print_status "Setting up EAS CLI..."
    
    # Check if EAS CLI is available
    if ! ./node_modules/.bin/eas --version &> /dev/null; then
        print_status "Installing EAS CLI..."
        npm install -g @expo/eas-cli
    fi
    
    print_success "EAS CLI is ready"
}

# Function to build with EAS (recommended)
build_with_eas() {
    local profile=${1:-preview}
    
    print_status "Building APK with EAS Build (profile: $profile)..."
    
    # Check if user is logged in
    if ! ./node_modules/.bin/eas whoami &> /dev/null; then
        print_warning "Not logged in to EAS. Please run: eas login"
        echo "To build with EAS, you need to:"
        echo "1. Create an Expo account at https://expo.dev"
        echo "2. Run: npx eas login"
        echo "3. Run this script again"
        return 1
    fi
    
    print_status "Building APK for Android..."
    ./node_modules/.bin/eas build --platform android --profile "$profile" --non-interactive
    
    print_success "EAS build started! Check your build status at: https://expo.dev"
    print_success "Once complete, download your APK from the build page"
}

# Function to prebuild for local development
prebuild_project() {
    print_status "Generating native Android project..."
    
    if [ -d "android" ]; then
        print_warning "Android directory already exists. Cleaning..."
        rm -rf android
    fi
    
    ./node_modules/.bin/expo prebuild --platform android --clean
    
    print_success "Native Android project generated in ./android"
}

# Function to build locally (requires Android SDK)
build_local() {
    print_status "Building APK locally..."
    
    # Check if Android project exists
    if [ ! -d "android" ]; then
        print_status "Android project not found. Generating..."
        prebuild_project
    fi
    
    # Check for Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        print_error "ANDROID_HOME environment variable not set"
        print_error "Please install Android SDK and set ANDROID_HOME"
        return 1
    fi
    
    # Check for gradlew
    if [ ! -f "android/gradlew" ]; then
        print_error "gradlew not found in android directory"
        return 1
    fi
    
    cd android
    
    print_status "Building debug APK..."
    ./gradlew assembleDebug
    
    # Find the APK
    APK_PATH=$(find . -name "*.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        OUTPUT_NAME="handyman-pro-debug-${TIMESTAMP}.apk"
        cp "$APK_PATH" "../$BUILD_DIR/$OUTPUT_NAME"
        print_success "APK built successfully: $BUILD_DIR/$OUTPUT_NAME"
    else
        print_error "APK not found after build"
        return 1
    fi
    
    cd ..
}

# Main build function
main() {
    print_status "Starting APK build process..."
    
    check_requirements
    
    echo
    echo "Choose build method:"
    echo "1) EAS Build (Cloud) - Recommended"
    echo "2) Local Build (Requires Android SDK)"
    echo "3) Prebuild only (Generate native code)"
    echo "4) Development build"
    echo
    
    if [ -n "$1" ]; then
        choice=$1
    else
        read -p "Enter your choice (1-4): " choice
    fi
    
    case $choice in
        1)
            setup_eas
            build_with_eas "preview"
            ;;
        2)
            build_local
            ;;
        3)
            prebuild_project
            ;;
        4)
            setup_eas
            build_with_eas "development"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    print_success "Build process completed!"
}

# Run main function with command line arguments
main "$@"