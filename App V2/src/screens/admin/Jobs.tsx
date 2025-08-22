
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, List } from 'react-native-paper';
import { createJob } from '../../services/jobs';
import { upsertCustomer, createEstimate, createAndSendInvoice } from '../../services/square';
import { getPricing } from '../../services/pricing';

export default function AdminJobs(){
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [address,setAddress] = useState('');
  const [items,setItems] = useState<any[]>([]);
  const [clientEmail,setClientEmail] = useState('');
  const [clientName,setClientName] = useState('');
  const [clientPhone,setClientPhone] = useState('');
  const [busy,setBusy] = useState(false);

  const [list,setList] = useState<any[]>([]);

  React.useEffect(()=>{
    getPricing().then(p=>{
      setItems(p.priceList || []);
    });
  },[]);

  const add = async ()=>{
    const id = await createJob({ title, description, address, priceType:'hourly', hourlyRate: 50 });
    const job = {id, title, description, address};
    setList([job, ...list]);
    setTitle(''); setDescription(''); setAddress('');
  };

  const toLineItems = ()=>{
    // Use first matching price or fallback to hourly estimate
    if (items && items.length > 0){
      // basic approach: first item named by title or just first item
      const match = items.find((i:any)=> (i.name||'').toLowerCase() in { [(title||'').toLowerCase()]: true });
      const base = match || items[0];
      const price = Number(base.price||base.amount||base.cost||0);
      const cents = Math.max(0, Math.round(price*100));
      return [{ name: title || base.name || 'Service', quantity: '1', amountCents: cents }];
    }
    // default $100
    return [{ name: title || 'Service', quantity: '1', amountCents: 10000 }];
  };

  const makeEstimate = async (job:any)=>{
    setBusy(true);
    try{
      const [givenName,...rest] = (clientName||'').split(' ');
      const familyName = rest.join(' ');
      const cu = await upsertCustomer({ email: clientEmail, givenName, familyName, phone: clientPhone });
      const items = toLineItems();
      const { invoice } = await createEstimate({ customerId: cu.customer.id, items, memo: job.title, jobId: job.id });
      alert('Draft estimate created & linked to job.');
    }catch(e:any){ alert(e.message) } finally{ setBusy(false) }
  };

  const makeInvoice = async (job:any)=>{
    setBusy(true);
    try{
      const [givenName,...rest] = (clientName||'').split(' ');
      const familyName = rest.join(' ');
      const cu = await upsertCustomer({ email: clientEmail, givenName, familyName, phone: clientPhone });
      const items = toLineItems();
      const { invoice } = await createAndSendInvoice({ customerId: cu.customer.id, items, memo: job.title, jobId: job.id });
      alert('Invoice created & sent (Square).');
    }catch(e:any){ alert(e.message) } finally{ setBusy(false) }
  };

  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <TextInput label="Title" value={title} onChangeText={setTitle} />
      <TextInput label="Description" value={description} onChangeText={setDescription} />
      <TextInput label="Address" value={address} onChangeText={setAddress} />
      <Button mode="contained" onPress={add}>Create Job</Button>

      <TextInput label="Client Email (for estimate/invoice)" value={clientEmail} onChangeText={setClientEmail} autoCapitalize='none' />
      <TextInput label="Client Name" value={clientName} onChangeText={setClientName} />
      <TextInput label="Client Phone" value={clientPhone} onChangeText={setClientPhone} />

      {list.map(j=>(
        <List.Item key={j.id} title={j.title} description={j.description}
          right={()=> (
            <View style={{flexDirection:'row'}}>
              <Button compact onPress={()=>makeEstimate(j)} loading={busy}>Estimate</Button>
              <Button compact onPress={()=>makeInvoice(j)} loading={busy}>Invoice</Button>
            </View>
          )}
        />
      ))}
    </View>
  );
}
