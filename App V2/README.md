
# Handyman Pro (Fresh Build)

A clean Expo + Firebase starter tailored for your Client / Worker / Admin app with OTA updates, role-based routing, GPS time & miles tracking, push notifications, and Cloud Functions for role claims.

## 🚀 Quick Start - Get APK for Your Phone

**Want to install the app on your phone right now?** Follow these simple steps:

### Option 1: Automated Build Script (Recommended)
```bash
cd "App V2"
./build_apk.sh
```

### Option 2: Manual EAS Build
```bash
cd "App V2"
npm install
eas login
eas build --platform android --profile preview
```

### Option 3: Step-by-Step Guide
See [BUILD_APK.md](./BUILD_APK.md) for detailed instructions.

## 📱 Installing on Your Phone

1. Download the APK file to your Android phone
2. Go to Settings → Security → Enable "Install from Unknown Sources"
3. Open the APK file and tap "Install"
4. Grant permissions when the app starts

## What you get
- **Expo (React Native)** app with **OTA updates** (EAS Updates ready)
- **Role-based routing** via Firebase **custom claims** (admin/worker/client)
- **Client**: requests, estimates, reviews, pricing, etc. (MVP stubs)
- **Worker**: jobs list & self-assign, **Clock In/Out with GPS**, upload before/after photos, miles total
- **Admin**: manage users/roles, jobs, pricing, push messages, theme customization
- **Cloud Functions**: setRoleClaim endpoint, onUserCreate default claims, broadcast push
- **Firestore Rules** (starter) and minimal schema
- **In-app customization** (primary/accent colors)
- **Safety & Compliance**: incident reporting, emergency SOS, background checks (see SAFETY_COMPLIANCE.md)

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

## AI-Powered Features (Roadmap)

The application is designed to support advanced AI-powered features for enhanced automation and efficiency:

### Planned Features
- **Smart Job Routing**: Automatically assign jobs based on worker skills, proximity, and availability
- **Predictive Scheduling**: Suggest optimal scheduling times using historical data and external factors
- **Automated Quoting**: Generate quotes from client descriptions and uploaded images
- **Chatbot Support**: 24/7 automated support for common client and worker inquiries

### Documentation
- [`AI_FEATURES_SPECIFICATION.md`](./AI_FEATURES_SPECIFICATION.md) - Detailed requirements and technical architecture
- [`AI_IMPLEMENTATION_GUIDE.md`](./AI_IMPLEMENTATION_GUIDE.md) - Step-by-step implementation guide for developers

These features are currently in the planning phase. See the specification documents for implementation details and timelines.

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


## Monetization & Marketplace Features

🚀 **New in v2.1**: Advanced monetization features including subscription upgrades, ad network, and plugin marketplace.

For comprehensive documentation on monetization features, see:
- **[📋 Monetization Strategy](../MONETIZATION_STRATEGY.md)** - Business model, revenue streams, and strategic planning
- **[🛠 Implementation Guide](../IMPLEMENTATION_GUIDE.md)** - Technical implementation details and code examples  
- **[📖 Overview](../MONETIZATION_README.md)** - Quick start guide and feature summary

### Key Features
- **Subscription Tiers**: Free, Professional ($19.99), Business ($49.99), Enterprise ($99.99)
- **Partner Ad Network**: Revenue sharing with local service providers
- **Plugin Marketplace**: Third-party developer ecosystem with 30% platform fee
- **Feature Gating**: Advanced features locked behind subscription tiers
- **Analytics Dashboard**: Detailed business insights for premium users

