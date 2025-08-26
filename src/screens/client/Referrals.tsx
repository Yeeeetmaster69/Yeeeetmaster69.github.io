
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  Card, 
  Surface, 
  Chip,
  Avatar
} from 'react-native-paper';
import { Reference } from '../../utils/types';

export default function Referrals({ navigation }: any) {
  const [references, setReferences] = useState<Reference[]>([]);

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    try {
      // Mock data
      const mockReferences: Reference[] = [
        {
          id: '1',
          businessName: 'Elite Plumbing Solutions',
          contactName: 'Robert Martinez',
          phone: '(555) 123-4567',
          email: 'contact@eliteplumbing.com',
          address: '456 Service St, Springfield, IL 62701',
          description: 'Professional plumbing services with 24/7 emergency support.',
          category: 'Plumbing',
          isActive: true,
          rating: 4.8,
          createdAt: Date.now() - 86400000 * 30
        }
      ];
      setReferences(mockReferences.filter(ref => ref.isActive));
    } catch (error) {
      console.error('Error loading references:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Trusted References
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Professional businesses recommended by our team
        </Text>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recommended Partners ({references.length})
          </Text>
          
          {references.map(reference => (
            <Card key={reference.id} style={styles.referenceCard}>
              <Card.Content>
                <View style={styles.referenceHeader}>
                  <Avatar.Text 
                    size={48} 
                    label={reference.businessName.charAt(0)}
                    style={styles.avatar}
                  />
                  <View style={styles.businessDetails}>
                    <Text variant="titleMedium" style={styles.businessName}>
                      {reference.businessName}
                    </Text>
                    <Text variant="bodyMedium" style={styles.contactName}>
                      Contact: {reference.contactName}
                    </Text>
                    <Chip mode="flat" style={styles.categoryChip}>
                      {reference.category}
                    </Chip>
                  </View>
                </View>

                <Text variant="bodyMedium" style={styles.description}>
                  {reference.description}
                </Text>

                <Text variant="bodySmall" style={styles.contactDetail}>
                  📞 {reference.phone}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
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
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  referenceCard: {
    marginBottom: 16,
    elevation: 2,
  },
  referenceHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: '#2196f3',
    marginRight: 12,
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  contactName: {
    color: '#666',
    marginBottom: 8,
  },
  categoryChip: {
    height: 24,
    backgroundColor: '#e3f2fd',
    alignSelf: 'flex-start',
  },
  description: {
    color: '#666',
    marginBottom: 8,
  },
  contactDetail: {
    color: '#888',
  },
});
