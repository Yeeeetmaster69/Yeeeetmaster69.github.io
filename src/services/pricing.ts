
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function getPricing(){
  const r = await getDoc(doc(db,'config','pricing'));
  return r.exists() ? r.data() : { hourlyRate: 50, priceList: [] };
}

export async function setPricing(data:any){
  await setDoc(doc(db,'config','pricing'), data, { merge: true });
}
