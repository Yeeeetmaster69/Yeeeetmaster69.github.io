import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { SubscriptionPlan, ClientSubscription, SubscriptionFrequency } from '../utils/types';

// Subscription Plans CRUD Operations
export const createSubscriptionPlan = async (planData: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const plan = {
      ...planData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'subscription_plans'), plan);
    return { id: docRef.id, ...plan };
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    throw error;
  }
};

export const getSubscriptionPlans = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'subscription_plans'), orderBy('createdAt', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SubscriptionPlan));
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
};

export const getActiveSubscriptionPlans = async () => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'subscription_plans'), 
        where('isActive', '==', true),
        orderBy('frequency'),
        orderBy('basePrice')
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SubscriptionPlan));
  } catch (error) {
    console.error('Error fetching active subscription plans:', error);
    throw error;
  }
};

export const updateSubscriptionPlan = async (planId: string, updates: Partial<SubscriptionPlan>) => {
  try {
    const planRef = doc(db, 'subscription_plans', planId);
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDoc(planRef, updateData);
    return updateData;
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    throw error;
  }
};

export const deleteSubscriptionPlan = async (planId: string) => {
  try {
    await deleteDoc(doc(db, 'subscription_plans', planId));
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    throw error;
  }
};

// Client Subscriptions CRUD Operations
export const createClientSubscription = async (subscriptionData: Omit<ClientSubscription, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const subscription = {
      ...subscriptionData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'client_subscriptions'), subscription);
    return { id: docRef.id, ...subscription };
  } catch (error) {
    console.error('Error creating client subscription:', error);
    throw error;
  }
};

export const getClientSubscriptions = async (clientId?: string) => {
  try {
    let queryRef;
    
    if (clientId) {
      queryRef = query(
        collection(db, 'client_subscriptions'), 
        where('clientId', '==', clientId), 
        orderBy('createdAt', 'desc')
      );
    } else {
      queryRef = query(
        collection(db, 'client_subscriptions'), 
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(queryRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ClientSubscription));
  } catch (error) {
    console.error('Error fetching client subscriptions:', error);
    throw error;
  }
};

export const getActiveSubscriptions = async () => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'client_subscriptions'),
        where('status', '==', 'active'),
        orderBy('nextServiceDate')
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ClientSubscription));
  } catch (error) {
    console.error('Error fetching active subscriptions:', error);
    throw error;
  }
};

export const updateClientSubscription = async (subscriptionId: string, updates: Partial<ClientSubscription>) => {
  try {
    const subscriptionRef = doc(db, 'client_subscriptions', subscriptionId);
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDoc(subscriptionRef, updateData);
    return updateData;
  } catch (error) {
    console.error('Error updating client subscription:', error);
    throw error;
  }
};

export const cancelClientSubscription = async (subscriptionId: string, reason?: string) => {
  try {
    const updateData = {
      status: 'cancelled' as const,
      endDate: Date.now(),
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
      updatedAt: Date.now()
    };
    
    await updateDoc(doc(db, 'client_subscriptions', subscriptionId), updateData);
    return updateData;
  } catch (error) {
    console.error('Error cancelling client subscription:', error);
    throw error;
  }
};

// Utility functions for subscription scheduling
export const calculateNextServiceDate = (lastServiceDate: number, frequency: SubscriptionFrequency): number => {
  const lastDate = new Date(lastServiceDate);
  
  switch (frequency) {
    case 'weekly':
      return lastDate.setDate(lastDate.getDate() + 7);
    case 'biweekly':
      return lastDate.setDate(lastDate.getDate() + 14);
    case 'monthly':
      return lastDate.setMonth(lastDate.getMonth() + 1);
    case 'quarterly':
      return lastDate.setMonth(lastDate.getMonth() + 3);
    case 'semi-annual':
      return lastDate.setMonth(lastDate.getMonth() + 6);
    case 'one-time':
      return 0; // One-time subscriptions don't have next service dates
    default:
      return lastDate.getTime();
  }
};

export const getUpcomingServices = async (daysAhead: number = 7) => {
  try {
    const cutoffDate = Date.now() + (daysAhead * 24 * 60 * 60 * 1000);
    
    const querySnapshot = await getDocs(
      query(
        collection(db, 'client_subscriptions'),
        where('status', '==', 'active'),
        where('nextServiceDate', '<=', cutoffDate),
        orderBy('nextServiceDate')
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ClientSubscription));
  } catch (error) {
    console.error('Error fetching upcoming services:', error);
    throw error;
  }
};