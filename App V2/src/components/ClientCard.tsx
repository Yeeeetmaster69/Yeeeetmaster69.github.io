import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, Button, IconButton, Chip } from 'react-native-paper';
import { Client } from '../utils/types';

interface ClientCardProps {
  client: Client;
  onPress?: () => void;
  onCall?: () => void;
  onEmail?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function ClientCard({ client, onPress, onCall, onEmail, showActions = false, compact = false }: ClientCardProps) {
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatAddress = (client: Client) => {
    return `${client.address}, ${client.city}, ${client.state} ${client.zipCode}`;
  };

  return (
    <Card 
      style={styles.card} 
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Client: ${client.firstName} ${client.lastName}. Type: ${client.type}. ${client.email ? `Email: ${client.email}` : ''} ${client.phone ? `Phone: ${client.phone}` : ''}`}
      accessibilityHint="Tap to view client details"
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Avatar.Text 
              size={compact ? 40 : 56} 
              label={getInitials(client.firstName, client.lastName)}
              style={styles.avatar}
            />
          </View>
          
          <View style={styles.info}>
            <Text variant={compact ? "titleMedium" : "titleLarge"} style={styles.name}>
              {client.firstName} {client.lastName}
            </Text>
            
            <Chip 
              mode="outlined" 
              compact
              style={[styles.typeChip, { backgroundColor: client.type === 'commercial' ? '#e3f2fd' : '#f3e5f5' }]}
              textStyle={{ color: client.type === 'commercial' ? '#1976d2' : '#7b1fa2' }}
            >
              {client.type}
            </Chip>
            
            {!compact && (
              <>
                <Text variant="bodySmall" style={styles.contact}>
                  📧 {client.email}
                </Text>
                <Text variant="bodySmall" style={styles.contact}>
                  📞 {client.phone}
                </Text>
                <Text variant="bodySmall" style={styles.address} numberOfLines={2}>
                  📍 {formatAddress(client)}
                </Text>
              </>
            )}
          </View>

          {showActions && (
            <View style={styles.actions}>
              <IconButton 
                icon="phone" 
                mode="outlined" 
                size={20}
                onPress={onCall}
              />
              <IconButton 
                icon="email" 
                mode="outlined" 
                size={20}
                onPress={onEmail}
              />
            </View>
          )}
        </View>

        {!compact && (
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text variant="titleMedium" style={styles.statValue}>{client.totalJobs}</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Jobs</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleMedium" style={styles.statValue}>
                {formatCurrency(client.totalSpent)}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>Total Spent</Text>
            </View>
            {client.averageRating && (
              <View style={styles.statItem}>
                <Text variant="titleMedium" style={styles.statValue}>
                  ⭐ {client.averageRating.toFixed(1)}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>Rating</Text>
              </View>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    backgroundColor: '#6200ea',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
  },
  typeChip: {
    alignSelf: 'flex-start',
    height: 24,
    marginBottom: 4,
  },
  contact: {
    color: '#666',
  },
  address: {
    color: '#666',
  },
  actions: {
    flexDirection: 'column',
    gap: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
});