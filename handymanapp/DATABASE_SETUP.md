# Database Setup with Fireway

This document explains how to set up the Firestore database using Fireway migrations for the Handyman Pro app.

## Prerequisites

1. Firebase project configured (handyman-c1eee)
2. Firebase Admin SDK service account key
3. Node.js and npm installed

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase Admin SDK

Create a service account key from the Firebase Console:
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the file as `firebase-admin-key.json` in the project root

### 3. Set Environment Variables

Create a `.env` file or set these environment variables:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-admin-key.json"
export FIREBASE_PROJECT_ID="handyman-c1eee"
```

### 4. Run Database Migrations

```bash
# Initialize the database schema
npm run db:setup

# Or run migrations directly
npm run migrate
```

## Migration Files

The migrations are located in the `migrations/` directory:

- `v001__initialize_basic_collections.js` - Core collections (users, jobs, timesheets, config)
- `v002__safety_collections.js` - Safety & compliance collections 
- `v003__extended_collections.js` - Extended feature collections

## Collections Created

### Core Collections
- `users` - User profiles and authentication data
- `jobs` - Job listings and management
- `timesheets` - Worker time tracking
- `config` - Application configuration

### Safety & Compliance
- `incidents` - Safety incident reports
- `emergency_contacts` - Worker emergency contacts
- `sos_events` - Emergency SOS activations
- `background_checks` - Worker background verification
- `worker_check_ins` - Safety check-in tracking

### Extended Features
- `chats` - Chat conversations
- `messages` - Chat messages
- `job_events` - Job history and events
- `notifications` - Push notifications
- `reviews` - Client reviews and ratings
- `income` - Worker earnings tracking
- `gps_tracking` - Location tracking
- `push_tokens` - Push notification tokens
- `analytics_*` - Analytics and reporting data

## Firestore Rules & Indexes

The setup also includes:
- Updated security rules in `firestore.rules`
- Database indexes in `firestore.indexes.json`

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure Firebase Admin SDK is properly configured
2. **Project Not Found**: Verify the project ID in `.firewayrc`
3. **Network Issues**: Check internet connection and Firebase project access

### Verify Setup

After running migrations, you can verify the setup by:
1. Checking the Firebase Console for new collections
2. Running the app and checking for database connection errors
3. Testing authentication and basic CRUD operations

## Security Notes

- The current Firestore rules are development-friendly but should be tightened for production
- Ensure proper role-based access control is implemented
- Review and update security rules based on your specific requirements

## Next Steps

1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Deploy Firestore indexes: `firebase deploy --only firestore:indexes` 
3. Set up Firebase Functions if needed
4. Configure Firebase Authentication providers