
# Handyman Pro (Fresh Build)

A clean Expo + Firebase starter tailored for your Client / Worker / Admin app with OTA updates, role-based routing, GPS time & miles tracking, push notifications, and Cloud Functions for role claims.

## What you get
- **Expo (React Native)** app with **OTA updates** (EAS Updates ready)
- **Role-based routing** via Firebase **custom claims** (admin/worker/client)
- **Client**: requests, estimates, reviews, pricing, etc. (MVP stubs)
- **Worker**: jobs list & self-assign, **Clock In/Out with GPS**, upload before/after photos, miles total
- **Admin**: manage users/roles, jobs, pricing, push messages, theme customization
- **Cloud Functions**: setRoleClaim endpoint, onUserCreate default claims, broadcast push
- **Firestore Rules** (starter) and minimal schema
- **In-app customization** (primary/accent colors)

## Setup (10 steps)
1) **Install**: Node 18+, `npm i -g expo-cli` (optional). Then:
```bash
npm install
```
2) **Firebase Project**: Use your existing `handyman-c1eee` or create new. In `app.json` replace `expo.extra.firebase` with your config.

3) **Auth**: Enable Email/Password in Firebase Console.

4) **Firestore**: Create database in production mode. Run rules:
```bash
firebase deploy --only firestore:rules
```
(or paste `firestore.rules` in console).

5) **Cloud Functions**: In `server/functions`:
```bash
cd server/functions
npm install
# Login + init if needed:
# firebase login
# firebase use <your-project-id>
npm run deploy
```
Copy your function URL and replace `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/...` in Admin screens.

6) **Push Notifications**:
- EAS project: set a real `extra.eas.projectId` in `app.json`.
- App startup should request permissions and save token (you can write a small effect to store token to `pushTokens` in Firestore).

7) **Run app**:
```bash
npm run start
```
Open on Android (best for background location).

8) **Grant roles**:
- After signup, open **Admin -> Users** and switch radio to `worker` or `admin`. This calls the function to set custom claims.

9) **OTA Updates**:
- Configure EAS Updates (run `eas init`). Then publish:
```bash
eas update --branch production --message "update"
```
App will auto-fetch updates on next launch.

10) **Square Integration** (optional):
- Use your Square APIs in `Estimates` & `Invoices` screens or generate PDFs server-side.

## Notes
- Background location requires device settings. On Android 10+, ensure "Allow all the time".
- The rules are permissive for MVP; tighten before going live.
- Photos use Firebase Storage (generous free tier). You can later swap to local-only storage if desired, but cloud is required for multi-device access.
- Data monetization: collect **consented, anonymized** data only. Add a clear Privacy Policy and opt-in screens.

Enjoy!


---

## Square Integration (Estimates & Invoices)

1) In `server/functions`:
```
cd server/functions
npm install
# Add Square credentials
firebase functions:config:set square.token="YOUR_SQUARE_ACCESS_TOKEN" square.env="production" square.location_id="YOUR_LOCATION_ID"
npm run deploy
```
(You can also use environment variables `SQUARE_ACCESS_TOKEN`, `SQUARE_ENV`, and `SQUARE_LOCATION_ID` locally.)

2) In the app, edit `src/services/square.ts` and replace `YOUR_REGION-YOUR_PROJECT` with your Cloud Functions domain.

3) Use Admin → **Estimates** to create a **draft** (acts like an estimate) and publish/send it,
or Admin → **Invoices** to create & send an invoice immediately. You can also make a quick **Payment Link**.

Notes:
- Square does not currently expose a dedicated public *Estimates API*. We implement estimates as **draft Invoices** that you publish when accepted.
- Line items expect `amountCents` (e.g., `$150.00` → `15000`).



## Job → Estimate / Invoice (one tap)
- Admin → Jobs now has **Estimate** and **Invoice** buttons per job.
- It prefills line items from **Admin → Pricing** (first item / name match) and links the Square order to the job via `order.referenceId = jobId`.

## Client Payment Options (Square / Venmo / Cash App / Zelle / Cash)
- Admin → Settings: set **Venmo username** (no @), **Cash App cashtag** (no $), **Zelle email/phone**.
- Client → PaymentOptions screen supports:
  - **Square** (invoice public URL)
  - **Venmo** deep link
  - **Cash App** web link
  - **Zelle** (instructions)
  - **Cash** (in-person note)

## Square Webhooks
1) In Square Dashboard, add a webhook subscription with events:
   - `invoice.updated`, `payment.updated`
   - Endpoint: `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/squareWebhook`
2) Configure secret:
```
firebase functions:config:set square.webhook_secret="YOUR_WEBHOOK_SIGNATURE_KEY"
npm run deploy
```
3) The webhook updates `jobs` with `invoiceId`, `orderId`, `invoiceStatus`, `paymentStatus`, and marks job `status: "done"` on `COMPLETED` payments.

## Testing & Quality Assurance

This project includes comprehensive testing infrastructure to ensure code quality, accessibility, and functionality.

### Android Automated Tests

#### Unit Tests (SampleUnitTest.kt)
Located at: `android/app/src/test/java/com/handyman/pro/SampleUnitTest.kt`

**Purpose**: Validate business logic and utility functions without requiring Android framework dependencies.

**Features tested**:
- Job cost calculations with different scenarios
- Time tracking and hour calculations
- Worker rating calculations
- Job status validation
- Error handling for invalid inputs
- **Edge and negative cases including**:
  - Negative values for hourly rate, hours worked, and material costs
  - Zero values for all input parameters
  - Very large and very small decimal numbers
  - Invalid tax rates (negative and extremely high)
  - Time tracking edge cases (same start/end time, end before start)
  - Break time exceeding work time
  - Estimate accuracy with zero values
  - Rating calculations with negative and out-of-range ratings
  - Job status validation with special characters and formatting

**To run**:
```bash
# For native Android projects
./gradlew test

# For Expo managed projects (after eject)
cd android && ./gradlew test

# Run specific test class
./gradlew test --tests com.handyman.pro.SampleUnitTest

# Run with verbose output
./gradlew test --info
```

#### Integration Tests (JobViewModelTest.kt)
Located at: `android/app/src/test/java/com/handyman/pro/JobViewModelTest.kt`

**Purpose**: Test the integration between JobCalculator and TimeTracker components through a JobViewModel that combines their functionality.

**Features tested**:
- Complete job workflow from time tracking to cost calculation
- Job cost calculation with break time integration
- Multiple jobs estimate accuracy tracking
- Integration with mocked dependencies for isolated testing
- Invalid job data handling across integrated components
- Job status workflow management

**To run**:
```bash
# Run integration tests
./gradlew test --tests com.handyman.pro.JobViewModelTest

# Run all unit and integration tests together
./gradlew test --tests "com.handyman.pro.*UnitTest" --tests "com.handyman.pro.*ViewModelTest"
```

#### Accessibility Tests (AccessibilityTest.kt)
Located at: `android/app/src/androidTest/java/com/handyman/pro/AccessibilityTest.kt`

**Purpose**: Ensure the app meets accessibility standards using Espresso's accessibility testing framework.

**Features tested**:
- Content descriptions for images and buttons
- Minimum touch target sizes (48dp requirement)
- Color contrast ratios
- Keyboard navigation
- Screen reader compatibility
- Focus indicators
- **Enhanced accessibility violation detection**:
  - Missing content descriptions on ImageView and ImageButton elements
  - Focusable elements without proper labels
  - EditText fields without hints or labels
  - Touch targets smaller than minimum accessibility requirements
  - Color contrast issues automatically detected by framework

**To run**:
```bash
# Requires connected Android device or emulator
./gradlew connectedAndroidTest

# Or run specific accessibility tests
./gradlew connectedAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.handyman.pro.AccessibilityTest

# Run only the missing content description tests (these are designed to fail)
./gradlew connectedAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.handyman.pro.AccessibilityTest#testMissingContentDescriptions
```

#### UI Tests (JobSummaryUiTest.kt)
Located at: `android/app/src/androidTest/java/com/handyman/pro/JobSummaryUiTest.kt`

**Purpose**: Test UI functionality by launching Activities and verifying user interface behavior, specifically focusing on job cost display verification.

**Features tested**:
- Job cost calculation display and formatting
- Form validation and error handling
- UI interaction with input fields and buttons
- Currency formatting and decimal precision
- Clear functionality and form reset
- Activity lifecycle persistence (configuration changes)
- Zero value handling in UI calculations

**To run**:
```bash
# Requires connected Android device or emulator
./gradlew connectedAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.handyman.pro.JobSummaryUiTest

# Run specific UI test methods
./gradlew connectedAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.handyman.pro.JobSummaryUiTest#testJobCostDisplayCalculation

# Run all instrumented tests (UI + Accessibility)
./gradlew connectedAndroidTest
```

**Prerequisites for Android tests**:
Add these dependencies to your `android/app/build.gradle`:
```gradle
dependencies {
    // Unit testing
    testImplementation 'junit:junit:4.13.2'
    testImplementation 'org.mockito:mockito-core:4.6.1'
    testImplementation 'org.mockito:mockito-inline:4.6.1'
    
    // Instrumented testing
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
    androidTestImplementation 'androidx.test.espresso:espresso-accessibility:3.5.1'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test:rules:1.5.0'
    androidTestImplementation 'androidx.test:runner:1.5.2'
}
```

### Expanded Test Suite Commands

#### Running All Tests
```bash
# Run all unit tests (including integration tests)
./gradlew test

# Run all instrumented tests (UI + Accessibility)
./gradlew connectedAndroidTest

# Run complete test suite
./gradlew test connectedAndroidTest
```

#### Running Specific Test Categories
```bash
# Unit tests only
./gradlew test --tests "com.handyman.pro.SampleUnitTest"

# Integration tests only
./gradlew test --tests "com.handyman.pro.JobViewModelTest"

# UI tests only
./gradlew connectedAndroidTest --tests "com.handyman.pro.JobSummaryUiTest"

# Accessibility tests only (including failing tests for missing content descriptions)
./gradlew connectedAndroidTest --tests "com.handyman.pro.AccessibilityTest"
```

#### Test Reports and Output
```bash
# Generate detailed test reports with coverage
./gradlew test --info --continue

# View test reports
# Unit test reports: android/app/build/reports/tests/testDebugUnitTest/index.html
# Instrumented test reports: android/app/build/reports/androidTests/connected/index.html

# Generate accessibility test reports
./gradlew connectedAndroidTest --continue
# Reports include specific accessibility violations found
```

### Lint Checks & Code Quality

#### Android Lint Script (run_lint.sh)
Located at: `run_lint.sh`

**Purpose**: Comprehensive code quality checks including Android lint, ESLint, TypeScript compilation, and accessibility guidelines.

**Features**:
- Automatically detects project type (native Android vs Expo managed)
- Runs appropriate lint checks based on project structure
- Generates multiple report formats (HTML, XML, text)
- Creates accessibility compliance checklist
- Provides actionable next steps

**To run**:
```bash
# Make executable (first time only)
chmod +x run_lint.sh

# Run all lint checks
./run_lint.sh

# Run with verbose output
./run_lint.sh --verbose

# Show help
./run_lint.sh --help
```

**Generated Reports**:
All reports are saved to `./lint-reports/` with timestamps:
- `lint-report-[timestamp].html` - Android lint HTML report
- `lint-report-[timestamp].xml` - Android lint XML report  
- `eslint-report-[timestamp].txt` - ESLint results
- `typescript-check-[timestamp].txt` - TypeScript compilation check
- `accessibility-check-[timestamp].txt` - Accessibility guidelines checklist
- `metro-check-[timestamp].txt` - Metro bundler compatibility check
- `lint-summary-[timestamp].txt` - Summary of all checks

### Testing Workflow Recommendations

1. **Before committing code**:
   ```bash
   ./run_lint.sh
   npm test  # Run any existing Jest/React Native tests
   ./gradlew test  # Run unit and integration tests
   ```

2. **Before releases**:
   ```bash
   ./run_lint.sh
   ./gradlew test  # Unit and integration tests
   ./gradlew connectedAndroidTest  # UI and accessibility tests
   ```

3. **Regular accessibility audits**:
   ```bash
   # Review the accessibility checklist
   cat lint-reports/accessibility-check-*.txt
   
   # Run accessibility tests (including tests designed to fail for missing content descriptions)
   ./gradlew connectedAndroidTest --tests "com.handyman.pro.AccessibilityTest"
   
   # Run specific failing accessibility tests to identify issues
   ./gradlew connectedAndroidTest --tests "com.handyman.pro.AccessibilityTest#testMissingContentDescriptions"
   ```

4. **Development testing workflow**:
   ```bash
   # Quick unit test feedback during development
   ./gradlew test --tests "com.handyman.pro.SampleUnitTest" --continue
   
   # Test integration between components
   ./gradlew test --tests "com.handyman.pro.JobViewModelTest"
   
   # UI testing for feature validation
   ./gradlew connectedAndroidTest --tests "com.handyman.pro.JobSummaryUiTest#testJobCostDisplayCalculation"
   ```

### Test Coverage and Quality Metrics

The expanded test suite provides comprehensive coverage across multiple dimensions:

- **Unit Tests**: 20+ test methods covering edge cases, negative scenarios, and business logic validation
- **Integration Tests**: 6 test methods validating component interactions and end-to-end workflows  
- **UI Tests**: 7 test methods covering user interface functionality and user experience validation
- **Accessibility Tests**: 10+ test methods including intentional failure tests for missing accessibility features

**Expected Test Results**:
- Unit and Integration tests should all pass
- UI tests should pass (demonstrating proper functionality)
- Some Accessibility tests are designed to FAIL to highlight missing accessibility features that need to be addressed

### Adapting Tests for Your Project

The provided test files use generic business logic suitable for a handyman app. To adapt them:

1. **Update package names**: Change `com.handyman.pro` to match your app's package
2. **Update Activity references**: Replace `MainActivity` with your actual main activity class
3. **Customize business logic**: Modify `JobCalculator` and `TimeTracker` classes to match your app's specific requirements
4. **Add more test cases**: Extend tests to cover your app's unique features

### CI/CD Integration

To integrate the expanded test suite into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 11
      uses: actions/setup-java@v3
      with:
        java-version: '11'
        distribution: 'temurin'
        
    - name: Run lint checks
      run: ./run_lint.sh
      
    - name: Run unit tests
      run: ./gradlew test --continue
      
    - name: Run integration tests  
      run: ./gradlew test --tests "com.handyman.pro.JobViewModelTest" --continue
      
    - name: Set up Android emulator (for UI/Accessibility tests)
      uses: reactivecircus/android-emulator-runner@v2
      with:
        api-level: 29
        script: |
          ./gradlew connectedAndroidTest --continue
          
    - name: Upload test reports
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-reports
        path: |
          android/app/build/reports/tests/
          android/app/build/reports/androidTests/
          lint-reports/

    - name: Test results summary
      run: |
        echo "Unit Tests: Validate business logic"
        echo "Integration Tests: Test component interactions" 
        echo "UI Tests: Verify user interface functionality"
        echo "Accessibility Tests: Check compliance (some designed to fail)"
```

### Test Categories Summary

| Test Type | Location | Purpose | Expected Result |
|-----------|----------|---------|----------------|
| **Unit Tests** | `src/test/.../SampleUnitTest.kt` | Business logic validation, edge cases | ✅ All should pass |
| **Integration Tests** | `src/test/.../JobViewModelTest.kt` | Component interaction testing | ✅ All should pass |
| **UI Tests** | `src/androidTest/.../JobSummaryUiTest.kt` | User interface functionality | ✅ All should pass |
| **Accessibility Tests** | `src/androidTest/.../AccessibilityTest.kt` | Accessibility compliance | ⚠️ Some designed to fail |

For more testing best practices and detailed setup instructions, refer to the official documentation:
- [Android Testing Guide](https://developer.android.com/training/testing)
- [Espresso Accessibility Testing](https://developer.android.com/training/testing/espresso/accessibility-testing)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
