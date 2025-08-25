import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';

type UserRole = 'client' | 'worker' | 'admin';

interface User {
  username: string;
  role: UserRole;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Mock users for demo
  const mockUsers = [
    { username: 'admin', password: 'admin123', role: 'admin' as UserRole },
    { username: 'worker', password: 'worker123', role: 'worker' as UserRole },
    { username: 'client', password: 'client123', role: 'client' as UserRole },
  ];

  const handleLogin = () => {
    const user = mockUsers.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser({ username: user.username, role: user.role });
      setIsLoggedIn(true);
      Alert.alert('Success', `Welcome ${user.username}! Role: ${user.role}`);
    } else {
      Alert.alert('Error', 'Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
  };

  const renderDashboard = () => {
    if (!currentUser) return null;

    const features = {
      admin: [
        'Manage Users',
        'View All Jobs',
        'Generate Reports',
        'System Settings',
        'User Role Management'
      ],
      worker: [
        'View My Jobs',
        'Clock In/Out',
        'GPS Tracking',
        'Upload Photos',
        'Time Tracking'
      ],
      client: [
        'Request Service',
        'View My Requests',
        'Make Payment',
        'Rate Workers',
        'View Estimates'
      ]
    };

    return (
      <ScrollView style={styles.dashboard}>
        <Text style={styles.welcomeText}>Welcome, {currentUser.username}!</Text>
        <Text style={styles.roleText}>Role: {currentUser.role.toUpperCase()}</Text>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Available Features:</Text>
          {features[currentUser.role].map((feature, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.featureButton}
              onPress={() => Alert.alert('Feature', `${feature} - Coming soon in full version!`)}
            >
              <Text style={styles.featureText}>{feature}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderLogin = () => (
    <View style={styles.loginContainer}>
      <Text style={styles.title}>Handyman Pro</Text>
      <Text style={styles.subtitle}>Professional Service Management</Text>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.demoCredentials}>
        <Text style={styles.demoTitle}>Demo Credentials:</Text>
        <Text style={styles.demoText}>Admin: admin / admin123</Text>
        <Text style={styles.demoText}>Worker: worker / worker123</Text>
        <Text style={styles.demoText}>Client: client / client123</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoggedIn ? renderDashboard() : renderLogin()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 300,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoCredentials: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  demoTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  demoText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 5,
  },
  dashboard: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  roleText: {
    fontSize: 18,
    color: '#3B82F6',
    marginBottom: 30,
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  featureButton: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  featureText: {
    color: '#ffffff',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
