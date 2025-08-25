
import { db } from '../config/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export async function clockIn(jobId:string, uid:string, lat:number, lng:number){
  const ref = await addDoc(collection(db,'timesheets'), {
    jobId, uid, start: Date.now(), end: null, meters: 0, points: [{lat,lng,ts:Date.now()}]
  });
  return ref.id;
}

export async function clockOut(sheetId:string, lat:number, lng:number, meters:number){
  const ref = doc(db,'timesheets', sheetId);
  await updateDoc(ref,{ end: Date.now(), meters, lastPoint: {lat,lng,ts:Date.now()} });
}
