// Safety & Compliance: Incident Reporting Screen
// Placeholder implementation for worker/client incident reporting

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  Paragraph,
  RadioButton,
  HelperText,
  FAB,
  Chip
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import EmergencyService from '../../services/emergency';
import { FormValidator, useFormValidation } from '../../utils/validation';

interface IncidentFormData {
  type: 'injury' | 'property_damage' | 'near_miss' | 'safety_violation' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  immediateActions: string;
  location: string;
}

export default function IncidentReportScreen() {
  const [formData, setFormData] = useState<IncidentFormData>({
    type: 'other',
    severity: 'low',
    title: '',
    description: '',
    immediateActions: '',
    location: ''
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showValidationErrors } = useFormValidation();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate form data
      const validation = FormValidator.validateIncidentReport(formData);
      if (!validation.isValid) {
        showValidationErrors(validation.errors, Alert.alert);
        return;
      }

      // Get current location
      let currentLocation = '';
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const geocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          if (geocode.length > 0) {
            const addr = geocode[0];
            currentLocation = `${addr.street || ''} ${addr.city || ''} ${addr.region || ''}`.trim();
          }
        }
      } catch (locationError) {
        console.warn('Could not get location:', locationError);
      }

      // Sanitize form data
      const sanitizedFormData = {
        type: formData.type,
        severity: formData.severity,
        title: FormValidator.sanitizeText(formData.title),
        description: FormValidator.sanitizeText(formData.description),
        immediateActions: FormValidator.sanitizeText(formData.immediateActions),
        location: FormValidator.sanitizeText(formData.location) || currentLocation || 'Location not available'
      };

      // Create incident data
      const incidentData = {
        ...sanitizedFormData,
        photos,
        timestamp: Date.now(),
        status: 'open',
        reporterId: 'current-user-id', // TODO: Get from auth context
        autoLocation: currentLocation
      };

      // TODO: Save to Firestore
      console.log('Submitting incident:', incidentData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Incident report submitted successfully', [
        { text: 'OK', onPress: () => {
          // Reset form
          setFormData({
            type: 'other',
            severity: 'low',
            title: '',
            description: '',
            immediateActions: '',
            location: ''
          });
          setPhotos([]);
        }}
      ]);
      
    } catch (error) {
      console.error('Error submitting incident:', error);
      Alert.alert('Error', 'Failed to submit incident report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async () => {
    try {
      // Check permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera roll permission is needed to add photos');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => asset.uri);
        const totalPhotos = photos.length + newPhotos.length;
        
        if (totalPhotos > 10) {
          Alert.alert('Too Many Photos', 'Maximum 10 photos allowed per incident');
          return;
        }
        
        setPhotos([...photos, ...newPhotos]);
      }
    } catch (error) {
      console.error('Error picking photos:', error);
      Alert.alert('Error', 'Failed to select photos');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Report Safety Incident</Title>
          <Paragraph>
            Report any safety incidents, injuries, or concerns. All reports are confidential 
            and will be reviewed by management.
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Incident Type</Title>
          <RadioButton.Group 
            onValueChange={(value) => setFormData({...formData, type: value as any})}
            value={formData.type}
          >
            <RadioButton.Item label="Injury" value="injury" />
            <RadioButton.Item label="Property Damage" value="property_damage" />
            <RadioButton.Item label="Near Miss" value="near_miss" />
            <RadioButton.Item label="Safety Violation" value="safety_violation" />
            <RadioButton.Item label="Other" value="other" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Severity Level</Title>
          <RadioButton.Group 
            onValueChange={(value) => setFormData({...formData, severity: value as any})}
            value={formData.severity}
          >
            <RadioButton.Item label="Low - Minor issue" value="low" />
            <RadioButton.Item label="Medium - Moderate concern" value="medium" />
            <RadioButton.Item label="High - Serious issue" value="high" />
            <RadioButton.Item label="Critical - Immediate attention" value="critical" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Incident Title"
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
            mode="outlined"
            style={styles.input}
          />
          
          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <TextInput
            label="Location"
            value={formData.location}
            onChangeText={(text) => setFormData({...formData, location: text})}
            mode="outlined"
            style={styles.input}
            placeholder="Address or description of where incident occurred"
          />

          <TextInput
            label="Immediate Actions Taken"
            value={formData.immediateActions}
            onChangeText={(text) => setFormData({...formData, immediateActions: text})}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="What was done immediately after the incident?"
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Photos</Title>
          <Paragraph>Add photos to document the incident (optional)</Paragraph>
          <Button 
            mode="outlined" 
            onPress={handlePhotoUpload}
            style={styles.photoButton}
          >
            Add Photos ({photos.length}/10)
          </Button>
          
          {/* Display selected photos */}
          {photos.length > 0 && (
            <View style={styles.photoContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <Chip
                    icon="image"
                    onClose={() => {
                      const newPhotos = [...photos];
                      newPhotos.splice(index, 1);
                      setPhotos(newPhotos);
                    }}
                    style={styles.photoChip}
                  >
                    Photo {index + 1}
                  </Chip>
                </View>
              ))}
            </View>
          )}
          
          <HelperText type="info">
            Photos are automatically uploaded securely and can help with investigation.
          </HelperText>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={!formData.title || !formData.description}
        style={styles.submitButton}
      >
        Submit Incident Report
      </Button>

      {/* Emergency SOS Button - Always Accessible */}
      <FAB
        style={styles.sosButton}
        icon="phone"
        label="Emergency SOS"
        onPress={async () => {
          Alert.alert(
            'Emergency SOS',
            'This will immediately notify your emergency contacts and begin escalation procedures. Only use in real emergencies.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Activate SOS', 
                style: 'destructive',
                onPress: async () => {
                  try {
                    await EmergencyService.activateSOS('current-user-id', 'worker'); // TODO: Get from auth context
                    Alert.alert('SOS Activated', 'Emergency contacts have been notified');
                  } catch (error) {
                    console.error('SOS activation failed:', error);
                    Alert.alert('Error', 'Failed to activate SOS. Please call emergency services directly.');
                  }
                }
              }
            ]
          );
        }}
        color="#ff0000"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  photoButton: {
    marginVertical: 8,
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  photoWrapper: {
    margin: 4,
  },
  photoChip: {
    backgroundColor: '#e3f2fd',
  },
  submitButton: {
    margin: 16,
    paddingVertical: 8,
  },
  sosButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#ff0000',
  },
});