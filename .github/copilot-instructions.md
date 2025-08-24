# Handyman Pro GitHub Pages & Mobile Apps

ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

This repository contains:
- **GitHub Pages website** (index.html redirects to Handymanapp (7).html)
- **App V2/** - Main React Native/Expo app with Firebase, Square integration
- **handymanapp/** - Alternative/earlier version of the mobile app

### Bootstrap the Main Project (App V2)
- `cd "App V2"`
- `npm install` -- takes 2 minutes. NEVER CANCEL. Set timeout to 5+ minutes.
- `cd server/functions`
- `npm install` -- takes 45 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
- `npm run build` -- builds TypeScript functions, takes 5 seconds.
- `cd ../..` (back to App V2 root)

### Bootstrap the Alternative Project (handymanapp)
- `cd handymanapp`
- `npm install` -- takes 3-4 seconds (already has node_modules).
- Fix permissions: `chmod +x node_modules/.bin/eslint`

### Quality Checks & Linting
- **App V2**: `npm run lint` -- runs ESLint, takes 1 second.
- **App V2**: `./run_lint.sh` -- comprehensive linting including accessibility checks, takes <1 second.
- **handymanapp**: `./run_lint.sh` -- accessibility checks only (no ESLint config), takes <1 second.
- Both lint scripts expect Android gradlew but work without it.

### Testing
- **App V2 Functions**: `npm test` -- runs Jest tests, takes 6 seconds. NEVER CANCEL.
- **App V2 Functions**: All tests pass successfully with proper TypeScript/Jest configuration.
- **handymanapp**: Uses same test script but references non-existent server/functions.

### Running Applications
- **Expo development**: `npm start` or `npx expo start` (both projects support this)
- **Web version**: `npm run web` 
- **Firebase Functions**: `cd server/functions && npm run dev` (watch mode)
- **Firebase Functions**: `cd server/functions && npm run deploy` (requires Firebase CLI setup)

## Validation

- ALWAYS run through complete setup workflow after making changes:
  1. `cd "App V2" && npm install && npm run lint && npm test`
  2. `cd server/functions && npm install && npm run build && npm test`
  3. Verify lint reports are generated in `lint-reports/` directories
- The main GitHub Pages site loads successfully and redirects to Handymanapp (7).html
- Both mobile app projects can start development servers with `npm start`
- You cannot interact with mobile app UIs but can verify they start without errors

## Common Tasks

### Dependencies & Environment
- **Node.js**: v20.19.4 (works with projects requiring Node 18+)
- **npm**: v10.8.2
- **Expo CLI**: Available via npx (v0.18.31)
- **Package managers**: Use npm (package-lock.json present)

### Build Times (NEVER CANCEL these operations)
- **App V2 npm install**: 2 minutes - Set timeout to 5+ minutes
- **Functions npm install**: 45 seconds - Set timeout to 2+ minutes  
- **Functions build**: 5 seconds
- **Functions tests**: 6 seconds
- **Lint checks**: <1 second
- **handymanapp npm install**: 3-4 seconds (already installed)

### Known Issues & Workarounds
- **Corrupted package.json**: App V2/server/functions/package.json was corrupted (git diff format) - FIXED
- **gradlew missing**: Both projects expect Android gradlew but lint scripts work without it
- **ESLint permissions**: handymanapp requires `chmod +x node_modules/.bin/eslint`
- **No ESLint config**: handymanapp missing .eslintrc, use run_lint.sh instead
- **Jest config**: Functions needed Jest TypeScript preset in package.json - FIXED

### File Structure Overview
```
/
├── .github/copilot-instructions.md (this file)
├── index.html (GitHub Pages entry point)
├── Handymanapp (7).html (main web app)
├── App V2/ (main React Native project)
│   ├── package.json (Expo app config)
│   ├── server/functions/ (Firebase Cloud Functions)
│   │   ├── package.json (Functions dependencies) 
│   │   ├── src/ (TypeScript source)
│   │   └── lib/ (compiled JavaScript)
│   ├── android/ (Android project files)
│   ├── src/ (React Native source)
│   └── run_lint.sh (quality checks)
└── handymanapp/ (alternative implementation)
    ├── package.json (Expo app config)
    ├── android/ (Android project files)
    └── run_lint.sh (accessibility checks)
```

### Firebase & External Services
- Projects use Firebase (Auth, Firestore, Functions, Storage)
- Square payment integration configured
- Push notifications via Expo
- Requires `.env` files and Firebase config for full functionality
- Can build and test without external service connections

### Before Committing Changes
- `cd "App V2" && npm run lint`
- `cd "App V2/server/functions" && npm test`
- `cd "App V2" && ./run_lint.sh`
- Review lint reports in `lint-reports/` directories
- Verify both mobile projects still build: `npm start` (then Ctrl+C)

The repository builds successfully and all quality checks pass. Focus on the "App V2" directory for primary development as it has the most complete implementation with working tests and build processes.