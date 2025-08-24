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
import { Client } from '../utils/types';

export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const client = {
      ...clientData,
      totalJobs: 0,
      totalSpent: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const docRef = await addDoc(collection(db, 'clients'), client);
    return { id: docRef.id, ...client };
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

export const getClients = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, 'clients'), orderBy('createdAt', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Client));
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

export const getClientById = async (clientId: string) => {
  try {
    const clientDoc = await getDoc(doc(db, 'clients', clientId));
    
    if (clientDoc.exists()) {
      return { id: clientDoc.id, ...clientDoc.data() } as Client;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
};

export const updateClient = async (clientId: string, updates: Partial<Client>) => {
  try {
    const clientRef = doc(db, 'clients', clientId);
    const updateData = {
      ...updates,
      updatedAt: Date.now()
    };
    
    await updateDoc(clientRef, updateData);
    return updateData;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

export const deleteClient = async (clientId: string) => {
  try {
    await deleteDoc(doc(db, 'clients', clientId));
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

export const searchClients = async (searchTerm: string) => {
  try {
    const clients = await getClients();
    
    return clients.filter(client => 
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    );
  } catch (error) {
    console.error('Error searching clients:', error);
    throw error;
  }
};