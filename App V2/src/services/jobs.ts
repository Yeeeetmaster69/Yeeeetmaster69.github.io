
import { db } from '../config/firebase';
import { collection, addDoc, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { Job } from '../utils/types';

export async function createJob(job: Job){
  const ref = await addDoc(collection(db, 'jobs'), {
    ...job,
    status: 'new',
    createdAt: Date.now()
  });
  return ref.id;
}

export async function listOpenJobs(){
  const snap = await getDocs(query(collection(db,'jobs'), where('status','in',['new','scheduled'])));
  return snap.docs.map(d=>({id:d.id, ...d.data()}));
}

export async function assignSelf(jobId: string, uid: string){
  const ref = doc(db, 'jobs', jobId);
  await updateDoc(ref, {
    assignedTo: [uid],
    status: 'scheduled'
  });
}
