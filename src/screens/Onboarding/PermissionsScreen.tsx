import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, Button, Surface, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingStack';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../../context/AuthContext';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Permissions'>;

const { width } = Dimensions.get('window');

interface Permission {
  name: string;
  description: string;
  icon: string;
  required: boolean;
  granted: boolean;
  requestFunction: () => Promise<boolean>;
}

export default function PermissionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializePermissions();
  }, []);

  const initializePermissions = async () => {
    const permissionList: Permission[] = [
      {
        name: 'Location',
        description: 'Required for GPS tracking and job proximity features',
        icon: '📍',
        required: true,
        granted: false,
        requestFunction: requestLocationPermission,
      },
      {
        name: 'Notifications',
        description: 'Stay updated on job status, messages, and important alerts',
        icon: '🔔',
        required: true,
        granted: false,
        requestFunction: requestNotificationPermission,
      },
      {
        name: 'Camera',
        description: 'Take photos for job documentation and profile pictures',
        icon: '📸',
        required: false,
        granted: false,
        requestFunction: requestCameraPermission,
      },
    ];

    // Check current permission status
    const updatedPermissions = await Promise.all(
      permissionList.map(async (permission) => {
        let granted = false;
        
        switch (permission.name) {
          case 'Location': {
            const locationStatus = await Location.getForegroundPermissionsAsync();
            granted = locationStatus.granted;
            break;
          }
          case 'Notifications': {
            const notificationStatus = await Notifications.getPermissionsAsync();
            granted = notificationStatus.granted;
            break;
          }
          case 'Camera': {
            // Camera permission will be requested when needed
            granted = true; // Assume granted for now
            break;
          }
        }
        
        return { ...permission, granted };
      })
    );

    setPermissions(updatedPermissions);
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // For workers, also request background location
        if (user?.role === 'worker') {
          await Location.requestBackgroundPermissionsAsync();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    // Camera permission is handled by expo-image-picker when needed
    return true;
  };

  const requestPermission = async (index: number) => {
    const permission = permissions[index];
    setLoading(true);
    
    try {
      const granted = await permission.requestFunction();
      const updatedPermissions = [...permissions];
      updatedPermissions[index] = { ...permission, granted };
      setPermissions(updatedPermissions);
    } catch (error) {
      console.error(`Error requesting ${permission.name} permission:`, error);
    } finally {
      setLoading(false);
    }
  };

  const canContinue = () => {
    return permissions
      .filter(p => p.required)
      .every(p => p.granted);
  };

  const handleContinue = () => {
    navigation.navigate('FeaturesOverview', { role: user?.role || 'client' });
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.content} elevation={2}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Permissions Setup
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Grant permissions to unlock all features
          </Text>
        </View>

        <View style={styles.permissionsContainer}>
          {permissions.map((permission, index) => (
            <Card key={permission.name} style={styles.permissionCard}>
              <Card.Content style={styles.permissionContent}>
                <View style={styles.permissionHeader}>
                  <Text style={styles.permissionIcon}>{permission.icon}</Text>
                  <View style={styles.permissionInfo}>
                    <View style={styles.permissionTitleRow}>
                      <Text variant="titleMedium" style={styles.permissionTitle}>
                        {permission.name}
                      </Text>
                      {permission.required && (
                        <Text style={styles.requiredBadge}>Required</Text>
                      )}
                    </View>
                    <Text variant="bodySmall" style={styles.permissionDescription}>
                      {permission.description}
                    </Text>
                  </View>
                </View>
                
                <Button
                  mode={permission.granted ? "outlined" : "contained"}
                  onPress={() => requestPermission(index)}
                  disabled={permission.granted || loading}
                  style={styles.permissionButton}
                  icon={permission.granted ? "check" : undefined}
                >
                  {permission.granted ? "Granted" : "Grant Permission"}
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleContinue}
            style={styles.button}
            contentStyle={styles.buttonContent}
            disabled={!canContinue()}
          >
            {canContinue() ? "Continue" : "Grant required permissions to continue"}
          </Button>
          
          {!canContinue() && (
            <Text variant="bodySmall" style={styles.warning}>
              Location and notification permissions are required for the app to function properly.
            </Text>
          )}
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
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  permissionsContainer: {
    marginBottom: 32,
  },
  permissionCard: {
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  permissionContent: {
    padding: 16,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  permissionIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 4,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  permissionTitle: {
    fontWeight: 'bold',
  },
  requiredBadge: {
    fontSize: 12,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  permissionDescription: {
    color: '#666',
    lineHeight: 16,
  },
  permissionButton: {
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  warning: {
    textAlign: 'center',
    color: '#d32f2f',
    fontSize: 12,
  },
});