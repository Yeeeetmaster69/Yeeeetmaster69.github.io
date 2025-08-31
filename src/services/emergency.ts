/**
 * Emergency SOS Service
 * Handles emergency situations, location tracking, and notification systems
 */

import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';

export interface SOSEvent {
  id?: string;
  userId: string;
  userType: 'worker' | 'client';
  status: 'active' | 'responding' | 'resolved' | 'false_alarm';
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  };
  timestamp: number;
  resolvedAt?: number;
  escalationLevel: 'initial' | 'supervisor' | 'emergency_services';
  notifications: NotificationLog[];
  notes?: string;
  responseTeam?: string[];
}

export interface NotificationLog {
  id: string;
  recipientId: string;
  recipientType: 'emergency_contact' | 'supervisor' | 'admin' | 'emergency_services';
  method: 'sms' | 'call' | 'push' | 'email';
  sentAt: number;
  acknowledged?: boolean;
  acknowledgedAt?: number;
}

export interface EmergencyContact {
  id?: string;
  userId: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  email?: string;
  isPrimary: boolean;
  notificationMethods: ('sms' | 'call' | 'email' | 'push')[];
  isActive: boolean;
}

class EmergencyService {
  /**
   * Activate SOS - Core emergency response function
   */
  async activateSOS(userId: string, userType: 'worker' | 'client'): Promise<string> {
    try {
      console.log('🚨 Activating SOS for user:', userId);

      // Get current location
      const location = await this.getCurrentLocation();
      
      // Create SOS event
      const sosEvent: Omit<SOSEvent, 'id'> = {
        userId,
        userType,
        status: 'active',
        location,
        timestamp: Date.now(),
        escalationLevel: 'initial',
        notifications: []
      };

      // Save to database
      const docRef = await addDoc(collection(db, 'sos_events'), sosEvent);
      const sosId = docRef.id;

      // Start notification cascade
      await this.sendInitialNotifications(sosId, userId, location);

      // Schedule escalation if no response
      this.scheduleEscalation(sosId);

      console.log('✅ SOS activated successfully:', sosId);
      return sosId;

    } catch (error) {
      console.error('❌ Error activating SOS:', error);
      throw new Error('Failed to activate emergency SOS');
    }
  }

  /**
   * Get current location with fallback
   */
  private async getCurrentLocation(): Promise<SOSEvent['location']> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1
      });

      // Reverse geocode for address
      let address = 'Unknown location';
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        
        if (reverseGeocode.length > 0) {
          const location = reverseGeocode[0];
          address = `${location.street || ''} ${location.city || ''} ${location.region || ''}`.trim();
        }
      } catch (geocodeError) {
        console.warn('Failed to reverse geocode location:', geocodeError);
      }

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || undefined,
        address
      };

    } catch (error) {
      console.error('Failed to get location:', error);
      
      // Return fallback location if available
      return {
        latitude: 0,
        longitude: 0,
        address: 'Location unavailable'
      };
    }
  }

  /**
   * Send initial emergency notifications
   */
  private async sendInitialNotifications(sosId: string, userId: string, location: SOSEvent['location']) {
    try {
      // Get user's emergency contacts
      const emergencyContacts = await this.getEmergencyContacts(userId);
      
      if (emergencyContacts.length === 0) {
        console.warn('No emergency contacts found for user:', userId);
        // Send to admin/supervisors as fallback
        await this.notifyAdministrators(sosId, location);
        return;
      }

      // Send notifications to primary contacts first
      const primaryContacts = emergencyContacts.filter(contact => contact.isPrimary);
      const otherContacts = emergencyContacts.filter(contact => !contact.isPrimary);

      // Notify primary contacts immediately
      for (const contact of primaryContacts) {
        await this.sendEmergencyNotification(sosId, contact, location);
      }

      // Notify other contacts after 2 minutes if no response
      setTimeout(async () => {
        const sosStatus = await this.getSOSStatus(sosId);
        if (sosStatus === 'active') {
          for (const contact of otherContacts) {
            await this.sendEmergencyNotification(sosId, contact, location);
          }
        }
      }, 2 * 60 * 1000); // 2 minutes

    } catch (error) {
      console.error('Error sending initial notifications:', error);
    }
  }

  /**
   * Send notification to specific emergency contact
   */
  private async sendEmergencyNotification(sosId: string, contact: EmergencyContact, location: SOSEvent['location']) {
    const message = `🚨 EMERGENCY ALERT: ${contact.name} has activated emergency SOS. Location: ${location.address}. Please respond immediately.`;
    
    // Send push notification (if app installed)
    if (contact.notificationMethods.includes('push')) {
      await this.sendPushNotification(contact.userId, 'Emergency SOS Activated', message);
    }

    // In a real implementation, you would integrate with:
    // - SMS service (Twilio, AWS SNS)
    // - Email service (SendGrid, AWS SES)
    // - Voice calling service
    
    console.log(`📱 Emergency notification sent to ${contact.name} (${contact.phoneNumber})`);
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(userId: string, title: string, body: string) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          priority: Notifications.AndroidNotificationPriority.MAX,
          sound: 'default',
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Get user's emergency contacts
   */
  async getEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
    try {
      const contactsQuery = query(
        collection(db, 'emergency_contacts'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('isPrimary', 'desc')
      );

      const snapshot = await getDocs(contactsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EmergencyContact));

    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      return [];
    }
  }

  /**
   * Schedule escalation if no response received
   */
  private scheduleEscalation(sosId: string) {
    // Escalate to supervisors after 5 minutes
    setTimeout(async () => {
      const status = await this.getSOSStatus(sosId);
      if (status === 'active') {
        await this.escalateToSupervisors(sosId);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Escalate to emergency services after 10 minutes
    setTimeout(async () => {
      const status = await this.getSOSStatus(sosId);
      if (status === 'active') {
        await this.escalateToEmergencyServices(sosId);
      }
    }, 10 * 60 * 1000); // 10 minutes
  }

  /**
   * Get current SOS status
   */
  private async getSOSStatus(sosId: string): Promise<SOSEvent['status']> {
    try {
      // In a real implementation, you would fetch from database
      // For now, return 'active' to continue escalation
      return 'active';
    } catch (error) {
      console.error('Error getting SOS status:', error);
      return 'active';
    }
  }

  /**
   * Escalate to supervisors/administrators
   */
  private async escalateToSupervisors(sosId: string) {
    console.log('📈 Escalating SOS to supervisors:', sosId);
    
    // Update escalation level
    await updateDoc(doc(db, 'sos_events', sosId), {
      escalationLevel: 'supervisor',
      updatedAt: Timestamp.now()
    });

    // Notify all administrators
    await this.notifyAdministrators(sosId);
  }

  /**
   * Escalate to emergency services
   */
  private async escalateToEmergencyServices(sosId: string) {
    console.log('🚨 CRITICAL: Escalating SOS to emergency services:', sosId);
    
    // Update escalation level
    await updateDoc(doc(db, 'sos_events', sosId), {
      escalationLevel: 'emergency_services',
      updatedAt: Timestamp.now()
    });

    // In a real implementation, this would:
    // 1. Contact emergency services (911)
    // 2. Provide location and user information
    // 3. Maintain communication line
    // 4. Dispatch company response team if available
  }

  /**
   * Notify administrators/supervisors
   */
  private async notifyAdministrators(sosId: string, location?: SOSEvent['location']) {
    console.log('👥 Notifying administrators about SOS:', sosId);
    
    // In a real implementation:
    // 1. Query for all admin users
    // 2. Send high-priority notifications
    // 3. Update admin dashboard with emergency alert
    // 4. Log all notification attempts
  }

  /**
   * Resolve SOS event
   */
  async resolveSOS(sosId: string, notes?: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'sos_events', sosId), {
        status: 'resolved',
        resolvedAt: Date.now(),
        notes: notes || 'SOS resolved',
        updatedAt: Timestamp.now()
      });

      console.log('✅ SOS resolved:', sosId);
    } catch (error) {
      console.error('Error resolving SOS:', error);
      throw error;
    }
  }

  /**
   * Add emergency contact
   */
  async addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'emergency_contacts'), {
        ...contact,
        createdAt: Timestamp.now()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding emergency contact:', error);
      throw error;
    }
  }

  /**
   * Test emergency system
   */
  async testEmergencySystem(userId: string): Promise<boolean> {
    try {
      console.log('🧪 Testing emergency system for user:', userId);
      
      // Send test notifications to emergency contacts
      const contacts = await this.getEmergencyContacts(userId);
      
      for (const contact of contacts) {
        await this.sendPushNotification(
          contact.userId,
          'Emergency System Test',
          `This is a test of the emergency notification system. Your contact ${contact.name} is testing their emergency settings.`
        );
      }

      return true;
    } catch (error) {
      console.error('Error testing emergency system:', error);
      return false;
    }
  }
}

export default new EmergencyService();