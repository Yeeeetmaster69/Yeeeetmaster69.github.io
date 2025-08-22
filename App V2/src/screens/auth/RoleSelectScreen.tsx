
import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function RoleSelect(){
  return (
    <View style={{flex:1, alignItems:'center', justifyContent:'center', gap:12, padding:16}}>
      <Text>Account created! An admin can grant you worker/admin access. You're a client by default.</Text>
      <Button mode="contained" onPress={()=>{}}>OK</Button>
    </View>
  )
}
