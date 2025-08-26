// Safety & Compliance: Incident Reporting Screen
// Placeholder implementation for worker/client incident reporting

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Title, 
  Paragraph,
  RadioButton,
  HelperText,
  FAB
} from 'react-native-paper';

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement incident submission to Firestore
      // 1. Upload photos to Firebase Storage
      // 2. Create incident document with auto-generated location
      // 3. Send notifications based on severity
      // 4. Create job event if incident is job-related
      console.log('Submitting incident:', formData);
    } catch (error) {
      console.error('Error submitting incident:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = () => {
    // TODO: Implement photo picker and upload
    // - Use react-native-image-picker
    // - Compress images before upload
    // - Support multiple photos (up to 10)
    // - Show upload progress
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
        onPress={() => {
          // TODO: Implement SOS functionality
          // 1. Get current location
          // 2. Create SOS event in database
          // 3. Send immediate notifications
          // 4. Start escalation timer
          console.log('SOS activated');
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