import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth } from '../config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserRole } from '../services/userService';

// Screens
import AuthScreen from '../screens/AuthScreen';
import ClientNavigator from './ClientNavigator';
import WorkerNavigator from './WorkerNavigator';
import AdminNavigator from './AdminNavigator';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          setUserRole(role);
        } catch (error) {
          console.error('Error getting user role:', error);
          setUserRole('client'); // Default to client role
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    );
  }

  // Role-based navigation
  const getNavigatorForRole = () => {
    switch (userRole) {
      case 'admin':
        return <AdminNavigator />;
      case 'worker':
        return <WorkerNavigator />;
      case 'client':
      default:
        return <ClientNavigator />;
    }
  };

  return getNavigatorForRole();
}