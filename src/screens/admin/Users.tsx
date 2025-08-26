
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, List, RadioButton } from 'react-native-paper';
import { db } from '../../config/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { functionUrl } from '../../config/env';

async function setUserRole(uid:string, role:'admin'|'worker'|'client'){
  // Firestore doc role
  await updateDoc(doc(db,'users',uid), { role });
  // Cloud Function will watch & set custom claims based on this change
  await fetch(functionUrl('setRoleClaim'), {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ uid, role })
  });
}

export default function Users(){
  const [users,setUsers] = useState<any[]>([]);
  const load = async ()=>{
    const snap = await getDocs(collection(db,'users'));
    setUsers(snap.docs.map(d=>({id:d.id, ...d.data()})));
  };
  useEffect(()=>{ load() },[]);
  return (
    <View style={{flex:1}}>
      {users.map(u=>(
        <List.Item key={u.id} title={u.name||u.email} description={u.email}
          right={()=> (
            <RadioButton.Group onValueChange={(v)=>setUserRole(u.id, v as any)} value={u.role||'client'}>
              <View style={{flexDirection:'row', alignItems:'center'}}>
                <RadioButton value="client" /><Button>Client</Button>
                <RadioButton value="worker" /><Button>Worker</Button>
                <RadioButton value="admin" /><Button>Admin</Button>
              </View>
            </RadioButton.Group>
          )}
        />
      ))}
    </View>
  );
}
