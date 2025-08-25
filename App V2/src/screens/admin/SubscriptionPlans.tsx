import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, Alert, StyleSheet } from 'react-native';
import { Button, Card, TextInput, Chip, Switch, Menu, IconButton } from 'react-native-paper';
import { 
  SubscriptionPlan, 
  createSubscriptionPlan, 
  updateSubscriptionPlan, 
  getSubscriptionPlans,
  deleteSubscriptionPlan,
  getSeasonalPrice
} from '../../services/subscriptions';
import { useAuth } from '../../context/AuthContext';

interface SubscriptionPlansProps {
  navigation: any;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});

  // Form state
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
    name: '',
    description: '',
    frequency: 'weekly',
    services: [],
    basePrice: 0,
    isActive: true,
    estimatedDuration: 60,
    requiredSkills: [],
    seasonalAdjustments: {
      spring: 1.0,
      summer: 1.2,
      fall: 1.0,
      winter: 0.8
    },
    customizations: {
      allowPriceOverride: true,
      allowServiceModification: true,
      allowFrequencyChange: true
    }
  });

  const [newService, setNewService] = useState('');
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const planList = await getSubscriptionPlans();
      setPlans(planList);
    } catch (error) {
      console.error('Error loading plans:', error);
      Alert.alert('Error', 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || formData.basePrice === 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.id!, formData);
        Alert.alert('Success', 'Subscription plan updated successfully');
      } else {
        await createSubscriptionPlan(formData as SubscriptionPlan, user?.uid || '');
        Alert.alert('Success', 'Subscription plan created successfully');
      }
      resetForm();
      loadPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      Alert.alert('Error', 'Failed to save subscription plan');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setShowForm(true);
  };

  const handleDelete = async (planId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this subscription plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubscriptionPlan(planId);
              Alert.alert('Success', 'Subscription plan deleted');
              loadPlans();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete subscription plan');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      frequency: 'weekly',
      services: [],
      basePrice: 0,
      isActive: true,
      estimatedDuration: 60,
      requiredSkills: [],
      seasonalAdjustments: {
        spring: 1.0,
        summer: 1.2,
        fall: 1.0,
        winter: 0.8
      },
      customizations: {
        allowPriceOverride: true,
        allowServiceModification: true,
        allowFrequencyChange: true
      }
    });
    setEditingPlan(null);
    setShowForm(false);
    setNewService('');
    setNewSkill('');
  };

  const addService = () => {
    if (newService.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...(prev.services || []), newService.trim()]
      }));
      setNewService('');
    }
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.filter((_, i) => i !== index) || []
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...(prev.requiredSkills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills?.filter((_, i) => i !== index) || []
    }));
  };

  const toggleMenu = (planId: string) => {
    setMenuVisible(prev => ({ ...prev, [planId]: !prev[planId] }));
  };

  const formatPrice = (price: number, seasonalAdjustments?: SubscriptionPlan['seasonalAdjustments']) => {
    const currentPrice = getSeasonalPrice(price, seasonalAdjustments);
    return `$${currentPrice.toFixed(2)}${currentPrice !== price ? ` (base: $${price.toFixed(2)})` : ''}`;
  };

  if (showForm) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
          </Text>
          <Button mode="text" onPress={resetForm}>Cancel</Button>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Plan Name *"
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              style={styles.input}
            />

            <TextInput
              label="Description *"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                label="Base Price ($) *"
                value={formData.basePrice?.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, basePrice: parseFloat(text) || 0 }))}
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
              />

              <TextInput
                label="Duration (minutes)"
                value={formData.estimatedDuration?.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(text) || 60 }))}
                keyboardType="numeric"
                style={[styles.input, styles.halfWidth]}
              />
            </View>

            <Text style={styles.label}>Frequency</Text>
            <View style={styles.chipContainer}>
              {['weekly', 'biweekly', 'monthly', 'quarterly', 'semi-annual', 'one-time'].map((freq) => (
                <Chip
                  key={freq}
                  selected={formData.frequency === freq}
                  onPress={() => setFormData(prev => ({ ...prev, frequency: freq as any }))}
                  style={styles.chip}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </Chip>
              ))}
            </View>

            <Text style={styles.label}>Services Included</Text>
            <View style={styles.row}>
              <TextInput
                label="Add Service"
                value={newService}
                onChangeText={setNewService}
                style={[styles.input, styles.expandedInput]}
                onSubmitEditing={addService}
              />
              <Button mode="contained" onPress={addService} style={styles.addButton}>
                Add
              </Button>
            </View>
            <View style={styles.chipContainer}>
              {formData.services?.map((service, index) => (
                <Chip
                  key={index}
                  onClose={() => removeService(index)}
                  style={styles.chip}
                >
                  {service}
                </Chip>
              ))}
            </View>

            <Text style={styles.label}>Required Skills</Text>
            <View style={styles.row}>
              <TextInput
                label="Add Skill"
                value={newSkill}
                onChangeText={setNewSkill}
                style={[styles.input, styles.expandedInput]}
                onSubmitEditing={addSkill}
              />
              <Button mode="contained" onPress={addSkill} style={styles.addButton}>
                Add
              </Button>
            </View>
            <View style={styles.chipContainer}>
              {formData.requiredSkills?.map((skill, index) => (
                <Chip
                  key={index}
                  onClose={() => removeSkill(index)}
                  style={styles.chip}
                >
                  {skill}
                </Chip>
              ))}
            </View>

            <View style={styles.switchContainer}>
              <Text>Active Plan</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
              />
            </View>

            <Text style={styles.label}>Seasonal Price Adjustments</Text>
            <View style={styles.seasonalContainer}>
              <TextInput
                label="Spring"
                value={formData.seasonalAdjustments?.spring?.toString()}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  seasonalAdjustments: {
                    ...prev.seasonalAdjustments!,
                    spring: parseFloat(text) || 1.0
                  }
                }))}
                keyboardType="numeric"
                style={styles.seasonalInput}
              />
              <TextInput
                label="Summer"
                value={formData.seasonalAdjustments?.summer?.toString()}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  seasonalAdjustments: {
                    ...prev.seasonalAdjustments!,
                    summer: parseFloat(text) || 1.0
                  }
                }))}
                keyboardType="numeric"
                style={styles.seasonalInput}
              />
              <TextInput
                label="Fall"
                value={formData.seasonalAdjustments?.fall?.toString()}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  seasonalAdjustments: {
                    ...prev.seasonalAdjustments!,
                    fall: parseFloat(text) || 1.0
                  }
                }))}
                keyboardType="numeric"
                style={styles.seasonalInput}
              />
              <TextInput
                label="Winter"
                value={formData.seasonalAdjustments?.winter?.toString()}
                onChangeText={(text) => setFormData(prev => ({
                  ...prev,
                  seasonalAdjustments: {
                    ...prev.seasonalAdjustments!,
                    winter: parseFloat(text) || 1.0
                  }
                }))}
                keyboardType="numeric"
                style={styles.seasonalInput}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            >
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscription Plans</Text>
        <Button mode="contained" onPress={() => setShowForm(true)}>
          Add Plan
        </Button>
      </View>

      {plans.map((plan) => (
        <Card key={plan.id} style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Chip selected={plan.isActive} style={styles.statusChip}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Chip>
              </View>
              <Menu
                visible={menuVisible[plan.id!]}
                onDismiss={() => toggleMenu(plan.id!)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    onPress={() => toggleMenu(plan.id!)}
                  />
                }
              >
                <Menu.Item onPress={() => handleEdit(plan)} title="Edit" />
                <Menu.Item onPress={() => handleDelete(plan.id!)} title="Delete" />
              </Menu>
            </View>

            <Text style={styles.description}>{plan.description}</Text>
            
            <View style={styles.planDetails}>
              <Text style={styles.detailText}>
                Frequency: {plan.frequency.charAt(0).toUpperCase() + plan.frequency.slice(1)}
              </Text>
              <Text style={styles.detailText}>
                Price: {formatPrice(plan.basePrice, plan.seasonalAdjustments)}
              </Text>
              <Text style={styles.detailText}>
                Duration: {plan.estimatedDuration} minutes
              </Text>
            </View>

            {plan.services && plan.services.length > 0 && (
              <View style={styles.servicesContainer}>
                <Text style={styles.servicesTitle}>Services:</Text>
                <View style={styles.chipContainer}>
                  {plan.services.map((service, index) => (
                    <Chip key={index} style={styles.serviceChip}>
                      {service}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      ))}

      {plans.length === 0 && !loading && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>No subscription plans created yet.</Text>
            <Button mode="contained" onPress={() => setShowForm(true)} style={styles.createFirstButton}>
              Create Your First Plan
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
  cardTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  servicesContainer: {
    marginTop: 8,
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
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  halfWidth: {
    flex: 1,
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
  seasonalContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  seasonalInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: 16,
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

export default SubscriptionPlans;