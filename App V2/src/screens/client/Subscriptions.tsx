import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Alert, StyleSheet } from 'react-native';
import { Button, Card, TextInput, Chip, Switch, Divider } from 'react-native-paper';
import { 
  SubscriptionPlan, 
  ClientSubscription,
  getSubscriptionPlans,
  getClientSubscriptions,
  createClientSubscription,
  updateClientSubscription,
  calculateNextJobDate,
  getSeasonalPrice
} from '../../services/subscriptions';
import { useAuth } from '../../context/AuthContext';

interface ClientSubscriptionsProps {
  navigation: any;
}

const ClientSubscriptions: React.FC<ClientSubscriptionsProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<ClientSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);

  // Customization form state
  const [customization, setCustomization] = useState({
    customPrice: 0,
    customServices: [] as string[],
    customFrequency: undefined as string | undefined,
    preferredDayOfWeek: undefined as number | undefined,
    preferredTimeSlot: 'morning' as 'morning' | 'afternoon' | 'evening',
    specialInstructions: '',
    autoRenewal: true,
  });

  const [newCustomService, setNewCustomService] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plans, subscriptions] = await Promise.all([
        getSubscriptionPlans(true), // Only active plans
        getClientSubscriptions(user?.uid)
      ]);
      setAvailablePlans(plans);
      setMySubscriptions(subscriptions);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCustomization({
      customPrice: plan.basePrice,
      customServices: [...plan.services],
      customFrequency: plan.frequency,
      preferredDayOfWeek: undefined,
      preferredTimeSlot: 'morning',
      specialInstructions: '',
      autoRenewal: true,
    });
    setShowCustomization(true);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !user?.uid) return;

    const startDate = Date.now();
    const subscription: ClientSubscription = {
      clientId: user.uid,
      subscriptionPlanId: selectedPlan.id!,
      status: 'active',
      customPrice: customization.customPrice !== selectedPlan.basePrice ? customization.customPrice : undefined,
      customServices: JSON.stringify(customization.customServices) !== JSON.stringify(selectedPlan.services) 
        ? customization.customServices : undefined,
      customFrequency: customization.customFrequency !== selectedPlan.frequency 
        ? customization.customFrequency as any : undefined,
      startDate,
      nextJobDate: 0, // Will be calculated
      preferredDayOfWeek: customization.preferredDayOfWeek,
      preferredTimeSlot: customization.preferredTimeSlot,
      specialInstructions: customization.specialInstructions || undefined,
      totalJobsCompleted: 0,
      totalAmount: 0,
      autoRenewal: customization.autoRenewal,
      paymentStatus: 'current',
    };

    // Calculate next job date
    subscription.nextJobDate = calculateNextJobDate(subscription);

    setLoading(true);
    try {
      await createClientSubscription(subscription, user.uid);
      Alert.alert('Success', 'Successfully subscribed to the plan!');
      setShowCustomization(false);
      setShowPlanSelection(false);
      setSelectedPlan(null);
      loadData();
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert('Error', 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    Alert.alert(
      'Pause Subscription',
      'Are you sure you want to pause this subscription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause',
          onPress: async () => {
            try {
              await updateClientSubscription(subscriptionId, { status: 'paused' });
              Alert.alert('Success', 'Subscription paused');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to pause subscription');
            }
          }
        }
      ]
    );
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      await updateClientSubscription(subscriptionId, { status: 'active' });
      Alert.alert('Success', 'Subscription resumed');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to resume subscription');
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel this subscription? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateClientSubscription(subscriptionId, { status: 'cancelled' });
              Alert.alert('Success', 'Subscription cancelled');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription');
            }
          }
        }
      ]
    );
  };

  const addCustomService = () => {
    if (newCustomService.trim()) {
      setCustomization(prev => ({
        ...prev,
        customServices: [...prev.customServices, newCustomService.trim()]
      }));
      setNewCustomService('');
    }
  };

  const removeCustomService = (index: number) => {
    setCustomization(prev => ({
      ...prev,
      customServices: prev.customServices.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
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

  if (showCustomization && selectedPlan) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Customize Your Plan</Text>
          <Button mode="text" onPress={() => setShowCustomization(false)}>Cancel</Button>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.planName}>{selectedPlan.name}</Text>
            <Text style={styles.description}>{selectedPlan.description}</Text>
            
            <Divider style={styles.divider} />

            {selectedPlan.customizations?.allowPriceOverride && (
              <TextInput
                label="Custom Price ($)"
                value={customization.customPrice.toString()}
                onChangeText={(text) => setCustomization(prev => ({ 
                  ...prev, 
                  customPrice: parseFloat(text) || selectedPlan.basePrice 
                }))}
                keyboardType="numeric"
                style={styles.input}
              />
            )}

            {selectedPlan.customizations?.allowFrequencyChange && (
              <>
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.chipContainer}>
                  {['weekly', 'biweekly', 'monthly', 'quarterly', 'semi-annual'].map((freq) => (
                    <Chip
                      key={freq}
                      selected={customization.customFrequency === freq}
                      onPress={() => setCustomization(prev => ({ ...prev, customFrequency: freq }))}
                      style={styles.chip}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Chip>
                  ))}
                </View>
              </>
            )}

            {selectedPlan.customizations?.allowServiceModification && (
              <>
                <Text style={styles.label}>Services</Text>
                <View style={styles.row}>
                  <TextInput
                    label="Add Custom Service"
                    value={newCustomService}
                    onChangeText={setNewCustomService}
                    style={[styles.input, styles.expandedInput]}
                    onSubmitEditing={addCustomService}
                  />
                  <Button mode="contained" onPress={addCustomService} style={styles.addButton}>
                    Add
                  </Button>
                </View>
                <View style={styles.chipContainer}>
                  {customization.customServices.map((service, index) => (
                    <Chip
                      key={index}
                      onClose={() => removeCustomService(index)}
                      style={styles.chip}
                    >
                      {service}
                    </Chip>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.label}>Preferred Day of Week</Text>
            <View style={styles.chipContainer}>
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <Chip
                  key={day}
                  selected={customization.preferredDayOfWeek === day}
                  onPress={() => setCustomization(prev => ({ 
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
                { key: 'morning', label: 'Morning (8 AM - 12 PM)' },
                { key: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
                { key: 'evening', label: 'Evening (5 PM - 8 PM)' }
              ].map((time) => (
                <Chip
                  key={time.key}
                  selected={customization.preferredTimeSlot === time.key}
                  onPress={() => setCustomization(prev => ({ 
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
              value={customization.specialInstructions}
              onChangeText={(text) => setCustomization(prev => ({ ...prev, specialInstructions: text }))}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <View style={styles.switchContainer}>
              <Text>Auto-Renewal</Text>
              <Switch
                value={customization.autoRenewal}
                onValueChange={(value) => setCustomization(prev => ({ ...prev, autoRenewal: value }))}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSubscribe}
              loading={loading}
              style={styles.subscribeButton}
            >
              Subscribe for ${getSeasonalPrice(customization.customPrice, selectedPlan.seasonalAdjustments).toFixed(2)}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  if (showPlanSelection) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose a Plan</Text>
          <Button mode="text" onPress={() => setShowPlanSelection(false)}>Cancel</Button>
        </View>

        {availablePlans.map((plan) => (
          <Card key={plan.id} style={styles.card}>
            <Card.Content>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.description}>{plan.description}</Text>
              
              <View style={styles.planDetails}>
                <Text style={styles.detailText}>
                  Frequency: {plan.frequency.charAt(0).toUpperCase() + plan.frequency.slice(1)}
                </Text>
                <Text style={styles.detailText}>
                  Price: ${getSeasonalPrice(plan.basePrice, plan.seasonalAdjustments).toFixed(2)}
                </Text>
                <Text style={styles.detailText}>
                  Duration: {plan.estimatedDuration} minutes
                </Text>
              </View>

              {plan.services && plan.services.length > 0 && (
                <View style={styles.servicesContainer}>
                  <Text style={styles.servicesTitle}>Included Services:</Text>
                  <View style={styles.chipContainer}>
                    {plan.services.map((service, index) => (
                      <Chip key={index} style={styles.serviceChip}>
                        {service}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              <Button
                mode="contained"
                onPress={() => handleSelectPlan(plan)}
                style={styles.selectButton}
              >
                Select This Plan
              </Button>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>My Subscriptions</Text>
        <Button mode="contained" onPress={() => setShowPlanSelection(true)}>
          New Subscription
        </Button>
      </View>

      {mySubscriptions.map((subscription) => {
        const plan = availablePlans.find(p => p.id === subscription.subscriptionPlanId);
        return (
          <Card key={subscription.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text style={styles.planName}>{plan?.name || 'Plan'}</Text>
                <Chip 
                  style={[styles.statusChip, { backgroundColor: getStatusColor(subscription.status) }]}
                  textStyle={{ color: 'white' }}
                >
                  {subscription.status.toUpperCase()}
                </Chip>
              </View>

              <Text style={styles.description}>{plan?.description}</Text>
              
              <View style={styles.subscriptionDetails}>
                <Text style={styles.detailText}>
                  Frequency: {(subscription.customFrequency || plan?.frequency || '').charAt(0).toUpperCase() + 
                           (subscription.customFrequency || plan?.frequency || '').slice(1)}
                </Text>
                <Text style={styles.detailText}>
                  Price: ${subscription.customPrice || plan?.basePrice || 0}
                </Text>
                <Text style={styles.detailText}>
                  Start Date: {formatDate(subscription.startDate)}
                </Text>
                {subscription.status === 'active' && (
                  <Text style={styles.detailText}>
                    Next Service: {formatDate(subscription.nextJobDate)}
                  </Text>
                )}
                <Text style={styles.detailText}>
                  Jobs Completed: {subscription.totalJobsCompleted}
                </Text>
                {subscription.preferredDayOfWeek !== undefined && (
                  <Text style={styles.detailText}>
                    Preferred Day: {getDayName(subscription.preferredDayOfWeek)}
                  </Text>
                )}
                <Text style={styles.detailText}>
                  Preferred Time: {subscription.preferredTimeSlot?.charAt(0).toUpperCase() + 
                                 subscription.preferredTimeSlot?.slice(1)}
                </Text>
              </View>

              {subscription.customServices && subscription.customServices.length > 0 && (
                <View style={styles.servicesContainer}>
                  <Text style={styles.servicesTitle}>Custom Services:</Text>
                  <View style={styles.chipContainer}>
                    {subscription.customServices.map((service, index) => (
                      <Chip key={index} style={styles.serviceChip}>
                        {service}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              {subscription.specialInstructions && (
                <View style={styles.instructionsContainer}>
                  <Text style={styles.servicesTitle}>Special Instructions:</Text>
                  <Text style={styles.instructions}>{subscription.specialInstructions}</Text>
                </View>
              )}

              <View style={styles.actionButtons}>
                {subscription.status === 'active' && (
                  <Button
                    mode="outlined"
                    onPress={() => handlePauseSubscription(subscription.id!)}
                    style={styles.actionButton}
                  >
                    Pause
                  </Button>
                )}
                {subscription.status === 'paused' && (
                  <Button
                    mode="contained"
                    onPress={() => handleResumeSubscription(subscription.id!)}
                    style={styles.actionButton}
                  >
                    Resume
                  </Button>
                )}
                {subscription.status !== 'cancelled' && (
                  <Button
                    mode="outlined"
                    onPress={() => handleCancelSubscription(subscription.id!)}
                    style={styles.actionButton}
                    textColor="#F44336"
                  >
                    Cancel
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        );
      })}

      {mySubscriptions.length === 0 && !loading && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>You don't have any subscriptions yet.</Text>
            <Button mode="contained" onPress={() => setShowPlanSelection(true)} style={styles.createFirstButton}>
              Browse Available Plans
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 24,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  planDetails: {
    marginBottom: 12,
  },
  subscriptionDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  servicesContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
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
  serviceChip: {
    height: 24,
  },
  selectButton: {
    marginTop: 12,
  },
  subscribeButton: {
    marginTop: 16,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  expandedInput: {
    flex: 1,
  },
  addButton: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: {
    marginVertical: 16,
  },
  instructionsContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  instructions: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  createFirstButton: {
    alignSelf: 'center',
  },
});

export default ClientSubscriptions;