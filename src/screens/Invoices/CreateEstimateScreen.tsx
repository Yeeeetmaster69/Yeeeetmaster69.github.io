import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  TextInput, 
  Divider,
  DataTable,
  IconButton,
  Menu,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG } from '../../config/env';

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Estimate {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  projectDescription: string;
  items: EstimateItem[];
  notes: string;
  validUntil: string;
  total: number;
  tax: number;
  grandTotal: number;
}

export default function CreateEstimateScreen() {
  const { user } = useAuth();
  const [estimate, setEstimate] = useState<Estimate>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectDescription: '',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    notes: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    total: 0,
    tax: 0,
    grandTotal: 0,
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const taxRate = 0.08; // 8% tax rate - should come from config

  const updateItem = (index: number, field: keyof EstimateItem, value: string | number) => {
    const newItems = [...estimate.items];
    const item = { ...newItems[index] };
    
    if (field === 'quantity' || field === 'unitPrice') {
      item[field] = Number(value) || 0;
      item.total = item.quantity * item.unitPrice;
    } else {
      (item as any)[field] = value as string;
    }
    
    newItems[index] = item;
    
    const total = newItems.reduce((sum, item) => sum + item.total, 0);
    const tax = total * taxRate;
    const grandTotal = total + tax;
    
    setEstimate({
      ...estimate,
      items: newItems,
      total,
      tax,
      grandTotal,
    });
  };

  const addItem = () => {
    const newId = (estimate.items.length + 1).toString();
    setEstimate({
      ...estimate,
      items: [...estimate.items, { id: newId, description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (estimate.items.length > 1) {
      const newItems = estimate.items.filter((_, i) => i !== index);
      const total = newItems.reduce((sum, item) => sum + item.total, 0);
      const tax = total * taxRate;
      const grandTotal = total + tax;
      
      setEstimate({
        ...estimate,
        items: newItems,
        total,
        tax,
        grandTotal,
      });
    }
  };

  const handlePreview = () => {
    if (!estimate.clientName || !estimate.projectDescription || estimate.items.some(item => !item.description)) {
      Alert.alert('Incomplete Information', 'Please fill in all required fields');
      return;
    }
    setShowPreview(true);
  };

  const handleSave = async (action: 'draft' | 'send') => {
    setLoading(true);
    try {
      // Simulate API call to save estimate
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (action === 'draft') {
        Alert.alert('Success', 'Estimate saved as draft');
      } else {
        Alert.alert('Success', 'Estimate sent to client');
      }
      
      setShowPreview(false);
      // Navigate back or reset form
    } catch (error) {
      Alert.alert('Error', `Failed to ${action} estimate`);
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => (
    <Portal>
      <Dialog visible={showPreview} onDismiss={() => setShowPreview(false)} style={styles.previewDialog}>
        <Dialog.Title>Estimate Preview</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView>
            <View style={styles.previewContent}>
              <Text variant="headlineSmall" style={styles.previewTitle}>
                ESTIMATE
              </Text>
              
              <View style={styles.previewSection}>
                <Text variant="titleMedium">Client Information</Text>
                <Text>{estimate.clientName}</Text>
                <Text>{estimate.clientEmail}</Text>
                <Text>{estimate.clientPhone}</Text>
              </View>
              
              <View style={styles.previewSection}>
                <Text variant="titleMedium">Project Description</Text>
                <Text>{estimate.projectDescription}</Text>
              </View>
              
              <View style={styles.previewSection}>
                <Text variant="titleMedium">Items</Text>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Description</DataTable.Title>
                    <DataTable.Title numeric>Qty</DataTable.Title>
                    <DataTable.Title numeric>Price</DataTable.Title>
                    <DataTable.Title numeric>Total</DataTable.Title>
                  </DataTable.Header>
                  
                  {estimate.items.map((item, index) => (
                    <DataTable.Row key={index}>
                      <DataTable.Cell>{item.description}</DataTable.Cell>
                      <DataTable.Cell numeric>{item.quantity}</DataTable.Cell>
                      <DataTable.Cell numeric>${item.unitPrice.toFixed(2)}</DataTable.Cell>
                      <DataTable.Cell numeric>${item.total.toFixed(2)}</DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
                
                <View style={styles.totalsSection}>
                  <View style={styles.totalRow}>
                    <Text>Subtotal:</Text>
                    <Text>${estimate.total.toFixed(2)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text>Tax ({(taxRate * 100).toFixed(0)}%):</Text>
                    <Text>${estimate.tax.toFixed(2)}</Text>
                  </View>
                  <Divider style={styles.totalDivider} />
                  <View style={styles.totalRow}>
                    <Text variant="titleMedium">Total:</Text>
                    <Text variant="titleMedium">${estimate.grandTotal.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
              
              {estimate.notes && (
                <View style={styles.previewSection}>
                  <Text variant="titleMedium">Notes</Text>
                  <Text>{estimate.notes}</Text>
                </View>
              )}
              
              <View style={styles.previewSection}>
                <Text variant="bodySmall">
                  This estimate is valid until: {new Date(estimate.validUntil).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={() => setShowPreview(false)}>Edit</Button>
          <Button onPress={() => handleSave('draft')} loading={loading}>Save Draft</Button>
          <Button onPress={() => handleSave('send')} mode="contained" loading={loading}>Send to Client</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Card style={styles.section}>
          <Card.Title title="Client Information" />
          <Card.Content>
            <TextInput
              mode="outlined"
              label="Client Name *"
              value={estimate.clientName}
              onChangeText={(text) => setEstimate({ ...estimate, clientName: text })}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Email"
              value={estimate.clientEmail}
              onChangeText={(text) => setEstimate({ ...estimate, clientEmail: text })}
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Phone"
              value={estimate.clientPhone}
              onChangeText={(text) => setEstimate({ ...estimate, clientPhone: text })}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title title="Project Details" />
          <Card.Content>
            <TextInput
              mode="outlined"
              label="Project Description *"
              value={estimate.projectDescription}
              onChangeText={(text) => setEstimate({ ...estimate, projectDescription: text })}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title 
            title="Items" 
            right={(props) => (
              <IconButton {...props} icon="plus" onPress={addItem} />
            )}
          />
          <Card.Content>
            {estimate.items.map((item, index) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemHeader}>
                  <Text variant="titleSmall">Item {index + 1}</Text>
                  {estimate.items.length > 1 && (
                    <IconButton 
                      icon="delete" 
                      size={20} 
                      onPress={() => removeItem(index)}
                    />
                  )}
                </View>
                
                <TextInput
                  mode="outlined"
                  label="Description *"
                  value={item.description}
                  onChangeText={(text) => updateItem(index, 'description', text)}
                  style={styles.input}
                />
                
                <View style={styles.itemDetailsRow}>
                  <TextInput
                    mode="outlined"
                    label="Quantity"
                    value={item.quantity.toString()}
                    onChangeText={(text) => updateItem(index, 'quantity', text)}
                    keyboardType="numeric"
                    style={[styles.input, styles.quantityInput]}
                  />
                  <TextInput
                    mode="outlined"
                    label="Unit Price"
                    value={item.unitPrice.toString()}
                    onChangeText={(text) => updateItem(index, 'unitPrice', text)}
                    keyboardType="numeric"
                    style={[styles.input, styles.priceInput]}
                  />
                  <View style={styles.totalDisplay}>
                    <Text variant="bodySmall">Total</Text>
                    <Text variant="titleMedium">${item.total.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title title="Additional Information" />
          <Card.Content>
            <TextInput
              mode="outlined"
              label="Notes"
              value={estimate.notes}
              onChangeText={(text) => setEstimate({ ...estimate, notes: text })}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Valid Until"
              value={estimate.validUntil}
              onChangeText={(text) => setEstimate({ ...estimate, validUntil: text })}
              style={styles.input}
            />
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Title title="Estimate Total" />
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text>Subtotal:</Text>
              <Text>${estimate.total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Tax ({(taxRate * 100).toFixed(0)}%):</Text>
              <Text>${estimate.tax.toFixed(2)}</Text>
            </View>
            <Divider style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text variant="titleLarge">Total:</Text>
              <Text variant="titleLarge">${estimate.grandTotal.toFixed(2)}</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          mode="outlined" 
          onPress={handlePreview}
          style={styles.footerButton}
        >
          Preview
        </Button>
        <Button 
          mode="contained" 
          onPress={handlePreview}
          style={styles.footerButton}
        >
          Continue
        </Button>
      </View>

      {renderPreview()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  input: {
    marginBottom: 16,
  },
  itemRow: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fafafa',
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemDetailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  quantityInput: {
    flex: 1,
  },
  priceInput: {
    flex: 2,
  },
  totalDisplay: {
    alignItems: 'center',
    marginBottom: 16,
    minWidth: 80,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryDivider: {
    marginVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  previewDialog: {
    maxHeight: '80%',
  },
  previewContent: {
    padding: 16,
  },
  previewTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  previewSection: {
    marginBottom: 20,
  },
  totalsSection: {
    marginTop: 16,
    alignSelf: 'flex-end',
    minWidth: 200,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalDivider: {
    marginVertical: 8,
  },
});