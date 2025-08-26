
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { upsertCustomer, createEstimate, publishInvoice } from '../../services/square';

type Item = { name:string; quantity:string; amountCents:number };

export default function Estimates(){
  const [email,setEmail] = useState('');
  const [name,setName] = useState('');
  const [phone,setPhone] = useState('');
  const [itemsJson,setItemsJson] = useState('[{"name":"Service","quantity":"1","amountCents":15000}]');
  const [memo,setMemo] = useState('');
  const [draftId,setDraftId] = useState<string|undefined>(undefined);
  const [draftVersion,setDraftVersion] = useState<number|undefined>(undefined);
  const [busy,setBusy] = useState(false);

  const makeEstimate = async ()=>{
    setBusy(true);
    try{
      const [givenName,...rest] = name.split(' ');
      const familyName = rest.join(' ');
      const cu = await upsertCustomer({ email, givenName, familyName, phone });
      const customerId = cu.customer.id;
      const items: Item[] = JSON.parse(itemsJson);
      const { invoice } = await createEstimate({ customerId, items, memo });
      setDraftId(invoice.id);
      setDraftVersion(Number(invoice.version));
      alert('Draft estimate created.');
    }catch(e:any){ alert(e.message) } finally{ setBusy(false) }
  };

  const send = async ()=>{
    if (!draftId || !draftVersion) return;
    setBusy(true);
    try{
      await publishInvoice({ invoiceId: draftId, version: draftVersion });
      alert('Estimate sent (published).');
      setDraftId(undefined); setDraftVersion(undefined);
    }catch(e:any){ alert(e.message) } finally{ setBusy(false) }
  };

  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text variant="headlineSmall">Square Estimate (Draft Invoice)</Text>
      <TextInput label="Customer Email" value={email} onChangeText={setEmail} autoCapitalize='none' />
      <TextInput label="Customer Name" value={name} onChangeText={setName} />
      <TextInput label="Phone" value={phone} onChangeText={setPhone} keyboardType='phone-pad' />
      <TextInput label="Line Items (JSON)" value={itemsJson} onChangeText={setItemsJson} multiline style={{height:140}} />
      <TextInput label="Memo" value={memo} onChangeText={setMemo} />
      <Button mode="contained" onPress={makeEstimate} loading={busy}>Create Draft</Button>
      <Button mode="contained" onPress={send} disabled={!draftId} loading={busy}>Publish / Send</Button>
    </View>
  );
}
