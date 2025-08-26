import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Surface, 
  IconButton,
  Chip,
  Avatar,
  Divider
} from 'react-native-paper';
import { Reference } from '../../utils/types';

export default function AdminReferences({ navigation }: any) {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from Firebase
      const mockReferences: Reference[] = [
        {
          id: '1',
          businessName: 'Elite Plumbing Solutions',
          contactName: 'Robert Martinez',
          phone: '(555) 123-4567',
          email: 'contact@eliteplumbing.com',
          address: '456 Service St, Springfield, IL 62701',
          website: 'www.eliteplumbing.com',
          description: 'Professional plumbing services with 24/7 emergency support. Specializes in residential and commercial installations.',
          category: 'Plumbing',
          isActive: true,
          rating: 4.8,
          notes: 'Trusted partner for complex plumbing jobs',
          createdAt: Date.now() - 86400000 * 30
        },
        {
          id: '2',
          businessName: 'Premier Electrical Services',
          contactName: 'Sarah Johnson',
          phone: '(555) 234-5678',
          email: 'info@premierelectrical.com',
          address: '789 Electric Ave, Springfield, IL 62702',
          website: 'www.premierelectrical.com',
          description: 'Licensed electricians providing safe and reliable electrical solutions for homes and businesses.',
          category: 'Electrical',
          isActive: true,
          rating: 4.9,
          notes: 'Excellent for electrical installations and repairs',
          createdAt: Date.now() - 86400000 * 45
        },
        {
          id: '3',
          businessName: 'Green Thumb Landscaping',
          contactName: 'Michael Chen',
          phone: '(555) 345-6789',
          email: 'mike@greenthumb.com',
          address: '321 Garden Rd, Springfield, IL 62703',
          description: 'Full-service landscaping company specializing in design, installation, and maintenance.',
          category: 'Landscaping',
          isActive: false,
          rating: 4.5,
          notes: 'Seasonal partner for outdoor projects',
          createdAt: Date.now() - 86400000 * 60
        }
      ];
      setReferences(mockReferences);
    } catch (error) {
      console.error('Error loading references:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReferenceStatus = async (referenceId: string, isActive: boolean) => {
    try {
      setReferences(prev => 
        prev.map(ref => 
          ref.id === referenceId ? { ...ref, isActive } : ref
        )
      );
      // TODO: Update in Firebase
    } catch (error) {
      console.error('Error updating reference status:', error);
    }
  };

  const handleCall = (phone: string) => {
    // TODO: Implement phone call functionality
    console.log('Calling:', phone);
  };

  const handleEmail = (email: string) => {
    // TODO: Implement email functionality
    console.log('Emailing:', email);
  };

  const handleWebsite = (website?: string) => {
    if (website) {
      // TODO: Open website in browser
      console.log('Opening website:', website);
    }
  };

  const renderReferenceCard = (reference: Reference) => (
    <Card key={reference.id} style={styles.referenceCard}>
      <Card.Content>
        <View style={styles.referenceHeader}>
          <View style={styles.businessInfo}>
            <Avatar.Text 
              size={48} 
              label={reference.businessName.charAt(0)}
              style={[styles.avatar, { backgroundColor: reference.isActive ? '#4caf50' : '#f44336' }]}
            />
            <View style={styles.businessDetails}>
              <Text variant="titleMedium" style={styles.businessName}>
                {reference.businessName}
              </Text>
              <Text variant="bodyMedium" style={styles.contactName}>
                Contact: {reference.contactName}
              </Text>
              <View style={styles.badges}>
                <Chip 
                  mode="flat" 
                  style={[styles.categoryChip, { backgroundColor: '#e3f2fd' }]}
                  textStyle={{ color: '#1976d2' }}
                >
                  {reference.category}
                </Chip>
                <Chip 
                  mode="flat" 
                  style={[
                    styles.statusChip, 
                    { backgroundColor: reference.isActive ? '#e8f5e8' : '#ffebee' }
                  ]}
                  textStyle={{ color: reference.isActive ? '#2e7d32' : '#c62828' }}
                >
                  {reference.isActive ? 'Active' : 'Inactive'}
                </Chip>
                {reference.rating && (
                  <Chip 
                    mode="flat" 
                    style={styles.ratingChip}
                  >
                    ⭐ {reference.rating.toFixed(1)}
                  </Chip>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.actions}>
            <IconButton
              icon="phone"
              mode="outlined"
              size={20}
              onPress={() => handleCall(reference.phone)}
            />
            <IconButton
              icon="email"
              mode="outlined"
              size={20}
              onPress={() => handleEmail(reference.email)}
            />
            {reference.website && (
              <IconButton
                icon="web"
                mode="outlined"
                size={20}
                onPress={() => handleWebsite(reference.website)}
              />
            )}
          </View>
        </View>

        <Text variant="bodyMedium" style={styles.description}>
          {reference.description}
        </Text>

        <View style={styles.contactInfo}>
          <Text variant="bodySmall" style={styles.contactDetail}>
            📞 {reference.phone}
          </Text>
          <Text variant="bodySmall" style={styles.contactDetail}>
            📧 {reference.email}
          </Text>
          <Text variant="bodySmall" style={styles.contactDetail}>
            📍 {reference.address}
          </Text>
          {reference.website && (
            <Text variant="bodySmall" style={styles.contactDetail}>
              🌐 {reference.website}
            </Text>
          )}
        </View>

        {reference.notes && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.notesSection}>
              <Text variant="titleSmall" style={styles.notesTitle}>Admin Notes:</Text>
              <Text variant="bodySmall" style={styles.notes}>
                {reference.notes}
              </Text>
            </View>
          </>
        )}

        <View style={styles.cardActions}>
          <Button 
            mode="outlined" 
            compact
            onPress={() => navigation.navigate('EditReference', { referenceId: reference.id })}
          >
            Edit
          </Button>
          <Button 
            mode={reference.isActive ? 'outlined' : 'contained'}
            compact
            onPress={() => toggleReferenceStatus(reference.id!, !reference.isActive)}
          >
            {reference.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const activeReferences = references.filter(ref => ref.isActive);
  const inactiveReferences = references.filter(ref => !ref.isActive);

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Business References
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Manage trusted business partners for client recommendations
        </Text>
      </Surface>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Active References ({activeReferences.length})
            </Text>
            <Button 
              mode="contained" 
              compact
              onPress={() => navigation.navigate('AddReference')}
            >
              Add New
            </Button>
          </View>
          
          {activeReferences.length === 0 ? (
            <View style={styles.emptyState}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No active references
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtext}>
                Add trusted business partners to recommend to clients
              </Text>
            </View>
          ) : (
            activeReferences.map(renderReferenceCard)
          )}
        </View>

        {inactiveReferences.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Inactive References ({inactiveReferences.length})
            </Text>
            {inactiveReferences.map(renderReferenceCard)}
          </View>
        )}
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
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  referenceCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  referenceHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  businessInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  avatar: {
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
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  categoryChip: {
    height: 24,
  },
  statusChip: {
    height: 24,
  },
  ratingChip: {
    height: 24,
    backgroundColor: '#fff3e0',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  description: {
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  contactInfo: {
    gap: 4,
    marginBottom: 12,
  },
  contactDetail: {
    color: '#888',
  },
  divider: {
    marginVertical: 12,
  },
  notesSection: {
    marginBottom: 12,
  },
  notesTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  notes: {
    color: '#666',
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyText: {
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
  },
});