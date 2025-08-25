# Android APK Build Workflows

This repository now includes automated GitHub Actions workflows to build Android APKs without running into git file size limits.

## Available Workflows

### 1. Build Android APK (Artifact) - **RECOMMENDED**
**File:** `.github/workflows/build-apk.yml`
**Trigger:** Manual (workflow_dispatch)

This workflow builds the Android APK and uploads it as a GitHub Actions artifact. Artifacts don't count against git file size limits, solving the "file too large" problem.

**How to use:**
1. Go to **Actions** tab in GitHub
2. Select **"Build Android APK (Artifact)"** workflow
3. Click **"Run workflow"**
4. Wait for the build to complete
5. Download the APK from the **Artifacts** section at the bottom of the workflow run

**Benefits:**
- ✅ No git file size limits
- ✅ No PR bloat
- ✅ Fast download
- ✅ Automatic cleanup after 90 days

### 2. Build & Upload Release Asset - **ALTERNATIVE**
**File:** `.github/workflows/build-release.yml`
**Trigger:** Manual (workflow_dispatch) with tag input

This workflow builds the Android APK and attaches it to a GitHub Release.

**How to use:**
1. Go to **Actions** tab in GitHub
2. Select **"Build & Upload Release Asset"** workflow
3. Click **"Run workflow"**
4. Enter a tag name (e.g., `v1.0.0`)
5. Wait for the build to complete
6. The APK will be attached to the created release

## APK Details

**Generated APK:**
- **File:** `app-release.apk`
- **Size:** ~56MB
- **Package:** `com.handyman.pro`
- **Build Type:** Release (optimized)

## Build Process

The workflows automatically:
1. Set up Java 17 (Temurin distribution)
2. Install Android SDK
3. Set up Node.js 20
4. Install npm dependencies
5. Build the release APK using Gradle
6. Upload the APK (as artifact or release asset)

## Troubleshooting

If the build fails:
1. Check the workflow logs in the Actions tab
2. Ensure all dependencies are correctly specified in `package.json`
3. Verify the Android project structure is intact
4. Check that Node.js and Java versions are compatible

## Local Testing

To test the build locally:
```bash
cd HandymanMinimal
npm install
cd android
./gradlew assembleRelease
```

The APK will be generated at: `HandymanMinimal/android/app/build/outputs/apk/release/app-release.apk`