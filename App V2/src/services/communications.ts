import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  AutomatedReminder, 
  PersonalizedNotification, 
  CommunicationPreferences,
  CallSession,
  ReminderType, 
  NotificationChannel,
  Role 
} from '../utils/types';

// Automated Reminders
export const createAutomatedReminder = async (reminderData: Omit<AutomatedReminder, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const reminder = {
      ...reminderData,
      status: 'scheduled' as const,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'automated_reminders'), reminder);
    return { id: docRef.id, ...reminder };
  } catch (error) {
    console.error('Error creating automated reminder:', error);
    throw error;
  }
};

export const getScheduledReminders = async (beforeTimestamp?: number) => {
  try {
    const timestamp = beforeTimestamp || Date.now();
    
    const querySnapshot = await getDocs(
      query(
        collection(db, 'automated_reminders'),
        where('status', '==', 'scheduled'),
        where('scheduledAt', '<=', timestamp),
        orderBy('scheduledAt'),
        limit(50)
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AutomatedReminder));
  } catch (error) {
    console.error('Error fetching scheduled reminders:', error);
    throw error;
  }
};

export const markReminderAsSent = async (reminderId: string) => {
  try {
    const updateData = {
      status: 'sent' as const,
      sentAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await updateDoc(doc(db, 'automated_reminders', reminderId), updateData);
    return updateData;
  } catch (error) {
    console.error('Error marking reminder as sent:', error);
    throw error;
  }
};

export const scheduleRecurringReminder = async (reminderId: string, nextScheduledAt: number) => {
  try {
    const updateData = {
      nextScheduledAt,
      updatedAt: Date.now()
    };
    
    await updateDoc(doc(db, 'automated_reminders', reminderId), updateData);
    
    // Create next occurrence
    const originalReminder = await getDoc(doc(db, 'automated_reminders', reminderId));
    if (originalReminder.exists()) {
      const reminderData = originalReminder.data() as AutomatedReminder;
      
      await createAutomatedReminder({
        ...reminderData,
        scheduledAt: nextScheduledAt
      });
    }
    
    return updateData;
  } catch (error) {
    console.error('Error scheduling recurring reminder:', error);
    throw error;
  }
};

// Job Reminder Templates
export const scheduleJobReminders = async (jobId: string, clientId: string, workerId: string, scheduledAt: number) => {
  try {
    const oneDayBefore = scheduledAt - (24 * 60 * 60 * 1000);
    const oneHourBefore = scheduledAt - (60 * 60 * 1000);
    
    // 24-hour reminder for client
    await createAutomatedReminder({
      type: 'job_scheduled',
      title: 'Job Reminder - Tomorrow',
      message: 'Your handyman service is scheduled for tomorrow. Please ensure someone is available at the property.',
      recipientId: clientId,
      recipientRole: 'client',
      channels: ['push', 'sms', 'email'],
      scheduledAt: oneDayBefore,
      relatedEntityId: jobId,
      relatedEntityType: 'job',
      isRecurring: false
    });
    
    // 1-hour reminder for worker
    await createAutomatedReminder({
      type: 'job_scheduled',
      title: 'Job Starting Soon',
      message: 'You have a job starting in 1 hour. Please review the details and prepare your tools.',
      recipientId: workerId,
      recipientRole: 'worker',
      channels: ['push', 'sms'],
      scheduledAt: oneHourBefore,
      relatedEntityId: jobId,
      relatedEntityType: 'job',
      isRecurring: false
    });
  } catch (error) {
    console.error('Error scheduling job reminders:', error);
    throw error;
  }
};

export const schedulePaymentReminders = async (clientId: string, invoiceId: string, dueDate: number, amount: number) => {
  try {
    const threeDaysBefore = dueDate - (3 * 24 * 60 * 60 * 1000);
    const oneDayBefore = dueDate - (24 * 60 * 60 * 1000);
    const oneDayAfter = dueDate + (24 * 60 * 60 * 1000);
    
    // 3 days before due date
    await createAutomatedReminder({
      type: 'payment_due',
      title: 'Payment Reminder',
      message: `Your payment of $${amount.toFixed(2)} is due in 3 days. Pay now to avoid late fees.`,
      recipientId: clientId,
      recipientRole: 'client',
      channels: ['email', 'push'],
      scheduledAt: threeDaysBefore,
      relatedEntityId: invoiceId,
      relatedEntityType: 'invoice',
      isRecurring: false
    });
    
    // 1 day before due date
    await createAutomatedReminder({
      type: 'payment_due',
      title: 'Payment Due Tomorrow',
      message: `Reminder: Your payment of $${amount.toFixed(2)} is due tomorrow.`,
      recipientId: clientId,
      recipientRole: 'client',
      channels: ['sms', 'push', 'email'],
      scheduledAt: oneDayBefore,
      relatedEntityId: invoiceId,
      relatedEntityType: 'invoice',
      isRecurring: false
    });
    
    // 1 day after due date
    await createAutomatedReminder({
      type: 'payment_due',
      title: 'Payment Overdue',
      message: `Your payment of $${amount.toFixed(2)} is now overdue. Please pay immediately to avoid service interruption.`,
      recipientId: clientId,
      recipientRole: 'client',
      channels: ['sms', 'email'],
      scheduledAt: oneDayAfter,
      relatedEntityId: invoiceId,
      relatedEntityType: 'invoice',
      isRecurring: false
    });
  } catch (error) {
    console.error('Error scheduling payment reminders:', error);
    throw error;
  }
};

export const scheduleReviewReminders = async (clientId: string, jobId: string) => {
  try {
    const twoDaysAfter = Date.now() + (2 * 24 * 60 * 60 * 1000);
    const oneWeekAfter = Date.now() + (7 * 24 * 60 * 60 * 1000);
    
    // 2 days after job completion
    await createAutomatedReminder({
      type: 'review_request',
      title: 'How was our service?',
      message: 'We hope you\'re happy with our recent service! Please take a moment to leave a review.',
      recipientId: clientId,
      recipientRole: 'client',
      channels: ['push', 'email'],
      scheduledAt: twoDaysAfter,
      relatedEntityId: jobId,
      relatedEntityType: 'job',
      isRecurring: false
    });
    
    // Follow-up if no review after 1 week
    await createAutomatedReminder({
      type: 'review_request',
      title: 'Review Follow-up',
      message: 'Your feedback is important to us! Please share your experience with our service.',
      recipientId: clientId,
      recipientRole: 'client',
      channels: ['email'],
      scheduledAt: oneWeekAfter,
      relatedEntityId: jobId,
      relatedEntityType: 'job',
      isRecurring: false
    });
  } catch (error) {
    console.error('Error scheduling review reminders:', error);
    throw error;
  }
};

// Personalized Notifications
export const createPersonalizedNotification = async (notificationData: Omit<PersonalizedNotification, 'id' | 'createdAt'>) => {
  try {
    const notification = {
      ...notificationData,
      isRead: false,
      createdAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'personalized_notifications'), notification);
    return { id: docRef.id, ...notification };
  } catch (error) {
    console.error('Error creating personalized notification:', error);
    throw error;
  }
};

export const generatePersonalizedMessage = (
  template: string, 
  personalizationData: PersonalizedNotification['personalizationData']
): string => {
  let message = template;
  
  // Replace placeholders with actual data
  message = message.replace(/\{userName\}/g, personalizationData.userName);
  message = message.replace(/\{jobCount\}/g, personalizationData.jobCount?.toString() || '0');
  message = message.replace(/\{earnings\}/g, personalizationData.earnings?.toFixed(2) || '0.00');
  message = message.replace(/\{completionRate\}/g, personalizationData.completionRate?.toFixed(1) || '0.0');
  
  return message;
};

export const sendPersonalizedJobUpdate = async (
  workerId: string, 
  userName: string, 
  jobsCompleted: number, 
  totalEarnings: number
) => {
  try {
    const templates = [
      'Great work, {userName}! You\'ve completed {jobCount} jobs and earned ${earnings}.',
      'Keep it up, {userName}! Your recent performance has been excellent with {jobCount} completed jobs.',
      'Amazing progress, {userName}! You\'ve earned ${earnings} from {jobCount} successful jobs.'
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const personalizedMessage = generatePersonalizedMessage(template, {
      userName,
      jobCount: jobsCompleted,
      earnings: totalEarnings
    });
    
    await createPersonalizedNotification({
      userId: workerId,
      title: 'Job Update',
      body: personalizedMessage,
      type: 'job',
      channels: ['push', 'in_app'],
      priority: 'medium',
      personalizationData: {
        userName,
        jobCount: jobsCompleted,
        earnings: totalEarnings
      }
    });
  } catch (error) {
    console.error('Error sending personalized job update:', error);
    throw error;
  }
};

// Communication Preferences
export const createCommunicationPreferences = async (preferencesData: Omit<CommunicationPreferences, 'id' | 'updatedAt'>) => {
  try {
    const preferences = {
      ...preferencesData,
      updatedAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'communication_preferences'), preferences);
    return { id: docRef.id, ...preferences };
  } catch (error) {
    console.error('Error creating communication preferences:', error);
    throw error;
  }
};

export const getCommunicationPreferences = async (userId: string) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'communication_preferences'),
        where('userId', '==', userId),
        limit(1)
      )
    );
    
    if (querySnapshot.docs.length > 0) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CommunicationPreferences;
    }
    
    // Return default preferences if none exist
    return {
      userId,
      channels: {
        push: true,
        sms: true,
        email: true,
        inApp: true
      },
      frequency: {
        jobReminders: 'normal',
        paymentNotifications: 'normal',
        promotions: 'minimal'
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      },
      language: 'en',
      timezone: 'America/Denver'
    } as CommunicationPreferences;
  } catch (error) {
    console.error('Error fetching communication preferences:', error);
    throw error;
  }
};

export const updateCommunicationPreferences = async (userId: string, updates: Partial<CommunicationPreferences>) => {
  try {
    const preferences = await getCommunicationPreferences(userId);
    
    if (preferences.id) {
      const updateData = {
        ...updates,
        updatedAt: Date.now()
      };
      
      await updateDoc(doc(db, 'communication_preferences', preferences.id), updateData);
      return updateData;
    } else {
      // Create new preferences if none exist
      return await createCommunicationPreferences({
        userId,
        ...updates
      } as CommunicationPreferences);
    }
  } catch (error) {
    console.error('Error updating communication preferences:', error);
    throw error;
  }
};

// Call Sessions
export const createCallSession = async (callData: Omit<CallSession, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const call = {
      ...callData,
      status: 'initiated' as const,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'call_sessions'), call);
    return { id: docRef.id, ...call };
  } catch (error) {
    console.error('Error creating call session:', error);
    throw error;
  }
};

export const updateCallSession = async (callId: string, updates: Partial<CallSession>) => {
  try {
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDoc(doc(db, 'call_sessions', callId), updateData);
    return updateData;
  } catch (error) {
    console.error('Error updating call session:', error);
    throw error;
  }
};

export const endCallSession = async (callId: string, duration: number, notes?: string) => {
  try {
    const updateData = {
      status: 'ended' as const,
      endedAt: Date.now(),
      duration,
      notes,
      updatedAt: Date.now()
    };
    
    await updateDoc(doc(db, 'call_sessions', callId), updateData);
    return updateData;
  } catch (error) {
    console.error('Error ending call session:', error);
    throw error;
  }
};

export const getCallHistory = async (userId: string) => {
  try {
    const [initiatedCalls, receivedCalls] = await Promise.all([
      getDocs(
        query(
          collection(db, 'call_sessions'),
          where('initiatorId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      ),
      getDocs(
        query(
          collection(db, 'call_sessions'),
          where('participantId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      )
    ]);
    
    const allCalls = [
      ...initiatedCalls.docs.map(doc => ({ id: doc.id, ...doc.data() } as CallSession)),
      ...receivedCalls.docs.map(doc => ({ id: doc.id, ...doc.data() } as CallSession))
    ];
    
    // Sort by creation date and remove duplicates
    return allCalls
      .sort((a, b) => b.createdAt! - a.createdAt!)
      .filter((call, index, arr) => arr.findIndex(c => c.id === call.id) === index)
      .slice(0, 50);
  } catch (error) {
    console.error('Error fetching call history:', error);
    throw error;
  }
};