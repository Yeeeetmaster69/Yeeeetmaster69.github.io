
import React, { useEffect, useState } from 'react';
import { View, Linking, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

type Opts = { venmo?:string; cashTag?:string; zelle?:string; currency?:string };

export default function PaymentOptions({ route }:any){
  const { amountCents = 0, memo = 'Payment', invoiceUrl } = route.params || {};
  const [opts,setOpts] = useState<Opts>({});

  useEffect(()=>{
    (async()=>{
      const snap = await getDoc(doc(db,'config','payments'));
      setOpts(snap.exists() ? (snap.data() as any) : {});
    })();
  },[]);

  const openVenmo = ()=>{
    if (!opts.venmo) return alert('Venmo not configured');
    const amount = (amountCents/100).toFixed(2);
    const url = `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(opts.venmo!)}&amount=${encodeURIComponent(amount)}&note=${encodeURIComponent(memo)}`;
    Linking.openURL(url).catch(()=> alert('Venmo app not found'));
  };

  const openCashApp = ()=>{
    if (!opts.cashTag) return alert('Cash App not configured');
    const amount = (amountCents/100).toFixed(2);
    const url = `https://cash.app/$${opts.cashTag}/${amount}`;
    Linking.openURL(url);
  };

  const openZelle = ()=>{
    if (!opts.zelle) return alert('Zelle not configured');
    alert(`Pay with Zelle to: ${opts.zelle}. Amount: ${(amountCents/100).toFixed(2)} ${opts.currency||'USD'}`);
  };

  const openSquare = ()=>{
    if (!invoiceUrl) return alert('Square invoice not provided');
    Linking.openURL(invoiceUrl);
  };

  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text variant="titleLarge">Choose Your Payment Method</Text>
      {invoiceUrl ? <Button mode="contained" onPress={openSquare}>Pay by Card (Square)</Button> : null}
      <Button mode="contained" onPress={openVenmo}>Venmo</Button>
      <Button mode="contained" onPress={openCashApp}>Cash App</Button>
      <Button mode="contained" onPress={openZelle}>Zelle</Button>
      <Button mode="outlined" onPress={()=>alert('Cash: Please pay in person.')}>Cash</Button>
      <Text>Amount: ${(amountCents/100).toFixed(2)} {opts.currency || 'USD'}</Text>
    </View>
  );
}
