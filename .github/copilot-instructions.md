# Handyman Pro - GitHub Copilot Instructions

This repository contains React Native/Expo applications for a handyman service with Firebase backend integration. Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Setup (NEVER CANCEL - Takes 2-3 minutes total)
1. **Install dependencies**:
   ```bash
   # In App V2 directory (main app)
   cd "App V2"
   npm install  # Takes ~2 minutes. NEVER CANCEL. Set timeout to 180+ seconds.
   
   # In handymanapp directory (alternate version)  
   cd ../handymanapp
   npm install  # Takes ~3 seconds if run after App V2
   ```

2. **Fix permissions** (required in sandboxed environments):
   ```bash
   # Fix eslint and expo permissions
   chmod +x handymanapp/node_modules/.bin/eslint
   chmod +x handymanapp/node_modules/.bin/expo
   chmod +x "App V2/run_lint.sh"
   chmod +x handymanapp/run_lint.sh
   ```

3. **Setup Cloud Functions**:
   ```bash
   cd "App V2/server/functions"
   npm install  # Takes ~45 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
   ```

### Build and Development Commands

#### React Native/Expo Apps
```bash
# Start development server (App V2 is the main version)
cd "App V2" 
npm start    # Starts Expo dev server on port 8081. Takes ~10 seconds to start.

# Or start handymanapp version
cd handymanapp
npm start    # Alternative version of the app

# Note: Web build is NOT supported - missing react-native-web dependencies
# Mobile-focused React Native application
```

#### Cloud Functions  
```bash
cd "App V2/server/functions"
npm run build    # TypeScript compilation - Takes ~2 seconds
npm test         # Jest tests - Takes ~6 seconds. NEVER CANCEL.
npm run deploy   # Firebase deploy (requires Firebase CLI and auth)
```

### Testing and Quality Assurance

#### Lint Checks
```bash
# Comprehensive lint script (covers Android lint, ESLint, TypeScript, accessibility)
cd "App V2"
./run_lint.sh    # Takes ~5-10 seconds. Generates reports in lint-reports/

# Or for handymanapp
cd handymanapp  
./run_lint.sh

# ESLint only
npm run lint     # Takes ~3-5 seconds
```

#### Known Issues to Document
- **TypeScript compilation has errors** - 12 errors across 4 files including React import issues and Jest type definitions
- **ESLint config missing in handymanapp** - Copy from App V2: `cp "App V2/.eslintrc.js" handymanapp/`
- **Web platform not supported** - Mobile-first React Native app, no react-native-web dependencies
- **Gradlew not found** - Expected for Expo managed projects, not native Android builds

### Firebase Integration
- **Cloud Functions**: Located in `App V2/server/functions/`
- **Firestore Database**: Schema documented in `FIRESTORE_STRUCTURE.md`
- **Authentication**: Email/Password enabled
- **Storage**: Used for photo uploads

## Validation Scenarios

**ALWAYS test these scenarios after making changes**:

1. **Basic App Functionality**:
   ```bash
   cd "App V2"
   npm start  # Should start without errors and show Metro bundler
   # Verify: "Waiting on http://localhost:8081" appears
   ```

2. **Code Quality Checks**:
   ```bash
   npm run lint      # Should complete with TypeScript warnings but no fatal errors
   ./run_lint.sh     # Should generate accessibility and summary reports
   ```

3. **Cloud Functions**:
   ```bash
   cd "App V2/server/functions"
   npm run build && npm test  # Both should pass
   ```

## Key Projects and Structure

### App V2 (Primary Application)
- **Location**: `/App V2/`
- **Type**: React Native/Expo managed project
- **Key Files**:
  - `package.json` - Main app dependencies and scripts
  - `app.json` - Expo configuration
  - `src/` - React Native source code
  - `android/` - Native Android code for ejected features
  - `server/functions/` - Firebase Cloud Functions

### handymanapp (Secondary Version)  
- **Location**: `/handymanapp/`
- **Type**: Similar React Native/Expo structure
- **Notes**: Appears to be an alternative or older version

### Documentation Files
- `README.md` - Comprehensive setup and feature documentation
- `FIRESTORE_STRUCTURE.md` - Database schema and security rules
- `AI_FEATURES_SPECIFICATION.md` - Planned AI features
- `IMPLEMENTATION_GUIDE.md` - Feature implementation guides
- `SAFETY_COMPLIANCE.md` - Safety and compliance features

## Important Timing and Timeout Guidelines

- **npm install (App V2)**: 2 minutes - Set timeout to 180+ seconds, NEVER CANCEL
- **npm install (functions)**: 45 seconds - Set timeout to 120+ seconds, NEVER CANCEL  
- **npm install (handymanapp)**: 3 seconds (after App V2)
- **npm test (functions)**: 6 seconds
- **npm run lint**: 3-5 seconds
- **./run_lint.sh**: 5-10 seconds
- **npm start**: 10 seconds to start server

## Common Validation Commands

**Before committing changes**, always run:
```bash
cd "App V2"
npm run lint        # Check code style
./run_lint.sh       # Comprehensive quality checks
cd server/functions
npm test           # Run unit tests
```

## Dependencies and Requirements

- **Node.js**: 18+ (Current: 20.19.4)
- **npm**: 10.8.2  
- **Expo CLI**: Available via npx expo
- **TypeScript**: 5.3.3 (App V2), 5.8.3 (handymanapp) - Version mismatch causes warnings
- **React Native**: 0.74.3 (needs update to 0.74.5)

## Known Limitations

- **No web build support** - Mobile-only React Native application
- **TypeScript errors exist** - 12 compilation errors that need fixing
- **Package version mismatches** - Several expo packages need updates
- **Gradlew missing** - Normal for Expo managed projects
- **Permission issues in sandboxed environments** - Use chmod commands above

## Firebase Configuration

- **Project ID**: handyman-c1eee (or create new project)
- **Authentication**: Email/Password method
- **Firestore**: Production mode database required
- **Functions**: Deploy with `npm run deploy` in functions directory
- **OTA Updates**: EAS Updates configured for production deployment

Always ensure Firebase project is properly configured before running Cloud Functions or authentication features.