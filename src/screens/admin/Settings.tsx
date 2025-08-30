
import React from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useThemeConfig } from '../../context/ThemeContext';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Settings(){
  const { themeConfig, setThemeConfig } = useThemeConfig();
  const [p,setP] = React.useState(themeConfig.primary);
  const [a,setA] = React.useState(themeConfig.accent);

  const [venmo,setVenmo] = React.useState('');
  const [cashTag,setCashTag] = React.useState('');
  const [zelle,setZelle] = React.useState(''); // email or phone

  React.useEffect(()=>{
    (async()=>{
      const snap = await getDoc(doc(db,'config','payments'));
      if (snap.exists()){
        const d = snap.data();
        setVenmo(d.venmo||'');
        setCashTag(d.cashTag||'');
        setZelle(d.zelle||'');
      }
    })();
  },[]);

  const saveTheme = ()=> setThemeConfig({...themeConfig, primary:p, accent:a});
  const savePay = async ()=>{
    await setDoc(doc(db,'config','payments'), { venmo, cashTag, zelle, currency: 'USD' }, { merge: true });
    alert('Saved payment handles');
  };

  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text variant="titleMedium">Theme</Text>
      <TextInput label="Primary Color" value={p} onChangeText={setP} />
      <TextInput label="Accent Color" value={a} onChangeText={setA} />
      <Button mode="contained" onPress={saveTheme}>Apply</Button>

      <Text variant="titleMedium" style={{marginTop:16}}>Client Payment Methods</Text>
      <TextInput label="Venmo Username (without @)" value={venmo} onChangeText={setVenmo} />
      <TextInput label="Cash App $cashtag (without $)" value={cashTag} onChangeText={setCashTag} />
      <TextInput label="Zelle Email or Phone" value={zelle} onChangeText={setZelle} />
      <Button mode="contained" onPress={savePay}>Save Payment Options</Button>
    </View>
  );
}
