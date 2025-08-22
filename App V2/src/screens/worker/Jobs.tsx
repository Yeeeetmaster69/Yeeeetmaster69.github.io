
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, List } from 'react-native-paper';
import { listOpenJobs, assignSelf } from '../../services/jobs';
import { auth } from '../../config/firebase';

export default function Jobs({ navigation }:any){
  const [jobs,setJobs] = useState<any[]>([]);
  useEffect(()=>{ listOpenJobs().then(setJobs) },[]);
  return (
    <View style={{flex:1}}>
      {jobs.map((j:any)=>(
        <List.Item key={j.id} title={j.title} description={j.description}
          right={()=> <Button onPress={()=>assignSelf(j.id, auth.currentUser!.uid)}>Assign me</Button>}
          onPress={()=>navigation.navigate('JobDetail',{job:j})}
        />
      ))}
    </View>
  );
}
