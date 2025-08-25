
import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { db } from '../../config/firebase';
import { addDoc, collection } from 'firebase/firestore';

export default function Reviews(){
  const [text,setText] = useState('');
  const submit = async ()=>{
    await addDoc(collection(db,'reviews'), { text, createdAt: Date.now() });
    alert('Thanks for the review!');
    setText('');
  };
  return (
    <View style={{flex:1, padding:16, gap:12}}>
      <Text variant="titleLarge">Leave a Review</Text>
      <TextInput label="Your review" value={text} onChangeText={setText} multiline/>
      <Button mode="contained" onPress={submit}>Submit</Button>
    </View>
  );
}
