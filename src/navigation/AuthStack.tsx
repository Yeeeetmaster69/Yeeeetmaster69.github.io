
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/auth/LoginScreen';
import Signup from '../screens/auth/SignupScreen';
import RoleSelect from '../screens/auth/RoleSelectScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack(){
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="RoleSelect" component={RoleSelect} />
    </Stack.Navigator>
  )
}
