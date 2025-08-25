
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Surface,
  Card,
  Chip,
  IconButton,
  RadioButton,
  Checkbox,
  Divider
} from 'react-native-paper';
import { db } from '../../config/firebase';
import { addDoc, collection } from 'firebase/firestore';

const SERVICE_CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', icon: '🔧', urgent: true },
  { id: 'electrical', name: 'Electrical', icon: '⚡', urgent: true },
  { id: 'hvac', name: 'HVAC', icon: '❄️', urgent: true },
  { id: 'carpentry', name: 'Carpentry', icon: '🔨', urgent: false },
  { id: 'painting', name: 'Painting', icon: '🎨', urgent: false },
  { id: 'cleaning', name: 'Cleaning', icon: '🧽', urgent: false },
  { id: 'landscaping', name: 'Landscaping', icon: '🌱', urgent: false },
  { id: 'appliance', name: 'Appliance Repair', icon: '🔌', urgent: true },
  { id: 'flooring', name: 'Flooring', icon: '📐', urgent: false },
  { id: 'roofing', name: 'Roofing', icon: '🏠', urgent: true },
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low Priority', description: 'Can wait a week or more', color: '#4caf50' },
  { value: 'medium', label: 'Medium Priority', description: 'Needs attention within 2-3 days', color: '#ff9800' },
  { value: 'high', label: 'High Priority', description: 'Needs attention within 24 hours', color: '#f44336' },
  { value: 'urgent', label: 'Emergency', description: 'Immediate attention required', color: '#d32f2f' },
];

export default function RequestService({ navigation }: any) {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [budget, setBudget] = useState('');
  const [hasImages, setHasImages] = useState(false);
  const [contactMethod, setContactMethod] = useState('phone');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!category || !title || !description || !address) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const serviceRequest = {
        category,
        title,
        description,
        address,
        urgency,
        preferredDate,
        preferredTime,
        budget: budget ? parseFloat(budget) : null,
        hasImages,
        contactMethod,
        additionalNotes,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await addDoc(collection(db, 'serviceRequests'), serviceRequest);
      
      Alert.alert(
        'Request Submitted Successfully!',
        'We\'ve received your service request. Our team will review it and contact you within 2 hours to discuss details and scheduling.',
        [
          {
            text: 'View My Requests',
            onPress: () => navigation.navigate('JobStatus')
          },
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setCategory('');
              setTitle('');
              setDescription('');
              setAddress('');
              setUrgency('medium');
              setPreferredDate('');
              setPreferredTime('');
              setBudget('');
              setHasImages(false);
              setContactMethod('phone');
              setAdditionalNotes('');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Error', 'Failed to submit your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgencyLevel: string) => {
    const level = URGENCY_LEVELS.find(u => u.value === urgencyLevel);
    return level?.color || '#666';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Request Service
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Tell us what you need help with
        </Text>
      </Surface>

      <View style={styles.content}>
        {/* Service Category */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            What type of service do you need? *
          </Text>
          <View style={styles.categoryGrid}>
            {SERVICE_CATEGORIES.map((cat) => (
              <Card 
                key={cat.id} 
                style={[
                  styles.categoryCard,
                  category === cat.id && styles.selectedCategoryCard
                ]} 
                onPress={() => setCategory(cat.id)}
              >
                <Card.Content style={styles.categoryContent}>
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text variant="bodyMedium" style={[
                    styles.categoryName,
                    category === cat.id && styles.selectedCategoryName
                  ]}>
                    {cat.name}
                  </Text>
                  {cat.urgent && (
                    <Chip mode="flat" compact style={styles.urgentChip}>
                      Emergency Available
                    </Chip>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Service Details *
          </Text>
          
          <Card style={styles.formCard}>
            <Card.Content>
              <TextInput
                label="Service Title"
                value={title}
                onChangeText={setTitle}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Kitchen faucet is leaking"
              />
              
              <TextInput
                label="Detailed Description"
                value={description}
                onChangeText={setDescription}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
                placeholder="Please describe the issue, what needs to be done, and any specific requirements..."
              />

              <TextInput
                label="Service Address"
                value={address}
                onChangeText={setAddress}
                mode="outlined"
                style={styles.input}
                placeholder="123 Main Street, City, State, ZIP"
              />
            </Card.Content>
          </Card>
        </View>

        {/* Urgency Level */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            How urgent is this? *
          </Text>
          
          <Card style={styles.formCard}>
            <Card.Content>
              <RadioButton.Group onValueChange={setUrgency} value={urgency}>
                {URGENCY_LEVELS.map((level) => (
                  <View key={level.value} style={styles.urgencyOption}>
                    <View style={styles.urgencyInfo}>
                      <RadioButton.Item 
                        label={level.label} 
                        value={level.value}
                        labelStyle={[styles.urgencyLabel, { color: level.color }]}
                      />
                      <Text variant="bodySmall" style={styles.urgencyDescription}>
                        {level.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </RadioButton.Group>
            </Card.Content>
          </Card>
        </View>

        {/* Scheduling Preferences */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Scheduling Preferences
          </Text>
          
          <Card style={styles.formCard}>
            <Card.Content>
              <View style={styles.schedulingRow}>
                <TextInput
                  label="Preferred Date"
                  value={preferredDate}
                  onChangeText={setPreferredDate}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  placeholder="MM/DD/YYYY"
                />
                
                <TextInput
                  label="Preferred Time"
                  value={preferredTime}
                  onChangeText={setPreferredTime}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  placeholder="Morning/Afternoon"
                />
              </View>
              
              <Text variant="bodySmall" style={styles.schedulingNote}>
                ℹ️ These are preferences only. We'll work with you to find the best time.
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Budget & Additional Options */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Additional Information
          </Text>
          
          <Card style={styles.formCard}>
            <Card.Content>
              <TextInput
                label="Approximate Budget (Optional)"
                value={budget}
                onChangeText={setBudget}
                mode="outlined"
                style={styles.input}
                placeholder="$0 - Leave blank for estimate"
                keyboardType="numeric"
              />

              <Divider style={styles.divider} />

              <Text variant="titleSmall" style={styles.optionsTitle}>
                Contact Method
              </Text>
              <RadioButton.Group onValueChange={setContactMethod} value={contactMethod}>
                <RadioButton.Item label="Phone Call" value="phone" />
                <RadioButton.Item label="Text Message" value="text" />
                <RadioButton.Item label="Email" value="email" />
              </RadioButton.Group>

              <Divider style={styles.divider} />

              <View style={styles.checkboxRow}>
                <Checkbox
                  status={hasImages ? 'checked' : 'unchecked'}
                  onPress={() => setHasImages(!hasImages)}
                />
                <Text variant="bodyMedium" style={styles.checkboxLabel}>
                  I have photos to share that might help
                </Text>
              </View>

              <TextInput
                label="Additional Notes"
                value={additionalNotes}
                onChangeText={setAdditionalNotes}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                placeholder="Any special instructions, access codes, or additional details..."
              />
            </Card.Content>
          </Card>
        </View>

        {/* Submit Section */}
        <View style={styles.section}>
          <Card style={styles.submitCard} elevation={3}>
            <Card.Content>
              <View style={styles.submitInfo}>
                <Text variant="titleMedium" style={styles.submitTitle}>
                  Ready to submit your request?
                </Text>
                <Text variant="bodyMedium" style={styles.submitDescription}>
                  • We'll review your request within 2 hours
                  • You'll receive a call/text to discuss details
                  • We'll provide a free estimate
                  • No obligation to proceed
                </Text>
              </View>
              
              <Button 
                mode="contained" 
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitButton}
                icon="send"
              >
                Submit Service Request
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Emergency Notice */}
        {urgency === 'urgent' && (
          <Card style={styles.emergencyCard}>
            <Card.Content>
              <View style={styles.emergencyContent}>
                <IconButton icon="alert" size={24} iconColor="#f44336" />
                <View style={styles.emergencyText}>
                  <Text variant="titleSmall" style={styles.emergencyTitle}>
                    Emergency Service
                  </Text>
                  <Text variant="bodySmall" style={styles.emergencyDescription}>
                    For immediate emergencies, call our 24/7 hotline: (555) 123-HELP
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'white',
    marginBottom: 8,
  },
  selectedCategoryCard: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  categoryContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedCategoryName: {
    color: '#2196f3',
    fontWeight: '600',
  },
  urgentChip: {
    height: 20,
    backgroundColor: '#ffebee',
  },
  formCard: {
    backgroundColor: 'white',
  },
  input: {
    marginBottom: 16,
  },
  schedulingRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  schedulingNote: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  urgencyOption: {
    marginBottom: 8,
  },
  urgencyInfo: {
    flex: 1,
  },
  urgencyLabel: {
    fontWeight: '600',
  },
  urgencyDescription: {
    color: '#666',
    marginLeft: 56,
    marginTop: -8,
  },
  optionsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
  },
  submitCard: {
    backgroundColor: 'white',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  submitInfo: {
    marginBottom: 16,
  },
  submitTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  submitDescription: {
    color: '#666',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#4caf50',
    marginBottom: 12,
  },
  cancelButton: {
    borderColor: '#666',
  },
  emergencyCard: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    marginTop: 16,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyText: {
    flex: 1,
    marginLeft: 8,
  },
  emergencyTitle: {
    fontWeight: '600',
    color: '#f44336',
  },
  emergencyDescription: {
    color: '#666',
    marginTop: 2,
  },
});
