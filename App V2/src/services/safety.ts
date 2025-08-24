import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { IncidentReport, EmergencyContact, BackgroundCheck, IncidentType, IncidentSeverity } from '../utils/types';

// Incident Reporting
export const createIncidentReport = async (incidentData: Omit<IncidentReport, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const incident = {
      ...incidentData,
      status: 'reported' as const,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'incident_reports'), incident);
    return { id: docRef.id, ...incident };
  } catch (error) {
    console.error('Error creating incident report:', error);
    throw error;
  }
};

export const getIncidentReports = async (filters?: {
  reporterId?: string;
  jobId?: string;
  type?: IncidentType;
  severity?: IncidentSeverity;
  status?: string;
}) => {
  try {
    let queryRef = collection(db, 'incident_reports');
    const conditions = [];

    if (filters?.reporterId) {
      conditions.push(where('reporterId', '==', filters.reporterId));
    }
    if (filters?.jobId) {
      conditions.push(where('jobId', '==', filters.jobId));
    }
    if (filters?.type) {
      conditions.push(where('type', '==', filters.type));
    }
    if (filters?.severity) {
      conditions.push(where('severity', '==', filters.severity));
    }
    if (filters?.status) {
      conditions.push(where('status', '==', filters.status));
    }

    conditions.push(orderBy('reportedAt', 'desc'));

    if (conditions.length > 0) {
      queryRef = query(queryRef, ...conditions);
    }
    
    const querySnapshot = await getDocs(queryRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as IncidentReport));
  } catch (error) {
    console.error('Error fetching incident reports:', error);
    throw error;
  }
};

export const updateIncidentReport = async (incidentId: string, updates: Partial<IncidentReport>) => {
  try {
    const incidentRef = doc(db, 'incident_reports', incidentId);
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDoc(incidentRef, updateData);
    return updateData;
  } catch (error) {
    console.error('Error updating incident report:', error);
    throw error;
  }
};

export const investigateIncident = async (incidentId: string, investigatorId: string, notes?: string) => {
  try {
    const updateData = {
      status: 'investigating' as const,
      investigatedAt: Date.now(),
      investigatedBy: investigatorId,
      followUpNotes: notes,
      updatedAt: Date.now()
    };
    
    await updateDoc(doc(db, 'incident_reports', incidentId), updateData);
    return updateData;
  } catch (error) {
    console.error('Error investigating incident:', error);
    throw error;
  }
};

export const resolveIncident = async (incidentId: string, resolutionNotes: string) => {
  try {
    const updateData = {
      status: 'resolved' as const,
      followUpNotes: resolutionNotes,
      updatedAt: Date.now()
    };
    
    await updateDoc(doc(db, 'incident_reports', incidentId), updateData);
    return updateData;
  } catch (error) {
    console.error('Error resolving incident:', error);
    throw error;
  }
};

// Emergency Contacts
export const createEmergencyContact = async (contactData: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const contact = {
      ...contactData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'emergency_contacts'), contact);
    return { id: docRef.id, ...contact };
  } catch (error) {
    console.error('Error creating emergency contact:', error);
    throw error;
  }
};

export const getEmergencyContacts = async (userId: string) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'emergency_contacts'),
        where('userId', '==', userId),
        orderBy('isPrimary', 'desc'),
        orderBy('createdAt', 'desc')
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as EmergencyContact));
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    throw error;
  }
};

export const updateEmergencyContact = async (contactId: string, updates: Partial<EmergencyContact>) => {
  try {
    const contactRef = doc(db, 'emergency_contacts', contactId);
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDoc(contactRef, updateData);
    return updateData;
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    throw error;
  }
};

// Background Checks
export const createBackgroundCheck = async (checkData: Omit<BackgroundCheck, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const check = {
      ...checkData,
      status: 'pending' as const,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'background_checks'), check);
    return { id: docRef.id, ...check };
  } catch (error) {
    console.error('Error creating background check:', error);
    throw error;
  }
};

export const getBackgroundChecks = async (workerId?: string) => {
  try {
    let queryRef;
    
    if (workerId) {
      queryRef = query(
        collection(db, 'background_checks'),
        where('workerId', '==', workerId),
        orderBy('requestedAt', 'desc')
      );
    } else {
      queryRef = query(
        collection(db, 'background_checks'),
        orderBy('requestedAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(queryRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as BackgroundCheck));
  } catch (error) {
    console.error('Error fetching background checks:', error);
    throw error;
  }
};

export const updateBackgroundCheck = async (checkId: string, updates: Partial<BackgroundCheck>) => {
  try {
    const checkRef = doc(db, 'background_checks', checkId);
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDoc(checkRef, updateData);
    return updateData;
  } catch (error) {
    console.error('Error updating background check:', error);
    throw error;
  }
};

export const completeBackgroundCheck = async (
  checkId: string, 
  passed: boolean, 
  details?: string, 
  documentUrl?: string
) => {
  try {
    const updateData = {
      status: 'completed' as const,
      completedAt: Date.now(),
      results: {
        passed,
        details,
        documentUrl
      },
      updatedAt: Date.now()
    };
    
    await updateDoc(doc(db, 'background_checks', checkId), updateData);
    return updateData;
  } catch (error) {
    console.error('Error completing background check:', error);
    throw error;
  }
};

// Emergency SOS Functions
export const triggerEmergencySOS = async (userId: string, location: { lat: number; lng: number }, notes?: string) => {
  try {
    const sosData = {
      userId,
      location,
      notes: notes || 'Emergency SOS triggered',
      triggeredAt: Date.now(),
      status: 'active',
      responseTime: null,
      respondedBy: null
    };
    
    const docRef = await addDoc(collection(db, 'emergency_sos'), sosData);
    
    // Create incident report automatically
    await createIncidentReport({
      reporterId: userId,
      reporterRole: 'worker', // Assuming worker for SOS
      type: 'emergency',
      severity: 'critical',
      title: 'Emergency SOS Triggered',
      description: `Emergency SOS was triggered by user. Location: ${location.lat}, ${location.lng}. ${notes || ''}`,
      location: `${location.lat}, ${location.lng}`,
      actionsTaken: 'SOS triggered, emergency contacts notified',
      followUpRequired: true,
      reportedAt: Date.now()
    });
    
    return { id: docRef.id, ...sosData };
  } catch (error) {
    console.error('Error triggering emergency SOS:', error);
    throw error;
  }
};

export const respondToSOS = async (sosId: string, responderId: string) => {
  try {
    const updateData = {
      status: 'responded',
      responseTime: Date.now(),
      respondedBy: responderId,
      updatedAt: Date.now()
    };
    
    await updateDoc(doc(db, 'emergency_sos', sosId), updateData);
    return updateData;
  } catch (error) {
    console.error('Error responding to SOS:', error);
    throw error;
  }
};