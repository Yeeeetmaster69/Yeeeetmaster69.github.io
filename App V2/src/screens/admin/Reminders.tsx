import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  FAB, 
  Portal,
  Modal,
  Button,
  TextInput,
  Surface,
  Card,
  IconButton,
  Menu,
  Chip,
  SegmentedButtons,
  Searchbar,
  Switch,
  RadioButton
} from 'react-native-paper';
import { 
  createAutomatedReminder,
  getScheduledReminders,
  scheduleJobReminders,
  schedulePaymentReminders,
  scheduleReviewReminders
} from '../../services/communications';
import { getClients } from '../../services/clients';
import { getWorkers } from '../../services/workers';
import { AutomatedReminder, ReminderType, NotificationChannel, Client, Worker } from '../../utils/types';

export default function AdminReminders({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reminders, setReminders] = useState<AutomatedReminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<AutomatedReminder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [templatesModalVisible, setTemplatesModalVisible] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'custom' as ReminderType,
    title: '',
    message: '',
    recipientId: '',
    recipientRole: 'client' as 'client' | 'worker',
    channels: ['push'] as NotificationChannel[],
    scheduledAt: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    isRecurring: false,
    recurringDays: 7,
    relatedEntityId: '',
    relatedEntityType: ''
  });

  const [menuVisible, setMenuVisible] = useState<{[key: string]: boolean}>({});

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'job_scheduled', label: 'Job Scheduled' },
    { value: 'payment_due', label: 'Payment Due' },
    { value: 'review_request', label: 'Review Request' },
    { value: 'custom', label: 'Custom' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'sent', label: 'Sent' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const reminderTypes = [
    { value: 'job_scheduled', label: 'Job Scheduled' },
    { value: 'payment_due', label: 'Payment Due' },
    { value: 'review_request', label: 'Review Request' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'subscription_renewal', label: 'Subscription Renewal' },
    { value: 'custom', label: 'Custom' },
  ];

  const channelOptions = [
    { value: 'push', label: 'Push' },
    { value: 'sms', label: 'SMS' },
    { value: 'email', label: 'Email' },
    { value: 'in_app', label: 'In-App' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterReminders();
  }, [searchQuery, filterType, filterStatus, reminders]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [remindersData, clientsData, workersData] = await Promise.all([
        getScheduledReminders(Date.now() + (30 * 24 * 60 * 60 * 1000)), // Next 30 days
        getClients(),
        getWorkers()
      ]);
      
      setReminders(remindersData);
      setClients(clientsData);
      setWorkers(workersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReminders = () => {
    let filtered = reminders;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(reminder => reminder.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(reminder => reminder.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(reminder =>
        reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reminder.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getRecipientName(reminder.recipientId, reminder.recipientRole).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReminders(filtered);
  };

  const resetForm = () => {
    setFormData({
      type: 'custom',
      title: '',
      message: '',
      recipientId: '',
      recipientRole: 'client',
      channels: ['push'],
      scheduledAt: new Date().toISOString().split('T')[0],
      scheduledTime: '09:00',
      isRecurring: false,
      recurringDays: 7,
      relatedEntityId: '',
      relatedEntityType: ''
    });
  };

  const handleCreate = async () => {
    try {
      const scheduledDateTime = new Date(`${formData.scheduledAt}T${formData.scheduledTime}`).getTime();
      const recurringInterval = formData.isRecurring ? formData.recurringDays * 24 * 60 * 60 * 1000 : undefined;
      
      await createAutomatedReminder({
        type: formData.type,
        title: formData.title,
        message: formData.message,
        recipientId: formData.recipientId,
        recipientRole: formData.recipientRole,
        channels: formData.channels,
        scheduledAt: scheduledDateTime,
        isRecurring: formData.isRecurring,
        recurringInterval,
        relatedEntityId: formData.relatedEntityId || undefined,
        relatedEntityType: formData.relatedEntityType || undefined
      });

      setCreateModalVisible(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const openMenu = (reminderId: string) => {
    setMenuVisible(prev => ({ ...prev, [reminderId]: true }));
  };

  const closeMenu = (reminderId: string) => {
    setMenuVisible(prev => ({ ...prev, [reminderId]: false }));
  };

  const getRecipientName = (recipientId: string, role: string) => {
    if (role === 'client') {
      const client = clients.find(c => c.id === recipientId);
      return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
    } else {
      const worker = workers.find(w => w.id === recipientId);
      return worker ? `${worker.firstName} ${worker.lastName}` : 'Unknown Worker';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#2196f3';
      case 'sent': return '#4caf50';
      case 'failed': return '#f44336';
      case 'cancelled': return '#757575';
      default: return '#757575';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const toggleChannel = (channel: NotificationChannel) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }));
  };

  const renderReminderCard = (reminder: AutomatedReminder) => (
    <Card key={reminder.id} style={styles.reminderCard}>
      <Card.Content>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderInfo}>
            <Text variant="titleMedium" style={styles.reminderTitle}>{reminder.title}</Text>
            <Text variant="bodyMedium" style={styles.recipientName}>
              To: {getRecipientName(reminder.recipientId, reminder.recipientRole)}
            </Text>
            <Text variant="bodySmall" style={styles.scheduledTime}>
              Scheduled: {formatDate(reminder.scheduledAt)}
            </Text>
          </View>
          <Menu
            visible={menuVisible[reminder.id!] || false}
            onDismiss={() => closeMenu(reminder.id!)}
            anchor={
              <IconButton 
                icon="dots-vertical" 
                onPress={() => openMenu(reminder.id!)}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                closeMenu(reminder.id!);
                // Handle edit
              }} 
              title="Edit" 
              leadingIcon="pencil"
            />
            <Menu.Item 
              onPress={() => {
                closeMenu(reminder.id!);
                // Handle cancel
              }} 
              title="Cancel" 
              leadingIcon="cancel"
              titleStyle={{ color: '#d32f2f' }}
            />
          </Menu>
        </View>

        <View style={styles.reminderDetails}>
          <View style={styles.detailRow}>
            <Chip 
              icon="circle" 
              mode="outlined" 
              compact
              style={[
                styles.detailChip,
                { backgroundColor: getStatusColor(reminder.status) + '20' }
              ]}
            >
              {reminder.status.toUpperCase()}
            </Chip>
            <Chip 
              icon="clipboard-text" 
              mode="outlined" 
              compact
              style={styles.detailChip}
            >
              {reminder.type.replace('_', ' ').toUpperCase()}
            </Chip>
            {reminder.isRecurring && (
              <Chip 
                icon="repeat" 
                mode="outlined" 
                compact
                style={styles.detailChip}
              >
                RECURRING
              </Chip>
            )}
          </View>

          <Text variant="bodySmall" style={styles.message} numberOfLines={2}>
            {reminder.message}
          </Text>

          <View style={styles.channelsContainer}>
            {reminder.channels.map((channel, index) => (
              <Chip 
                key={index}
                icon={getChannelIcon(channel)}
                mode="outlined" 
                compact
                style={styles.channelChip}
              >
                {channel.toUpperCase()}
              </Chip>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'push': return 'bell';
      case 'sms': return 'message-text';
      case 'email': return 'email';
      case 'in_app': return 'application';
      default: return 'bell';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search reminders..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filters}>
          <SegmentedButtons
            value={filterType}
            onValueChange={setFilterType}
            buttons={typeOptions.slice(0, 3)}
            style={styles.segmentedButtons}
          />
          <SegmentedButtons
            value={filterStatus}
            onValueChange={setFilterStatus}
            buttons={statusOptions.slice(0, 3)}
            style={styles.segmentedButtons}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Automated Reminders
          </Text>
          <Text variant="bodyMedium" style={styles.sectionSubtitle}>
            {filteredReminders.length} reminder(s) found
          </Text>
        </View>

        {filteredReminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No reminders found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Create automated reminders to improve communication
            </Text>
          </View>
        ) : (
          filteredReminders.map(renderReminderCard)
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <FAB
          icon="auto-fix"
          style={styles.secondaryFab}
          size="small"
          onPress={() => setTemplatesModalVisible(true)}
        />
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setCreateModalVisible(true)}
        />
      </View>

      {/* Create Reminder Modal */}
      <Portal>
        <Modal 
          visible={createModalVisible} 
          onDismiss={() => setCreateModalVisible(false)} 
          contentContainerStyle={styles.modal}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Create Automated Reminder
            </Text>

            <Text variant="labelMedium" style={styles.inputLabel}>Reminder Type</Text>
            <SegmentedButtons
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as ReminderType }))}
              buttons={reminderTypes.slice(0, 3)}
              style={styles.input}
            />
            <SegmentedButtons
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as ReminderType }))}
              buttons={reminderTypes.slice(3)}
              style={styles.input}
            />

            <TextInput
              label="Title"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Message"
              value={formData.message}
              onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
            />

            <Text variant="labelMedium" style={styles.inputLabel}>Recipient Type</Text>
            <SegmentedButtons
              value={formData.recipientRole}
              onValueChange={(value) => setFormData(prev => ({ ...prev, recipientRole: value as any, recipientId: '' }))}
              buttons={[
                { value: 'client', label: 'Client' },
                { value: 'worker', label: 'Worker' }
              ]}
              style={styles.input}
            />

            <Text variant="labelMedium" style={styles.inputLabel}>
              {formData.recipientRole === 'client' ? 'Client' : 'Worker'}
            </Text>
            <SegmentedButtons
              value={formData.recipientId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, recipientId: value }))}
              buttons={(formData.recipientRole === 'client' ? clients : workers)
                .slice(0, 4)
                .map(person => ({
                  value: person.id!,
                  label: `${person.firstName} ${person.lastName}`.slice(0, 10)
                }))}
              style={styles.input}
            />

            <View style={styles.row}>
              <TextInput
                label="Date"
                value={formData.scheduledAt}
                onChangeText={(text) => setFormData(prev => ({ ...prev, scheduledAt: text }))}
                style={[styles.input, styles.halfWidth]}
                mode="outlined"
              />
              <TextInput
                label="Time"
                value={formData.scheduledTime}
                onChangeText={(text) => setFormData(prev => ({ ...prev, scheduledTime: text }))}
                style={[styles.input, styles.halfWidth]}
                mode="outlined"
                placeholder="HH:MM"
              />
            </View>

            <Text variant="labelMedium" style={styles.inputLabel}>Notification Channels</Text>
            <View style={styles.channelSelector}>
              {channelOptions.map((channel) => (
                <View key={channel.value} style={styles.channelOption}>
                  <RadioButton
                    value={channel.value}
                    status={formData.channels.includes(channel.value as NotificationChannel) ? 'checked' : 'unchecked'}
                    onPress={() => toggleChannel(channel.value as NotificationChannel)}
                  />
                  <Text>{channel.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.switchContainer}>
              <Text variant="labelLarge">Recurring</Text>
              <Switch
                value={formData.isRecurring}
                onValueChange={(value) => setFormData(prev => ({ ...prev, isRecurring: value }))}
              />
            </View>

            {formData.isRecurring && (
              <TextInput
                label="Repeat every (days)"
                value={formData.recurringDays.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, recurringDays: parseInt(text) || 7 }))}
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
              />
            )}

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setCreateModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreate}
                style={styles.modalButton}
                disabled={!formData.title || !formData.message || !formData.recipientId}
              >
                Create Reminder
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
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
  filters: {
    gap: 8,
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
  reminderCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  recipientName: {
    color: '#666',
    marginTop: 4,
  },
  scheduledTime: {
    color: '#999',
    marginTop: 2,
  },
  reminderDetails: {
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
  message: {
    color: '#666',
  },
  channelsContainer: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  channelChip: {
    backgroundColor: '#e3f2fd',
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
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    gap: 12,
  },
  fab: {
    backgroundColor: '#2196f3',
  },
  secondaryFab: {
    backgroundColor: '#ff9800',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
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
  channelSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  channelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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