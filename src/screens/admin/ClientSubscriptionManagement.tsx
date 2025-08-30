import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Alert, StyleSheet } from 'react-native';
import { Button, Card, TextInput, Chip, Searchbar, Menu, IconButton, FAB } from 'react-native-paper';
import { 
  SubscriptionPlan, 
  ClientSubscription,
  getSubscriptionPlans,
  getClientSubscriptions,
  createClientSubscription,
  updateClientSubscription,
  calculateNextJobDate,
  getActiveSubscriptions,
  getUpcomingJobs
} from '../../services/subscriptions';
import { useAuth } from '../../context/AuthContext';

interface ClientSubscriptionManagementProps {
  navigation: any;
}

const ClientSubscriptionManagement: React.FC<ClientSubscriptionManagementProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<ClientSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});
  const [showAssignForm, setShowAssignForm] = useState(false);
  
  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState({
    clientId: '',
    subscriptionPlanId: '',
    customPrice: 0,
    startDate: new Date(),
    preferredDayOfWeek: undefined as number | undefined,
    preferredTimeSlot: 'morning' as 'morning' | 'afternoon' | 'evening',
    specialInstructions: '',
    autoRenewal: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allSubscriptions, allPlans, upcoming] = await Promise.all([
        getClientSubscriptions(),
        getSubscriptionPlans(),
        getUpcomingJobs(7) // Next 7 days
      ]);
      setSubscriptions(allSubscriptions);
      setPlans(allPlans);
      setUpcomingJobs(upcoming);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubscription = async () => {
    if (!assignmentForm.clientId || !assignmentForm.subscriptionPlanId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const plan = plans.find(p => p.id === assignmentForm.subscriptionPlanId);
    if (!plan) {
      Alert.alert('Error', 'Selected plan not found');
      return;
    }

    const startDate = assignmentForm.startDate.getTime();
    const subscription: ClientSubscription = {
      clientId: assignmentForm.clientId,
      subscriptionPlanId: assignmentForm.subscriptionPlanId,
      status: 'active',
      customPrice: assignmentForm.customPrice !== plan.basePrice ? assignmentForm.customPrice : undefined,
      startDate,
      nextJobDate: 0, // Will be calculated
      preferredDayOfWeek: assignmentForm.preferredDayOfWeek,
      preferredTimeSlot: assignmentForm.preferredTimeSlot,
      specialInstructions: assignmentForm.specialInstructions || undefined,
      totalJobsCompleted: 0,
      totalAmount: 0,
      autoRenewal: assignmentForm.autoRenewal,
      paymentStatus: 'current',
    };

    // Calculate next job date
    subscription.nextJobDate = calculateNextJobDate(subscription);

    setLoading(true);
    try {
      await createClientSubscription(subscription, user?.uid || '');
      Alert.alert('Success', 'Subscription assigned successfully!');
      setShowAssignForm(false);
      resetAssignmentForm();
      loadData();
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert('Error', 'Failed to assign subscription');
    } finally {
      setLoading(false);
    }
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      clientId: '',
      subscriptionPlanId: '',
      customPrice: 0,
      startDate: new Date(),
      preferredDayOfWeek: undefined,
      preferredTimeSlot: 'morning',
      specialInstructions: '',
      autoRenewal: true,
    });
  };

  const handleUpdateSubscriptionStatus = async (subscriptionId: string, status: ClientSubscription['status']) => {
    try {
      await updateClientSubscription(subscriptionId, { status });
      Alert.alert('Success', `Subscription ${status} successfully`);
      loadData();
    } catch (error) {
      Alert.alert('Error', `Failed to ${status} subscription`);
    }
  };

  const handleGenerateNextJob = async (subscription: ClientSubscription) => {
    if (!subscription.id) return;

    const nextJobDate = calculateNextJobDate(subscription);
    try {
      await updateClientSubscription(subscription.id, { 
        nextJobDate,
        lastJobDate: subscription.nextJobDate 
      });
      Alert.alert('Success', 'Next job date updated');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update next job date');
    }
  };

  const toggleMenu = (subscriptionId: string) => {
    setMenuVisible(prev => ({ ...prev, [subscriptionId]: !prev[subscriptionId] }));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  const getStatusColor = (status: ClientSubscription['status']) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'paused': return '#FF9800';
      case 'cancelled': return '#F44336';
      case 'expired': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         subscription.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || subscription.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (showAssignForm) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Assign Subscription</Text>
          <Button mode="text" onPress={() => setShowAssignForm(false)}>Cancel</Button>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Client ID *"
              value={assignmentForm.clientId}
              onChangeText={(text) => setAssignmentForm(prev => ({ ...prev, clientId: text }))}
              style={styles.input}
            />

            <Text style={styles.label}>Select Plan *</Text>
            <View style={styles.chipContainer}>
              {plans.filter(plan => plan.isActive).map((plan) => (
                <Chip
                  key={plan.id}
                  selected={assignmentForm.subscriptionPlanId === plan.id}
                  onPress={() => {
                    setAssignmentForm(prev => ({ 
                      ...prev, 
                      subscriptionPlanId: plan.id!,
                      customPrice: plan.basePrice
                    }));
                  }}
                  style={styles.chip}
                >
                  {plan.name} (${plan.basePrice})
                </Chip>
              ))}
            </View>

            <TextInput
              label="Custom Price ($)"
              value={assignmentForm.customPrice.toString()}
              onChangeText={(text) => setAssignmentForm(prev => ({ 
                ...prev, 
                customPrice: parseFloat(text) || 0 
              }))}
              keyboardType="numeric"
              style={styles.input}
            />

            <Text style={styles.label}>Preferred Day of Week</Text>
            <View style={styles.chipContainer}>
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <Chip
                  key={day}
                  selected={assignmentForm.preferredDayOfWeek === day}
                  onPress={() => setAssignmentForm(prev => ({ 
                    ...prev, 
                    preferredDayOfWeek: prev.preferredDayOfWeek === day ? undefined : day 
                  }))}
                  style={styles.chip}
                >
                  {getDayName(day)}
                </Chip>
              ))}
            </View>

            <Text style={styles.label}>Preferred Time</Text>
            <View style={styles.chipContainer}>
              {[
                { key: 'morning', label: 'Morning' },
                { key: 'afternoon', label: 'Afternoon' },
                { key: 'evening', label: 'Evening' }
              ].map((time) => (
                <Chip
                  key={time.key}
                  selected={assignmentForm.preferredTimeSlot === time.key}
                  onPress={() => setAssignmentForm(prev => ({ 
                    ...prev, 
                    preferredTimeSlot: time.key as any 
                  }))}
                  style={styles.chip}
                >
                  {time.label}
                </Chip>
              ))}
            </View>

            <TextInput
              label="Special Instructions"
              value={assignmentForm.specialInstructions}
              onChangeText={(text) => setAssignmentForm(prev => ({ ...prev, specialInstructions: text }))}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleAssignSubscription}
              loading={loading}
              style={styles.submitButton}
            >
              Assign Subscription
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Client Subscriptions</Text>
      </View>

      {/* Upcoming Jobs Summary */}
      {upcomingJobs.length > 0 && (
        <Card style={[styles.card, styles.summaryCard]}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Upcoming Jobs (Next 7 Days)</Text>
            {upcomingJobs.slice(0, 3).map((subscription) => (
              <View key={subscription.id} style={styles.summaryItem}>
                <Text style={styles.summaryText}>
                  Client: {subscription.clientId} - {formatDate(subscription.nextJobDate)}
                </Text>
              </View>
            ))}
            {upcomingJobs.length > 3 && (
              <Text style={styles.moreText}>+{upcomingJobs.length - 3} more jobs</Text>
            )}
          </Card.Content>
        </Card>
      )}

      <Searchbar
        placeholder="Search by client ID or subscription ID"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filterContainer}>
        {['all', 'active', 'paused', 'cancelled'].map((status) => (
          <Chip
            key={status}
            selected={filterStatus === status}
            onPress={() => setFilterStatus(status as any)}
            style={styles.filterChip}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Chip>
        ))}
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {filteredSubscriptions.map((subscription) => {
          const plan = plans.find(p => p.id === subscription.subscriptionPlanId);
          return (
            <Card key={subscription.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitle}>
                    <Text style={styles.subscriptionId}>ID: {subscription.id?.slice(-8)}</Text>
                    <Chip 
                      style={[styles.statusChip, { backgroundColor: getStatusColor(subscription.status) }]}
                      textStyle={{ color: 'white' }}
                    >
                      {subscription.status.toUpperCase()}
                    </Chip>
                  </View>
                  <Menu
                    visible={menuVisible[subscription.id!]}
                    onDismiss={() => toggleMenu(subscription.id!)}
                    anchor={
                      <IconButton
                        icon="dots-vertical"
                        onPress={() => toggleMenu(subscription.id!)}
                      />
                    }
                  >
                    {subscription.status === 'active' && (
                      <Menu.Item 
                        onPress={() => handleUpdateSubscriptionStatus(subscription.id!, 'paused')} 
                        title="Pause" 
                      />
                    )}
                    {subscription.status === 'paused' && (
                      <Menu.Item 
                        onPress={() => handleUpdateSubscriptionStatus(subscription.id!, 'active')} 
                        title="Resume" 
                      />
                    )}
                    {subscription.status !== 'cancelled' && (
                      <Menu.Item 
                        onPress={() => handleUpdateSubscriptionStatus(subscription.id!, 'cancelled')} 
                        title="Cancel" 
                      />
                    )}
                    <Menu.Item 
                      onPress={() => handleGenerateNextJob(subscription)} 
                      title="Update Next Job" 
                    />
                  </Menu>
                </View>

                <View style={styles.subscriptionDetails}>
                  <Text style={styles.detailText}>Client: {subscription.clientId}</Text>
                  <Text style={styles.detailText}>Plan: {plan?.name || 'Unknown Plan'}</Text>
                  <Text style={styles.detailText}>
                    Price: ${subscription.customPrice || plan?.basePrice || 0}
                  </Text>
                  <Text style={styles.detailText}>
                    Start Date: {formatDate(subscription.startDate)}
                  </Text>
                  {subscription.status === 'active' && (
                    <Text style={styles.detailText}>
                      Next Service: {formatDateTime(subscription.nextJobDate)}
                    </Text>
                  )}
                  <Text style={styles.detailText}>
                    Jobs Completed: {subscription.totalJobsCompleted}
                  </Text>
                  <Text style={styles.detailText}>
                    Total Revenue: ${subscription.totalAmount.toFixed(2)}
                  </Text>
                  {subscription.preferredDayOfWeek !== undefined && (
                    <Text style={styles.detailText}>
                      Preferred Day: {getDayName(subscription.preferredDayOfWeek)}
                    </Text>
                  )}
                  <Text style={styles.detailText}>
                    Preferred Time: {subscription.preferredTimeSlot 
                      ? subscription.preferredTimeSlot.charAt(0).toUpperCase() + subscription.preferredTimeSlot.slice(1)
                      : 'Not specified'}
                  </Text>
                  <Text style={styles.detailText}>
                    Payment Status: {subscription.paymentStatus?.toUpperCase()}
                  </Text>
                </View>

                {subscription.specialInstructions && (
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>Special Instructions:</Text>
                    <Text style={styles.instructions}>{subscription.specialInstructions}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })}

        {filteredSubscriptions.length === 0 && !loading && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.emptyText}>
                {searchQuery || filterStatus !== 'all' 
                  ? 'No subscriptions match your filters.' 
                  : 'No subscriptions found.'
                }
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAssignForm(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976D2',
  },
  summaryItem: {
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#1976D2',
  },
  moreText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  searchbar: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    height: 32,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subscriptionId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 24,
  },
  subscriptionDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  instructionsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  instructions: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
  },
  input: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ClientSubscriptionManagement;