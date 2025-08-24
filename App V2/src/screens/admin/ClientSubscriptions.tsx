import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Searchbar, 
  SegmentedButtons, 
  Text, 
  FAB, 
  Chip,
  Portal,
  Modal,
  Button,
  TextInput,
  Surface,
  Card,
  IconButton,
  Menu,
  Divider,
  Switch
} from 'react-native-paper';
import { 
  getClientSubscriptions, 
  createClientSubscription, 
  updateClientSubscription,
  cancelClientSubscription,
  getActiveSubscriptionPlans,
  calculateNextServiceDate
} from '../../services/subscriptions';
import { getClients } from '../../services/clients';
import { ClientSubscription, SubscriptionPlan, Client, SubscriptionStatus } from '../../utils/types';

export default function AdminClientSubscriptions({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<ClientSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<ClientSubscription | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    planId: '',
    customPrice: 0,
    startDate: new Date().toISOString().split('T')[0],
    notes: '',
    autoRenew: true
  });

  const [menuVisible, setMenuVisible] = useState<{[key: string]: boolean}>({});

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [searchQuery, filterStatus, subscriptions]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subscriptionsData, plansData, clientsData] = await Promise.all([
        getClientSubscriptions(),
        getActiveSubscriptionPlans(),
        getClients()
      ]);
      
      setSubscriptions(subscriptionsData);
      setPlans(plansData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(sub => {
        const client = clients.find(c => c.id === sub.clientId);
        const plan = plans.find(p => p.id === sub.planId);
        const clientName = client ? `${client.firstName} ${client.lastName}` : '';
        const planName = plan?.name || '';
        
        return clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               planName.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    setFilteredSubscriptions(filtered);
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      planId: '',
      customPrice: 0,
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
      autoRenew: true
    });
  };

  const handleCreate = async () => {
    try {
      const startDate = new Date(formData.startDate).getTime();
      const selectedPlan = plans.find(p => p.id === formData.planId);
      
      if (!selectedPlan) {
        throw new Error('Selected plan not found');
      }

      const nextServiceDate = calculateNextServiceDate(startDate, selectedPlan.frequency);
      
      await createClientSubscription({
        clientId: formData.clientId,
        planId: formData.planId,
        status: 'active',
        startDate,
        nextServiceDate: selectedPlan.frequency === 'one-time' ? undefined : nextServiceDate,
        customPrice: formData.customPrice > 0 ? formData.customPrice : undefined,
        notes: formData.notes,
        autoRenew: formData.autoRenew
      });

      setCreateModalVisible(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating client subscription:', error);
    }
  };

  const handleEdit = (subscription: ClientSubscription) => {
    setSelectedSubscription(subscription);
    setFormData({
      clientId: subscription.clientId,
      planId: subscription.planId,
      customPrice: subscription.customPrice || 0,
      startDate: new Date(subscription.startDate).toISOString().split('T')[0],
      notes: subscription.notes || '',
      autoRenew: subscription.autoRenew
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedSubscription?.id) return;

    try {
      await updateClientSubscription(selectedSubscription.id, {
        customPrice: formData.customPrice > 0 ? formData.customPrice : undefined,
        notes: formData.notes,
        autoRenew: formData.autoRenew
      });

      setEditModalVisible(false);
      setSelectedSubscription(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error updating client subscription:', error);
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    try {
      await cancelClientSubscription(subscriptionId);
      loadData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const handlePauseResume = async (subscription: ClientSubscription) => {
    try {
      const newStatus: SubscriptionStatus = subscription.status === 'active' ? 'paused' : 'active';
      await updateClientSubscription(subscription.id!, { status: newStatus });
      loadData();
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  };

  const openMenu = (subscriptionId: string) => {
    setMenuVisible(prev => ({ ...prev, [subscriptionId]: true }));
  };

  const closeMenu = (subscriptionId: string) => {
    setMenuVisible(prev => ({ ...prev, [subscriptionId]: false }));
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.name || 'Unknown Plan';
  };

  const getPlanPrice = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.basePrice || 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active': return '#4caf50';
      case 'paused': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#757575';
    }
  };

  const renderSubscriptionCard = (subscription: ClientSubscription) => {
    const plan = plans.find(p => p.id === subscription.planId);
    const price = subscription.customPrice || getPlanPrice(subscription.planId);
    
    return (
      <Card key={subscription.id} style={styles.subscriptionCard}>
        <Card.Content>
          <View style={styles.subscriptionHeader}>
            <View style={styles.subscriptionInfo}>
              <Text variant="titleMedium" style={styles.clientName}>
                {getClientName(subscription.clientId)}
              </Text>
              <Text variant="bodyMedium" style={styles.planName}>
                {getPlanName(subscription.planId)}
              </Text>
            </View>
            <Menu
              visible={menuVisible[subscription.id!] || false}
              onDismiss={() => closeMenu(subscription.id!)}
              anchor={
                <IconButton 
                  icon="dots-vertical" 
                  onPress={() => openMenu(subscription.id!)}
                />
              }
            >
              <Menu.Item 
                onPress={() => {
                  closeMenu(subscription.id!);
                  handleEdit(subscription);
                }} 
                title="Edit" 
                leadingIcon="pencil"
              />
              <Menu.Item 
                onPress={() => {
                  closeMenu(subscription.id!);
                  handlePauseResume(subscription);
                }} 
                title={subscription.status === 'active' ? 'Pause' : 'Resume'} 
                leadingIcon={subscription.status === 'active' ? 'pause' : 'play'}
              />
              <Divider />
              <Menu.Item 
                onPress={() => {
                  closeMenu(subscription.id!);
                  handleCancel(subscription.id!);
                }} 
                title="Cancel" 
                leadingIcon="cancel"
                titleStyle={{ color: '#d32f2f' }}
              />
            </Menu>
          </View>

          <View style={styles.subscriptionDetails}>
            <View style={styles.detailRow}>
              <Chip 
                icon="calendar" 
                mode="outlined" 
                compact
                style={styles.detailChip}
              >
                {plan?.frequency || 'Unknown'}
              </Chip>
              <Chip 
                icon="currency-usd" 
                mode="outlined" 
                compact
                style={styles.detailChip}
              >
                {formatPrice(price)}
              </Chip>
              <Chip 
                icon="circle" 
                mode="outlined" 
                compact
                style={[
                  styles.detailChip,
                  { backgroundColor: getStatusColor(subscription.status) + '20' }
                ]}
              >
                {subscription.status}
              </Chip>
            </View>

            <View style={styles.dateInfo}>
              <Text variant="bodySmall" style={styles.dateLabel}>
                Started: {formatDate(subscription.startDate)}
              </Text>
              {subscription.nextServiceDate && (
                <Text variant="bodySmall" style={styles.dateLabel}>
                  Next Service: {formatDate(subscription.nextServiceDate)}
                </Text>
              )}
            </View>

            {subscription.notes && (
              <Text variant="bodySmall" style={styles.notes}>
                {subscription.notes}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderModal = (visible: boolean, onDismiss: () => void, onSave: () => void, title: string) => (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text variant="headlineSmall" style={styles.modalTitle}>{title}</Text>

          {title.includes('Create') && (
            <>
              <Text variant="labelMedium" style={styles.inputLabel}>Client</Text>
              <SegmentedButtons
                value={formData.clientId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                buttons={clients.slice(0, 4).map(client => ({
                  value: client.id!,
                  label: `${client.firstName} ${client.lastName}`.slice(0, 10)
                }))}
                style={styles.input}
              />
              
              <Text variant="labelMedium" style={styles.inputLabel}>Subscription Plan</Text>
              <SegmentedButtons
                value={formData.planId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, planId: value }))}
                buttons={plans.slice(0, 3).map(plan => ({
                  value: plan.id!,
                  label: plan.name.slice(0, 10)
                }))}
                style={styles.input}
              />

              <TextInput
                label="Start Date"
                value={formData.startDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, startDate: text }))}
                style={styles.input}
                mode="outlined"
                placeholder="YYYY-MM-DD"
              />
            </>
          )}

          <TextInput
            label="Custom Price (leave 0 for plan price)"
            value={formData.customPrice.toString()}
            onChangeText={(text) => setFormData(prev => ({ ...prev, customPrice: parseFloat(text) || 0 }))}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />

          <TextInput
            label="Notes"
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          <View style={styles.switchContainer}>
            <Text variant="labelLarge">Auto Renew</Text>
            <Switch
              value={formData.autoRenew}
              onValueChange={(value) => setFormData(prev => ({ ...prev, autoRenew: value }))}
            />
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={onSave}
              style={styles.modalButton}
              disabled={title.includes('Create') && (!formData.clientId || !formData.planId)}
            >
              {title.includes('Create') ? 'Create' : 'Update'}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search by client or plan..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <SegmentedButtons
          value={filterStatus}
          onValueChange={setFilterStatus}
          buttons={filterOptions}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Client Subscriptions
          </Text>
          <Text variant="bodyMedium" style={styles.sectionSubtitle}>
            {filteredSubscriptions.length} subscription(s) found
          </Text>
        </View>

        {filteredSubscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No subscriptions found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Create a subscription for a client to get started
            </Text>
          </View>
        ) : (
          filteredSubscriptions.map(renderSubscriptionCard)
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setCreateModalVisible(true)}
      />

      {renderModal(
        createModalVisible,
        () => setCreateModalVisible(false),
        handleCreate,
        'Create Client Subscription'
      )}

      {renderModal(
        editModalVisible,
        () => setEditModalVisible(false),
        handleUpdate,
        'Edit Subscription'
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    gap: 12,
  },
  searchbar: {
    backgroundColor: '#f0f0f0',
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sectionSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  subscriptionCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  clientName: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  planName: {
    color: '#666',
    marginTop: 4,
  },
  subscriptionDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  detailChip: {
    backgroundColor: '#f5f5f5',
  },
  dateInfo: {
    gap: 4,
  },
  dateLabel: {
    color: '#666',
  },
  notes: {
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyText: {
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    color: '#666',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
});