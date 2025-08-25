
import React from 'react';
import { View } from 'react-native';
import useAuth from '../hooks/useAuth';

export default function RoleGate({ allow, children }:{allow: ('admin'|'worker'|'client')[], children: any}){
  const { claims } = useAuth();
  if (!claims.role || !allow.includes(claims.role)) return <View />;
  return children;
}
