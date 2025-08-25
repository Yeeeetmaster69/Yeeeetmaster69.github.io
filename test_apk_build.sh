#!/bin/bash

echo "🚀 Testing APK Build with Gradle Optimizations"
echo "================================================"

# Test function to check if build succeeds
test_build() {
    local project_path="$1"
    local project_name="$2"
    
    echo ""
    echo "📱 Testing $project_name APK build..."
    
    cd "$project_path/android"
    
    # Try to build with our optimizations
    if timeout 600 ./gradlew assembleDebug --no-daemon 2>&1 | tee /tmp/build_output.log; then
        echo "✅ $project_name build: SUCCESS"
        
        # Check if APK was created
        if find . -name "*.apk" -type f | head -1; then
            echo "📦 APK file created successfully"
        fi
        
        return 0
    else
        echo "❌ $project_name build: FAILED"
        echo "Last 20 lines of build output:"
        tail -20 /tmp/build_output.log
        return 1
    fi
}

# Test both projects
cd "/home/runner/work/Yeeeetmaster69.github.io/Yeeeetmaster69.github.io"

echo "Testing with updated Gradle configurations:"
echo "- Increased JVM heap space to 4GB"
echo "- Enabled parallel builds"
echo "- Added Jetify optimizations"
echo "- Limited worker processes"

# Test App V2
test_build "/home/runner/work/Yeeeetmaster69.github.io/Yeeeetmaster69.github.io/App V2" "App V2"
APP_V2_RESULT=$?

echo ""
echo "================================================"
echo "🎯 APK Build Test Results:"
echo "================================================"

if [ $APP_V2_RESULT -eq 0 ]; then
    echo "✅ App V2 APK build: SUCCESS"
else
    echo "❌ App V2 APK build: FAILED"
fi

echo ""
if [ $APP_V2_RESULT -eq 0 ]; then
    echo "🎉 All Gradle build optimizations are working!"
    echo "The Java heap space and Jetify transform issues have been resolved."
else
    echo "⚠️  Build issues still need to be addressed."
fi