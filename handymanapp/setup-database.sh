#!/bin/bash

# Database setup script for Handyman Pro app
echo "🚀 Setting up Handyman Pro database..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check for Firebase Admin key
if [ ! -f "firebase-admin-key.json" ]; then
    echo "⚠️  Firebase Admin key not found!"
    echo "Please download your Firebase Admin SDK key and save it as 'firebase-admin-key.json'"
    echo "You can get it from: https://console.firebase.google.com/project/handyman-c1eee/settings/serviceaccounts/adminsdk"
    read -p "Press Enter when you have added the key file..."
fi

# Set environment variables
export GOOGLE_APPLICATION_CREDENTIALS="./firebase-admin-key.json"
export FIREBASE_PROJECT_ID="handyman-c1eee"

echo "🗄️  Running database migrations..."

# Run migrations
if npm run migrate; then
    echo "✅ Database setup completed successfully!"
    echo ""
    echo "📚 Next steps:"
    echo "1. Deploy Firestore rules: firebase deploy --only firestore:rules"  
    echo "2. Deploy Firestore indexes: firebase deploy --only firestore:indexes"
    echo "3. Test the app: npm start"
    echo ""
    echo "📖 For more details, see DATABASE_SETUP.md"
else
    echo "❌ Database migration failed!"
    echo "Please check the error messages above and ensure:"
    echo "- Firebase Admin SDK key is correct"
    echo "- Internet connection is working"
    echo "- Firebase project permissions are correct"
    exit 1
fi