
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadPhoto(uid:string, jobId:string, blob:Blob, kind:'before'|'after'){
  const key = `jobs/${jobId}/${uid}/${kind}-${Date.now()}.jpg`;
  const r = ref(storage, key);
  await uploadBytes(r, blob);
  return await getDownloadURL(r);
}
