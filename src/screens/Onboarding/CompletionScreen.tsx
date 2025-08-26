import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function CompletionScreen() {
  const { setOnboardingComplete } = useAuth();

  const handleComplete = async () => {
    await setOnboardingComplete(true);
    // Navigation will be handled automatically by RoleBasedNavigator
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.content} elevation={2}>
        <View style={styles.centerContent}>
          <Text style={styles.successIcon}>🎉</Text>
          
          <Text variant="headlineMedium" style={styles.title}>
            Welcome to Handyman Pro!
          </Text>
          
          <Text variant="bodyLarge" style={styles.subtitle}>
            You're all set up and ready to go
          </Text>
          
          <View style={styles.completedItems}>
            <View style={styles.completedItem}>
              <Text style={styles.checkIcon}>✅</Text>
              <Text variant="bodyMedium">Account created</Text>
            </View>
            
            <View style={styles.completedItem}>
              <Text style={styles.checkIcon}>✅</Text>
              <Text variant="bodyMedium">Role selected</Text>
            </View>
            
            <View style={styles.completedItem}>
              <Text style={styles.checkIcon}>✅</Text>
              <Text variant="bodyMedium">Permissions granted</Text>
            </View>
            
            <View style={styles.completedItem}>
              <Text style={styles.checkIcon}>✅</Text>
              <Text variant="bodyMedium">Features overview complete</Text>
            </View>
          </View>
          
          <Text variant="bodyMedium" style={styles.description}>
            Start exploring the app and discover all the features designed to make your handyman experience seamless and efficient.
          </Text>
          
          <Button 
            mode="contained" 
            onPress={handleComplete}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="arrow-right"
          >
            Enter Handyman Pro
          </Button>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: width * 0.9,
    maxWidth: 400,
    padding: 32,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  centerContent: {
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  completedItems: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  completedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  checkIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  description: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});