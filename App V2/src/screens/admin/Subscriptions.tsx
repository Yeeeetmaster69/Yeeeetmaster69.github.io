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
  getSubscriptionPlans, 
  createSubscriptionPlan, 
  updateSubscriptionPlan, 
  deleteSubscriptionPlan 
} from '../../services/subscriptions';
import { SubscriptionPlan, SubscriptionFrequency } from '../../utils/types';

export default function AdminSubscriptions({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'monthly' as SubscriptionFrequency,
    basePrice: 0,
    estimatedHours: 2,
    services: '',
    isActive: true
  });

  const [menuVisible, setMenuVisible] = useState<{[key: string]: boolean}>({});

  const filterOptions = [
    { value: 'all', label: 'All Plans' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const frequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'semi-annual', label: 'Semi-annual' },
    { value: 'one-time', label: 'One-time' },
  ];

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    filterPlans();
  }, [searchQuery, filterStatus, plans]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlans = () => {
    let filtered = plans;

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(plan => plan.isActive);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(plan => !plan.isActive);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(plan =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.frequency.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPlans(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      frequency: 'monthly',
      basePrice: 0,
      estimatedHours: 2,
      services: '',
      isActive: true
    });
  };

  const handleCreate = async () => {
    try {
      const servicesArray = formData.services.split(',').map(s => s.trim()).filter(s => s);
      
      await createSubscriptionPlan({
        name: formData.name,
        description: formData.description,
        frequency: formData.frequency,
        basePrice: formData.basePrice,
        estimatedHours: formData.estimatedHours,
        services: servicesArray,
        isActive: formData.isActive
      });

      setCreateModalVisible(false);
      resetForm();
      loadPlans();
    } catch (error) {
      console.error('Error creating subscription plan:', error);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      frequency: plan.frequency,
      basePrice: plan.basePrice,
      estimatedHours: plan.estimatedHours,
      services: plan.services.join(', '),
      isActive: plan.isActive
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedPlan?.id) return;

    try {
      const servicesArray = formData.services.split(',').map(s => s.trim()).filter(s => s);
      
      await updateSubscriptionPlan(selectedPlan.id, {
        name: formData.name,
        description: formData.description,
        frequency: formData.frequency,
        basePrice: formData.basePrice,
        estimatedHours: formData.estimatedHours,
        services: servicesArray,
        isActive: formData.isActive
      });

      setEditModalVisible(false);
      setSelectedPlan(null);
      resetForm();
      loadPlans();
    } catch (error) {
      console.error('Error updating subscription plan:', error);
    }
  };

  const handleDelete = async (planId: string) => {
    try {
      await deleteSubscriptionPlan(planId);
      loadPlans();
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
    }
  };

  const openMenu = (planId: string) => {
    setMenuVisible(prev => ({ ...prev, [planId]: true }));
  };

  const closeMenu = (planId: string) => {
    setMenuVisible(prev => ({ ...prev, [planId]: false }));
  };

  const getFrequencyLabel = (frequency: SubscriptionFrequency) => {
    return frequencyOptions.find(opt => opt.value === frequency)?.label || frequency;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderPlanCard = (plan: SubscriptionPlan) => (
    <Card key={plan.id} style={styles.planCard}>
      <Card.Content>
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <Text variant="titleMedium" style={styles.planName}>{plan.name}</Text>
            <Text variant="bodyMedium" style={styles.planDescription}>{plan.description}</Text>
          </View>
          <Menu
            visible={menuVisible[plan.id!] || false}
            onDismiss={() => closeMenu(plan.id!)}
            anchor={
              <IconButton 
                icon="dots-vertical" 
                onPress={() => openMenu(plan.id!)}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                closeMenu(plan.id!);
                handleEdit(plan);
              }} 
              title="Edit" 
              leadingIcon="pencil"
            />
            <Menu.Item 
              onPress={() => {
                closeMenu(plan.id!);
                navigation.navigate('SubscriptionClients', { planId: plan.id });
              }} 
              title="View Clients" 
              leadingIcon="account-group"
            />
            <Divider />
            <Menu.Item 
              onPress={() => {
                closeMenu(plan.id!);
                handleDelete(plan.id!);
              }} 
              title="Delete" 
              leadingIcon="delete"
              titleStyle={{ color: '#d32f2f' }}
            />
          </Menu>
        </View>

        <View style={styles.planDetails}>
          <View style={styles.detailRow}>
            <Chip icon="calendar" mode="outlined" compact>
              {getFrequencyLabel(plan.frequency)}
            </Chip>
            <Chip icon="currency-usd" mode="outlined" compact>
              {formatPrice(plan.basePrice)}
            </Chip>
            <Chip icon="clock" mode="outlined" compact>
              {plan.estimatedHours}h
            </Chip>
          </View>

          {plan.services.length > 0 && (
            <View style={styles.servicesContainer}>
              <Text variant="labelMedium" style={styles.servicesLabel}>Services:</Text>
              <View style={styles.servicesList}>
                {plan.services.map((service, index) => (
                  <Chip key={index} mode="outlined" compact style={styles.serviceChip}>
                    {service}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          <View style={styles.statusContainer}>
            <Chip 
              icon={plan.isActive ? "check-circle" : "cancel"} 
              mode={plan.isActive ? "flat" : "outlined"}
              style={[
                styles.statusChip,
                plan.isActive ? styles.activeChip : styles.inactiveChip
              ]}
            >
              {plan.isActive ? 'Active' : 'Inactive'}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderModal = (visible: boolean, onDismiss: () => void, onSave: () => void, title: string) => (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text variant="headlineSmall" style={styles.modalTitle}>{title}</Text>

          <TextInput
            label="Plan Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text variant="labelMedium" style={styles.inputLabel}>Frequency</Text>
              <SegmentedButtons
                value={formData.frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as SubscriptionFrequency }))}
                buttons={frequencyOptions.slice(0, 3)}
                style={styles.input}
              />
              <SegmentedButtons
                value={formData.frequency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as SubscriptionFrequency }))}
                buttons={frequencyOptions.slice(3)}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.row}>
            <TextInput
              label="Base Price ($)"
              value={formData.basePrice.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, basePrice: parseFloat(text) || 0 }))}
              style={[styles.input, styles.halfWidth]}
              mode="outlined"
              keyboardType="numeric"
            />
            <TextInput
              label="Estimated Hours"
              value={formData.estimatedHours.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(text) || 0 }))}
              style={[styles.input, styles.halfWidth]}
              mode="outlined"
              keyboardType="numeric"
            />
          </View>

          <TextInput
            label="Services (comma-separated)"
            value={formData.services}
            onChangeText={(text) => setFormData(prev => ({ ...prev, services: text }))}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={2}
            placeholder="Lawn mowing, Hedge trimming, Leaf removal"
          />

          <View style={styles.switchContainer}>
            <Text variant="labelLarge">Active Plan</Text>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
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
              disabled={!formData.name || !formData.description || formData.basePrice <= 0}
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
          placeholder="Search subscription plans..."
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
            Subscription Plans
          </Text>
          <Text variant="bodyMedium" style={styles.sectionSubtitle}>
            {filteredPlans.length} plan(s) found
          </Text>
        </View>

        {filteredPlans.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No subscription plans found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Create your first subscription plan to get started
            </Text>
          </View>
        ) : (
          filteredPlans.map(renderPlanCard)
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
        'Create Subscription Plan'
      )}

      {renderModal(
        editModalVisible,
        () => setEditModalVisible(false),
        handleUpdate,
        'Edit Subscription Plan'
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
  planCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  planDescription: {
    color: '#666',
    marginTop: 4,
  },
  planDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  servicesContainer: {
    gap: 8,
  },
  servicesLabel: {
    color: '#666',
    fontWeight: '500',
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceChip: {
    backgroundColor: '#e3f2fd',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  activeChip: {
    backgroundColor: '#e8f5e8',
  },
  inactiveChip: {
    backgroundColor: '#ffebee',
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
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