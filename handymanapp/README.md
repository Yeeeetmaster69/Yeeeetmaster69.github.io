
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

### Testing Framework

This project uses modern testing approaches suitable for Expo managed projects.

#### Testing Strategy for Expo Managed Projects

**Unit Testing**: 
- Use Jest for testing business logic components
- Test utility functions and calculations
- Mock external dependencies

**Integration Testing**:
- Test component interactions
- Use React Native Testing Library
- Mock navigation and external services

**Accessibility Testing**:
- Use development builds for accessibility validation
- Follow WCAG guidelines
- Test with screen readers

**To set up testing**:
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react-native

# Add test script to package.json
"test": "jest"

# Run tests
npm test
```

**Accessibility Best Practices**:
- Ensure all interactive elements have accessibility labels
- Maintain sufficient color contrast ratios
- Provide alternative text for images
- Test with screen readers (TalkBack/VoiceOver)

### Lint Checks & Code Quality

#### Android Lint Script (run_lint.sh)
Located at: `run_lint.sh`

**Purpose**: Comprehensive code quality checks including ESLint, TypeScript compilation, and accessibility guidelines for Expo managed projects.

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
   ```

2. **Before releases**:
   ```bash
   ./run_lint.sh
   npm test  # Run any existing tests
   npx expo export --platform android  # Test build process
   ```

3. **Regular accessibility audits**:
   ```bash
   # Review the accessibility checklist
   cat lint-reports/accessibility-check-*.txt
   
   # For managed Expo projects, use development builds for accessibility testing
   npx expo run:android --variant debug
   ```

### Adapting Tests for Your Project

The provided test files use generic business logic suitable for a handyman app. To adapt them:

1. **Update package names**: Change `com.handyman.pro` to match your app's package
2. **Update Activity references**: Replace `MainActivity` with your actual main activity class
3. **Customize business logic**: Modify `JobCalculator` and `TimeTracker` classes to match your app's specific requirements
4. **Add more test cases**: Extend tests to cover your app's unique features

### CI/CD Integration

To integrate these tests into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run lint checks
  run: ./run_lint.sh

- name: Run unit tests
  run: npm test

- name: Run lint checks
  run: ./run_lint.sh

- name: Test build process
  run: npx expo export --platform android
```

For more testing best practices and detailed setup instructions, refer to the official documentation:
- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [Accessibility Testing](https://docs.expo.dev/guides/accessibility/)
