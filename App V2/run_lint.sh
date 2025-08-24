#!/bin/bash

# Android Lint Runner for Handyman Pro
# This script runs Android lint checks and generates reports

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
LINT_REPORTS_DIR="$PROJECT_ROOT/lint-reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

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

# Function to check if Android project exists
check_android_project() {
    if [ ! -d "$ANDROID_DIR" ]; then
        print_warning "Android directory not found at $ANDROID_DIR"
        print_status "This appears to be an Expo managed project."
        print_status "To run native Android lint, you need to:"
        print_status "1. Run 'expo eject' or 'expo run:android' to generate native Android code"
        print_status "2. Or use 'npx expo install --android' to ensure Android compatibility"
        print_status ""
        print_status "Running alternative Expo/React Native checks instead..."
        return 1
    fi
    return 0
}

# Function to check for required tools
check_requirements() {
    print_status "Checking requirements..."
    
    # Check for Android SDK
    if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
        print_warning "ANDROID_HOME or ANDROID_SDK_ROOT not set"
        print_status "Please set ANDROID_HOME to your Android SDK path"
        print_status "Example: export ANDROID_HOME=/path/to/android/sdk"
    fi
    
    # Check for Node.js (for React Native/Expo projects)
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js"
        exit 1
    fi
    
    # Check for npm/yarn
    if ! command -v npm &> /dev/null && ! command -v yarn &> /dev/null; then
        print_error "npm or yarn not found. Please install npm or yarn"
        exit 1
    fi
    
    print_success "Requirements check completed"
}

# Function to create lint reports directory
setup_reports_directory() {
    mkdir -p "$LINT_REPORTS_DIR"
    print_status "Lint reports will be saved to: $LINT_REPORTS_DIR"
}

# Function to run Android lint (for native Android projects)
run_android_lint() {
    print_status "Running Android lint checks..."
    
    cd "$ANDROID_DIR"
    
    # Run lint with different output formats
    print_status "Generating HTML report..."
    ./gradlew lint --continue || true
    
    # Copy lint reports to our reports directory
    if [ -d "app/build/reports/lint-results.html" ]; then
        cp app/build/reports/lint-results.html "$LINT_REPORTS_DIR/lint-report-${TIMESTAMP}.html"
        print_success "HTML report saved to: $LINT_REPORTS_DIR/lint-report-${TIMESTAMP}.html"
    fi
    
    if [ -f "app/build/reports/lint-results.xml" ]; then
        cp app/build/reports/lint-results.xml "$LINT_REPORTS_DIR/lint-report-${TIMESTAMP}.xml"
        print_success "XML report saved to: $LINT_REPORTS_DIR/lint-report-${TIMESTAMP}.xml"
    fi
    
    cd "$PROJECT_ROOT"
}

# Function to run React Native/Expo lint checks
run_react_native_lint() {
    print_status "Running React Native/Expo lint checks..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    # Run ESLint if configured
    if grep -q "eslint" package.json; then
        print_status "Running ESLint..."
        if command -v npm &> /dev/null; then
            npm run lint 2>&1 | tee "$LINT_REPORTS_DIR/eslint-report-${TIMESTAMP}.txt" || true
        elif command -v yarn &> /dev/null; then
            yarn lint 2>&1 | tee "$LINT_REPORTS_DIR/eslint-report-${TIMESTAMP}.txt" || true
        fi
        print_success "ESLint report saved to: $LINT_REPORTS_DIR/eslint-report-${TIMESTAMP}.txt"
    else
        print_warning "ESLint not configured in package.json"
    fi
    
    # Run TypeScript compiler check
    if [ -f "tsconfig.json" ]; then
        print_status "Running TypeScript compiler check..."
        if command -v npx &> /dev/null; then
            npx tsc --noEmit 2>&1 | tee "$LINT_REPORTS_DIR/typescript-check-${TIMESTAMP}.txt" || true
            print_success "TypeScript check report saved to: $LINT_REPORTS_DIR/typescript-check-${TIMESTAMP}.txt"
        fi
    fi
    
    # Check for Metro bundler issues
    print_status "Checking for potential Metro bundler issues..."
    echo "# Metro Bundler Check - $TIMESTAMP" > "$LINT_REPORTS_DIR/metro-check-${TIMESTAMP}.txt"
    echo "## Checking for common Metro issues..." >> "$LINT_REPORTS_DIR/metro-check-${TIMESTAMP}.txt"
    
    # Check for node_modules issues
    if [ ! -d "node_modules" ]; then
        echo "WARNING: node_modules directory not found" >> "$LINT_REPORTS_DIR/metro-check-${TIMESTAMP}.txt"
    fi
    
    # Check for Expo CLI
    if command -v expo &> /dev/null; then
        echo "Expo CLI version: $(expo --version)" >> "$LINT_REPORTS_DIR/metro-check-${TIMESTAMP}.txt"
    else
        echo "WARNING: Expo CLI not found" >> "$LINT_REPORTS_DIR/metro-check-${TIMESTAMP}.txt"
    fi
    
    print_success "Metro check report saved to: $LINT_REPORTS_DIR/metro-check-${TIMESTAMP}.txt"
}

# Function to run accessibility checks
run_accessibility_checks() {
    print_status "Running accessibility checks..."
    
    # Create accessibility report
    echo "# Accessibility Check Report - $TIMESTAMP" > "$LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
    echo "## Accessibility Guidelines Checklist" >> "$LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
    echo "" >> "$LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
    echo "- [ ] All images have alt text or contentDescription" >> "$LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
    echo "- [ ] Interactive elements have minimum touch target size (48dp)" >> "$LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
    echo "- [ ] Color contrast ratios meet WCAG standards" >> "$LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
    echo "- [ ] All form inputs have proper labels" >> "$LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
    echo "- [ ] Navigation is keyboard accessible" >> "$LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
    echo "- [ ] Screen reader navigation is logical" >> "$LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
    echo "- [ ] Focus indicators are visible" >> "$LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
    echo "" >> "$LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
    echo "Run AccessibilityTest.kt for automated accessibility testing" >> "$LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
    
    print_success "Accessibility checklist saved to: $LINT_REPORTS_DIR/accessibility-check-${TIMESTAMP}.txt"
}

# Function to generate summary report
generate_summary() {
    print_status "Generating summary report..."
    
    SUMMARY_FILE="$LINT_REPORTS_DIR/lint-summary-${TIMESTAMP}.txt"
    
    echo "# Lint Summary Report" > "$SUMMARY_FILE"
    echo "Generated: $(date)" >> "$SUMMARY_FILE"
    echo "Project: Handyman Pro" >> "$SUMMARY_FILE"
    echo "" >> "$SUMMARY_FILE"
    
    echo "## Reports Generated:" >> "$SUMMARY_FILE"
    ls -la "$LINT_REPORTS_DIR"/*${TIMESTAMP}* >> "$SUMMARY_FILE" 2>/dev/null || echo "No reports found" >> "$SUMMARY_FILE"
    
    echo "" >> "$SUMMARY_FILE"
    echo "## Next Steps:" >> "$SUMMARY_FILE"
    echo "1. Review the generated reports for issues" >> "$SUMMARY_FILE"
    echo "2. Run unit tests: ./gradlew test (for Android) or npm test (for RN)" >> "$SUMMARY_FILE"
    echo "3. Run accessibility tests: ./gradlew connectedAndroidTest" >> "$SUMMARY_FILE"
    echo "4. Fix any critical issues found" >> "$SUMMARY_FILE"
    echo "5. Re-run this script to verify fixes" >> "$SUMMARY_FILE"
    
    print_success "Summary report saved to: $SUMMARY_FILE"
}

# Main execution function
main() {
    print_status "Starting Android Lint Runner for Handyman Pro"
    print_status "Project directory: $PROJECT_ROOT"
    
    check_requirements
    setup_reports_directory
    
    # Try to run Android lint first, fall back to React Native checks
    if check_android_project; then
        run_android_lint
    else
        run_react_native_lint
    fi
    
    run_accessibility_checks
    generate_summary
    
    print_success "Lint checks completed!"
    print_status "Check the reports in: $LINT_REPORTS_DIR"
    print_status ""
    print_status "To view HTML reports, open them in a web browser:"
    print_status "  open $LINT_REPORTS_DIR/lint-report-${TIMESTAMP}.html (if available)"
    print_status ""
    print_status "For more information, see the project README.md"
}

# Help function
show_help() {
    echo "Android Lint Runner for Handyman Pro"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -v, --verbose  Run with verbose output"
    echo ""
    echo "Examples:"
    echo "  $0              # Run all lint checks"
    echo "  $0 --verbose    # Run with verbose output"
    echo ""
    echo "This script will:"
    echo "  1. Check for Android project structure"
    echo "  2. Run Android lint (if native Android exists)"
    echo "  3. Run React Native/Expo lint checks"
    echo "  4. Generate accessibility checklist"
    echo "  5. Create summary report"
    echo ""
    echo "Reports are saved to: ./lint-reports/"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -v|--verbose)
        set -x
        main
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac