import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  Chip, 
  FAB,
  Portal,
  Dialog,
  DataTable,
  SegmentedButtons,
  IconButton
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import SkeletonLoader, { SkeletonCard } from '../../components/SkeletonLoader';
import { APP_CONFIG } from '../../config/env';

interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: string;
  dueDate: string;
  items: InvoiceItem[];
  description: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function InvoiceListScreen() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual Firestore query
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          clientId: 'client1',
          clientName: 'John Smith',
          amount: 250.00,
          status: 'sent',
          createdAt: '2024-01-15',
          dueDate: '2024-02-15',
          items: [
            { description: 'Kitchen faucet repair', quantity: 1, unitPrice: 150.00, total: 150.00 },
            { description: 'Parts and materials', quantity: 1, unitPrice: 100.00, total: 100.00 }
          ],
          description: 'Kitchen faucet repair and installation'
        },
        {
          id: '2',
          clientId: 'client2',
          clientName: 'Sarah Johnson',
          amount: 425.00,
          status: 'paid',
          createdAt: '2024-01-10',
          dueDate: '2024-02-10',
          items: [
            { description: 'Bathroom tile replacement', quantity: 20, unitPrice: 15.00, total: 300.00 },
            { description: 'Labor', quantity: 5, unitPrice: 25.00, total: 125.00 }
          ],
          description: 'Bathroom renovation - tile work'
        },
        {
          id: '3',
          clientId: 'client3',
          clientName: 'Mike Wilson',
          amount: 180.00,
          status: 'draft',
          createdAt: '2024-01-20',
          dueDate: '2024-02-20',
          items: [
            { description: 'Deck staining', quantity: 1, unitPrice: 180.00, total: 180.00 }
          ],
          description: 'Annual deck maintenance and staining'
        }
      ];
      
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      Alert.alert('Error', 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4caf50';
      case 'sent': return '#2196f3';
      case 'overdue': return '#f44336';
      case 'draft': return '#ff9800';
      case 'cancelled': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return 'check-circle';
      case 'sent': return 'send';
      case 'overdue': return 'alert-circle';
      case 'draft': return 'file-edit';
      case 'cancelled': return 'cancel';
      default: return 'help-circle';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateInvoice = () => {
    setShowCreateDialog(false);
    // Navigate to create invoice screen
    Alert.alert('Create Invoice', 'Navigate to invoice creation screen');
  };

  const handleInvoicePress = (invoice: Invoice) => {
    // Navigate to invoice detail screen
    Alert.alert('Invoice Details', `View details for invoice ${invoice.id}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SkeletonLoader width="40%" height={24} />
          <SkeletonLoader width="100%" height={40} style={styles.searchSkeleton} />
          <SkeletonLoader width="100%" height={40} style={styles.filterSkeleton} />
        </View>
        <ScrollView style={styles.content}>
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>Invoices</Text>
        
        <TextInput
          mode="outlined"
          placeholder="Search invoices..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          left={<TextInput.Icon icon="magnify" />}
          style={styles.searchInput}
        />

        <SegmentedButtons
          value={filterStatus}
          onValueChange={setFilterStatus}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'draft', label: 'Draft' },
            { value: 'sent', label: 'Sent' },
            { value: 'paid', label: 'Paid' },
          ]}
          style={styles.filterButtons}
        />
      </View>

      <ScrollView style={styles.content}>
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} style={styles.invoiceCard} onPress={() => handleInvoicePress(invoice)}>
            <Card.Content>
              <View style={styles.invoiceHeader}>
                <View style={styles.invoiceInfo}>
                  <Text variant="titleMedium" style={styles.clientName}>
                    {invoice.clientName}
                  </Text>
                  <Text variant="bodySmall" style={styles.invoiceDate}>
                    Created: {new Date(invoice.createdAt).toLocaleDateString()}
                  </Text>
                  <Text variant="bodySmall" style={styles.description}>
                    {invoice.description}
                  </Text>
                </View>
                
                <View style={styles.invoiceAmount}>
                  <Text variant="headlineSmall" style={styles.amount}>
                    ${invoice.amount.toFixed(2)}
                  </Text>
                  <Chip 
                    icon={getStatusIcon(invoice.status)}
                    style={[styles.statusChip, { backgroundColor: getStatusColor(invoice.status) }]}
                    textStyle={styles.statusText}
                  >
                    {invoice.status.toUpperCase()}
                  </Chip>
                </View>
              </View>
              
              <View style={styles.invoiceActions}>
                <Button 
                  mode="outlined" 
                  compact 
                  onPress={() => handleInvoicePress(invoice)}
                >
                  View Details
                </Button>
                
                {invoice.status === 'draft' && (
                  <Button 
                    mode="contained" 
                    compact
                    onPress={() => Alert.alert('Send Invoice', `Send invoice ${invoice.id}?`)}
                  >
                    Send
                  </Button>
                )}
                
                {invoice.status === 'sent' && (
                  <Button 
                    mode="contained" 
                    compact
                    onPress={() => Alert.alert('Mark Paid', `Mark invoice ${invoice.id} as paid?`)}
                  >
                    Mark Paid
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}
        
        {filteredInvoices.length === 0 && (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No invoices found
            </Text>
            <Text variant="bodySmall" style={styles.emptySubtext}>
              Create your first invoice to get started
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowCreateDialog(true)}
      />

      <Portal>
        <Dialog visible={showCreateDialog} onDismiss={() => setShowCreateDialog(false)}>
          <Dialog.Title>Create New Invoice</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              What type of invoice would you like to create?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onPress={() => Alert.alert('Quick Invoice', 'Create quick invoice')}>
              Quick Invoice
            </Button>
            <Button onPress={handleCreateInvoice} mode="contained">
              Detailed Invoice
            </Button>
          </Dialog.Actions>
        </Dialog>
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
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  searchInput: {
    marginBottom: 16,
  },
  searchSkeleton: {
    marginBottom: 16,
  },
  filterButtons: {
    marginBottom: 8,
  },
  filterSkeleton: {
    marginBottom: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  invoiceCard: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  invoiceInfo: {
    flex: 1,
    marginRight: 16,
  },
  clientName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  invoiceDate: {
    color: '#666',
    marginBottom: 4,
  },
  description: {
    color: '#888',
  },
  invoiceAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  invoiceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#888',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});