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
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Worker } from '../utils/types';

export const createWorker = async (workerData: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const worker = {
      ...workerData,
      totalJobs: 0,
      totalEarnings: 0,
      totalMilesDriven: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'workers'), worker);
    return { id: docRef.id, ...worker };
  } catch (error) {
    console.error('Error creating worker:', error);
    throw error;
  }
};

export const getWorkers = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'workers'), orderBy('createdAt', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Worker));
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
};

export const getActiveWorkers = async () => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'workers'),
        where('isActive', '==', true),
        orderBy('firstName')
      )
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Worker));
  } catch (error) {
    console.error('Error fetching active workers:', error);
    throw error;
  }
};

export const getWorkerById = async (workerId: string) => {
  try {
    const workerDoc = await getDoc(doc(db, 'workers', workerId));
    
    if (workerDoc.exists()) {
      return { id: workerDoc.id, ...workerDoc.data() } as Worker;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching worker:', error);
    throw error;
  }
};

export const updateWorker = async (workerId: string, updates: Partial<Worker>) => {
  try {
    const workerRef = doc(db, 'workers', workerId);
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDoc(workerRef, updateData);
    return updateData;
  } catch (error) {
    console.error('Error updating worker:', error);
    throw error;
  }
};

export const deleteWorker = async (workerId: string) => {
  try {
    await deleteDoc(doc(db, 'workers', workerId));
  } catch (error) {
    console.error('Error deleting worker:', error);
    throw error;
  }
};

export const searchWorkers = async (searchTerm: string) => {
  try {
    const workers = await getWorkers();
    
    return workers.filter(worker => 
      worker.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.phone.includes(searchTerm) ||
      worker.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  } catch (error) {
    console.error('Error searching workers:', error);
    throw error;
  }
};