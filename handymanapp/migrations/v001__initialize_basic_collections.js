const admin = require('firebase-admin');

module.exports = async () => {
  const firestore = admin.firestore();
  
  // Create initial collections with basic structure
  // This is mainly for setting up security rules and indexes
  
  // Create users collection with initial admin user if needed
  const usersRef = firestore.collection('users');
  
  // Create jobs collection  
  const jobsRef = firestore.collection('jobs');
  
  // Create timesheets collection
  const timesheetsRef = firestore.collection('timesheets');
  
  // Create config collection with initial settings
  const configRef = firestore.collection('config');
  await configRef.doc('app_settings').set({
    maintenance_mode: false,
    app_version: '0.1.0',
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log('✅ Basic collections initialized');
};