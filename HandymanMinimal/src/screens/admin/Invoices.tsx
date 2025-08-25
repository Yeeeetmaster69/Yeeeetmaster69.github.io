
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { upsertCustomer, createAndSendInvoice, createPaymentLink } from '../../services/square';

type Item = { name:string; quantity:string; amountCents:number };

export default function Invoices(){
  const [email,setEmail] = useState('');
  const [name,setName] = useState('');
  const [phone,setPhone] = useState('');
  const [itemsJson,setItemsJson] = useState('[{"name":"Service","quantity":"1","amountCents":15000}]');
  const [memo,setMemo] = useState('');
  const [dueDate,setDueDate] = useState(''); // YYYY-MM-DD
  const [busy,setBusy] = useState(false);

  const send = async ()=>{
    setBusy(true);
    try{
      const [givenName,...rest] = name.split(' ');
      const familyName = rest.join(' ');
      const cu = await upsertCustomer({ email, givenName, familyName, phone });
      const customerId = cu.customer.id;
      const items: Item[] = JSON.parse(itemsJson);
      const { invoice } = await createAndSendInvoice({ customerId, items, memo, dueDate: dueDate || undefined });
      alert('Invoice sent: ' + invoice.publicUrl);
    }catch(e:any){ alert(e.message) } finally{ setBusy(false) }
  };

  const link = async ()=>{
    setBusy(true);
    try{
      const items: Item[] = JSON.parse(itemsJson);
      const total = items.reduce((s,i)=> s + (i.amountCents * Number(i.quantity||'1')), 0);
      const r = await createPaymentLink({ name: memo || 'Payment', amountCents: total });
      alert('Payment link: ' + r.url);
    }catch(e:any){ alert(e.message) } finally{ setBusy(false) }
  };

  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text variant="headlineSmall">Square Invoices</Text>
      <TextInput label="Customer Email" value={email} onChangeText={setEmail} autoCapitalize='none' />
      <TextInput label="Customer Name" value={name} onChangeText={setName} />
      <TextInput label="Phone" value={phone} onChangeText={setPhone} keyboardType='phone-pad' />
      <TextInput label="Line Items (JSON)" value={itemsJson} onChangeText={setItemsJson} multiline style={{height:140}} />
      <TextInput label="Memo / Title" value={memo} onChangeText={setMemo} />
      <TextInput label="Due Date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} />
      <Button mode="contained" onPress={send} loading={busy}>Create & Send Invoice</Button>
      <Button mode="outlined" onPress={link} loading={busy}>Generate Checkout Link</Button>
    </View>
  );
}
