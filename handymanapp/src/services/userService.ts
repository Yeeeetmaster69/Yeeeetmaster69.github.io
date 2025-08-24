import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'worker' | 'client';
  phone?: string;
  address?: string;
  skills?: string[];
  rating?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const getUserRole = async (userId: string): Promise<string> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.role || 'client';
    }
    return 'client'; // Default role
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'client';
  }
};

export const createUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', userId);
    const newProfile: UserProfile = {
      id: userId,
      name: profileData.name || '',
      email: profileData.email || '',
      role: profileData.role || 'client',
      phone: profileData.phone || '',
      address: profileData.address || '',
      skills: profileData.skills || [],
      rating: profileData.rating || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...profileData
    };
    
    await setDoc(userRef, newProfile);
    return newProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};