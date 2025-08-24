import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Share } from 'react-native';
import { 
  Text, 
  SegmentedButtons, 
  Surface, 
  Button,
  Card,
  List,
  Divider,
  IconButton
} from 'react-native-paper';
import StatsCard from '../../components/StatsCard';
import { Income } from '../../utils/types';

export default function AdminIncome({ navigation }: any) {
  const [timeFrame, setTimeFrame] = useState('today');
  const [incomeData, setIncomeData] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const timeFrameOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

  useEffect(() => {
    loadIncomeData();
  }, [timeFrame]);

  const loadIncomeData = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from Firebase
      const mockIncome: Income[] = [
        {
          id: '1',
          jobId: 'job1',
          clientId: 'client1',
          amount: 150,
          type: 'hourly',
          isPaid: true,
          paidAt: Date.now() - 3600000,
          paymentMethod: 'Credit Card',
          createdAt: Date.now() - 3600000
        },
        {
          id: '2',
          jobId: 'job2',
          clientId: 'client2',
          amount: 300,
          type: 'fixed',
          isPaid: true,
          paidAt: Date.now() - 86400000,
          paymentMethod: 'Check',
          createdAt: Date.now() - 86400000
        },
        {
          id: '3',
          jobId: 'job3',
          clientId: 'client3',
          amount: 75,
          type: 'materials',
          isPaid: false,
          createdAt: Date.now() - 172800000
        }
      ];
      setIncomeData(mockIncome);
    } catch (error) {
      console.error('Error loading income data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalsByTimeFrame = () => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    const oneMonthMs = 30 * oneDayMs;
    const oneYearMs = 365 * oneDayMs;

    let cutoffTime: number;
    switch (timeFrame) {
      case 'today':
        cutoffTime = now - oneDayMs;
        break;
      case 'week':
        cutoffTime = now - oneWeekMs;
        break;
      case 'month':
        cutoffTime = now - oneMonthMs;
        break;
      case 'year':
        cutoffTime = now - oneYearMs;
        break;
      default:
        cutoffTime = now - oneDayMs;
    }

    const filteredIncome = incomeData.filter(income => 
      income.createdAt && income.createdAt >= cutoffTime
    );

    const totalRevenue = filteredIncome.reduce((sum, income) => sum + income.amount, 0);
    const paidRevenue = filteredIncome
      .filter(income => income.isPaid)
      .reduce((sum, income) => sum + income.amount, 0);
    const pendingRevenue = totalRevenue - paidRevenue;

    return {
      total: totalRevenue,
      paid: paidRevenue,
      pending: pendingRevenue,
      jobCount: filteredIncome.length
    };
  };

  const getMonthlyBreakdown = () => {
    const monthlyData: { [key: string]: Income[] } = {};
    
    incomeData.forEach(income => {
      if (income.createdAt) {
        const date = new Date(income.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = [];
        }
        monthlyData[monthKey].push(income);
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 12); // Last 12 months
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  
  const formatMonthYear = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const exportIncomeReport = async () => {
    try {
      const totals = calculateTotalsByTimeFrame();
      const reportData = incomeData
        .filter(income => {
          const now = Date.now();
          const oneDayMs = 24 * 60 * 60 * 1000;
          let cutoffTime = 0;
          
          switch (timeFrame) {
            case 'today':
              cutoffTime = now - oneDayMs;
              break;
            case 'week':
              cutoffTime = now - (7 * oneDayMs);
              break;
            case 'month':
              cutoffTime = now - (30 * oneDayMs);
              break;
            case 'year':
              cutoffTime = now - (365 * oneDayMs);
              break;
          }
          
          return income.createdAt && income.createdAt >= cutoffTime;
        })
        .map(income => ({
          date: new Date(income.createdAt || 0).toLocaleDateString(),
          amount: income.amount,
          type: income.type,
          status: income.isPaid ? 'Paid' : 'Pending',
          paymentMethod: income.paymentMethod || 'N/A'
        }));

      const csvContent = [
        ['Date', 'Amount', 'Type', 'Status', 'Payment Method'],
        ...reportData.map(row => [row.date, row.amount, row.type, row.status, row.paymentMethod])
      ].map(row => row.join(',')).join('\n');

      const reportSummary = `Income Report (${timeFrame})\n\n` +
        `Total Revenue: $${totals.total.toFixed(2)}\n` +
        `Paid: $${totals.paid.toFixed(2)}\n` +
        `Pending: $${totals.pending.toFixed(2)}\n` +
        `Total Jobs: ${totals.jobCount}\n\n` +
        `Detailed Data:\n${csvContent}`;

      const result = await Share.share({
        message: reportSummary,
        title: `Income Report - ${timeFrame}`,
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Income report exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      Alert.alert('Error', 'Failed to export income report. Please try again.');
    }
  };

  const totals = calculateTotalsByTimeFrame();
  const monthlyBreakdown = getMonthlyBreakdown();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Income Dashboard
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track your business revenue and earnings
        </Text>
      </Surface>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Revenue Summary
          </Text>
          
          <SegmentedButtons
            value={timeFrame}
            onValueChange={setTimeFrame}
            buttons={timeFrameOptions}
            style={styles.segmentedButtons}
          />

          <View style={styles.statsGrid}>
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(totals.total)}
              subtitle={`${timeFrame} period`}
              icon="💰"
              color="#4caf50"
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatsCard
              title="Paid"
              value={formatCurrency(totals.paid)}
              subtitle="Collected"
              icon="✅"
              color="#2196f3"
            />
          </View>

          <View style={styles.statsGrid}>
            <StatsCard
              title="Pending"
              value={formatCurrency(totals.pending)}
              subtitle="Outstanding"
              icon="⏳"
              color="#ff9800"
            />
            <StatsCard
              title="Jobs"
              value={totals.jobCount}
              subtitle={`${timeFrame} period`}
              icon="📋"
              color="#9c27b0"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Monthly History
            </Text>
            <Button 
              mode="outlined" 
              compact
              onPress={() => navigation.navigate('IncomeHistory')}
            >
              View All
            </Button>
          </View>

          {monthlyBreakdown.map(([monthKey, monthIncome]) => {
            const monthTotal = monthIncome.reduce((sum, income) => sum + income.amount, 0);
            const monthPaid = monthIncome
              .filter(income => income.isPaid)
              .reduce((sum, income) => sum + income.amount, 0);
            const isExpanded = expandedMonth === monthKey;

            return (
              <Card key={monthKey} style={styles.monthCard}>
                <List.Item
                  title={formatMonthYear(monthKey)}
                  description={`${monthIncome.length} jobs • ${formatCurrency(monthPaid)} paid of ${formatCurrency(monthTotal)}`}
                  right={() => (
                    <View style={styles.monthRight}>
                      <Text variant="titleMedium" style={styles.monthTotal}>
                        {formatCurrency(monthTotal)}
                      </Text>
                      <IconButton
                        icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        onPress={() => setExpandedMonth(isExpanded ? null : monthKey)}
                      />
                    </View>
                  )}
                  onPress={() => setExpandedMonth(isExpanded ? null : monthKey)}
                />
                
                {isExpanded && (
                  <>
                    <Divider />
                    <View style={styles.monthDetails}>
                      {monthIncome.map((income, index) => (
                        <View key={income.id || index} style={styles.incomeItem}>
                          <View style={styles.incomeInfo}>
                            <Text variant="bodyMedium" style={styles.incomeType}>
                              {income.type.charAt(0).toUpperCase() + income.type.slice(1)} Payment
                            </Text>
                            <Text variant="bodySmall" style={styles.incomeDate}>
                              {new Date(income.createdAt!).toLocaleDateString()}
                            </Text>
                          </View>
                          <View style={styles.incomeAmount}>
                            <Text variant="titleSmall" style={[
                              styles.amount,
                              { color: income.isPaid ? '#4caf50' : '#ff9800' }
                            ]}>
                              {formatCurrency(income.amount)}
                            </Text>
                            <Text variant="bodySmall" style={styles.paymentStatus}>
                              {income.isPaid ? 'Paid' : 'Pending'}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </Card>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          
          <View style={styles.actionButtons}>
            <Button 
              mode="contained" 
              icon="plus"
              onPress={() => navigation.navigate('CreateInvoice')}
              style={styles.actionButton}
            >
              Create Invoice
            </Button>
            <Button 
              mode="outlined" 
              icon="file-document"
              onPress={() => navigation.navigate('Estimates')}
              style={styles.actionButton}
            >
              View Estimates
            </Button>
            <Button 
              mode="outlined" 
              icon="download"
              onPress={exportIncomeReport}
              style={styles.actionButton}
            >
              Export Report
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  monthCard: {
    marginBottom: 8,
    elevation: 1,
  },
  monthRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthTotal: {
    fontWeight: '600',
    color: '#2e7d32',
    marginRight: 8,
  },
  monthDetails: {
    padding: 16,
    paddingTop: 12,
  },
  incomeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  incomeInfo: {
    flex: 1,
  },
  incomeType: {
    fontWeight: '500',
  },
  incomeDate: {
    color: '#666',
    marginTop: 2,
  },
  incomeAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '600',
  },
  paymentStatus: {
    color: '#666',
    marginTop: 2,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});