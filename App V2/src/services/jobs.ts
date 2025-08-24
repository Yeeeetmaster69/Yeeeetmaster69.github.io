
import { db } from '../config/firebase';
import { collection, addDoc, doc, updateDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Job, JobStatus } from '../utils/types';

export async function createJob(job: Job){
  const ref = await addDoc(collection(db, 'jobs'), {
    ...job,
    status: job.status || 'pending',
    createdAt: job.createdAt || Date.now(),
    updatedAt: Date.now()
  });
  return ref.id;
}

export async function listOpenJobs(){
  const snap = await getDocs(query(collection(db,'jobs'), where('status','in',['pending','active','upcoming'])));
  return snap.docs.map(d=>({id:d.id, ...d.data()}));
}

export async function getJobsByStatus(status: JobStatus): Promise<Job[]> {
  try {
    const q = query(
      collection(db, 'jobs'), 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Job[];
  } catch (error) {
    console.error('Error fetching jobs by status:', error);
    // Return mock data for development
    return getMockJobsByStatus(status);
  }
}

export async function updateJobStatus(jobId: string, status: JobStatus) {
  const ref = doc(db, 'jobs', jobId);
  await updateDoc(ref, {
    status,
    updatedAt: Date.now(),
    ...(status === 'completed' && { completedAt: Date.now() }),
    ...(status === 'active' && { startedAt: Date.now() })
  });
}

export async function assignSelf(jobId: string, uid: string){
  const ref = doc(db, 'jobs', jobId);
  await updateDoc(ref, {
    assignedTo: [uid],
    status: 'active',
    updatedAt: Date.now()
  });
}

// Mock data for development/testing
function getMockJobsByStatus(status: JobStatus): Job[] {
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Kitchen Faucet Repair',
      description: 'Replace leaky kitchen faucet and check water pressure',
      address: '123 Main St, Springfield, IL',
      status: 'active',
      priority: 'high',
      hourlyRate: 65,
      estimatedHours: 2,
      clientId: 'client1',
      createdAt: Date.now() - 86400000,
      scheduledAt: Date.now() + 3600000
    },
    {
      id: '2',
      title: 'Bathroom Tile Installation',
      description: 'Install ceramic tiles in master bathroom',
      address: '456 Oak Ave, Springfield, IL',
      status: 'pending',
      priority: 'medium',
      hourlyRate: 75,
      estimatedHours: 8,
      clientId: 'client2',
      createdAt: Date.now() - 172800000
    },
    {
      id: '3',
      title: 'Deck Staining',
      description: 'Sand and stain wooden deck',
      address: '789 Pine St, Springfield, IL',
      status: 'upcoming',
      priority: 'low',
      hourlyRate: 50,
      estimatedHours: 6,
      clientId: 'client3',
      createdAt: Date.now() - 259200000,
      scheduledAt: Date.now() + 86400000
    },
    {
      id: '4',
      title: 'Garage Door Repair',
      description: 'Fix garage door opener and adjust springs',
      address: '321 Elm St, Springfield, IL',
      status: 'completed',
      priority: 'urgent',
      hourlyRate: 80,
      estimatedHours: 3,
      actualHours: 2.5,
      totalCost: 200,
      clientId: 'client4',
      createdAt: Date.now() - 604800000,
      completedAt: Date.now() - 86400000
    }
  ];

  return mockJobs.filter(job => job.status === status);
}
