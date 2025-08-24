const admin = require('firebase-admin');

module.exports = async () => {
  const firestore = admin.firestore();
  
  // Create safety and compliance collections
  
  // Incidents collection for safety reporting
  const incidentsRef = firestore.collection('incidents');
  
  // Emergency contacts collection
  const emergencyContactsRef = firestore.collection('emergency_contacts');
  
  // SOS events collection for emergency responses
  const sosEventsRef = firestore.collection('sos_events'); 
  
  // Background checks collection
  const backgroundChecksRef = firestore.collection('background_checks');
  
  // Worker check-ins for safety monitoring
  const workerCheckInsRef = firestore.collection('worker_check_ins');
  
  // Create initial safety configuration
  const configRef = firestore.collection('config');
  await configRef.doc('safety_settings').set({
    sos_timeout_minutes: 15,
    checkin_interval_hours: 4,
    emergency_escalation_enabled: true,
    background_check_required: true,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log('✅ Safety and compliance collections initialized');
};