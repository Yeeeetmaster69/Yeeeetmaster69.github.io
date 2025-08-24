import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  Surface, 
  Switch, 
  SegmentedButtons,
  Card,
  Button,
  Divider
} from 'react-native-paper';
import { useThemeConfig } from '../../context/ThemeContext';
import { useAccessibility } from '../../utils/accessibility';

export default function AccessibilitySettings({ navigation }: any) {
  const { themeConfig, setThemeConfig, isAccessibilityEnabled } = useThemeConfig();
  const { announceForAccessibility, showAccessibleAlert } = useAccessibility();

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'standard', label: 'Standard' },
    { value: 'large', label: 'Large' },
    { value: 'extraLarge', label: 'Extra Large' },
  ];

  const handleHighContrastToggle = () => {
    const newValue = !themeConfig.highContrast;
    setThemeConfig({ highContrast: newValue });
    announceForAccessibility(
      newValue ? 'High contrast mode enabled' : 'High contrast mode disabled'
    );
  };

  const handleFontSizeChange = (fontSize: string) => {
    setThemeConfig({ fontSize: fontSize as any });
    announceForAccessibility(`Font size changed to ${fontSize}`);
  };

  const testAccessibility = () => {
    showAccessibleAlert(
      'Accessibility Test',
      'This alert demonstrates accessible messaging with good contrast and clear text. Your current settings are working properly.',
      [
        { text: 'Great!', onPress: () => announceForAccessibility('Accessibility test completed') }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          Accessibility Settings
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Customize the app for better visibility and usability
        </Text>
      </Surface>

      <View style={styles.content}>
        {/* Current Status */}
        <Card style={styles.statusCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Current Accessibility Status
            </Text>
            <View style={styles.statusRow}>
              <Text variant="bodyLarge">Screen Reader:</Text>
              <Text variant="bodyLarge" style={styles.statusValue}>
                {isAccessibilityEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text variant="bodyLarge">High Contrast:</Text>
              <Text variant="bodyLarge" style={styles.statusValue}>
                {themeConfig.highContrast ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text variant="bodyLarge">Font Size:</Text>
              <Text variant="bodyLarge" style={styles.statusValue}>
                {themeConfig.fontSize}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Display Settings
          </Text>
          
          <Card style={styles.settingCard}>
            <Card.Content>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text variant="titleMedium">High Contrast Mode</Text>
                  <Text variant="bodyMedium" style={styles.settingDescription}>
                    Improves visibility with higher contrast colors
                  </Text>
                </View>
                <Switch
                  value={themeConfig.highContrast}
                  onValueChange={handleHighContrastToggle}
                  accessibilityLabel="Toggle high contrast mode"
                  accessibilityHint="Switches between standard and high contrast color themes"
                />
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.settingCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.settingTitle}>
                Font Size
              </Text>
              <Text variant="bodyMedium" style={styles.settingDescription}>
                Choose the text size that's most comfortable for you
              </Text>
              <SegmentedButtons
                value={themeConfig.fontSize}
                onValueChange={handleFontSizeChange}
                buttons={fontSizeOptions}
                style={styles.segmentedButtons}
                accessibilityLabel="Font size selector"
              />
            </Card.Content>
          </Card>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Tips for Better Accessibility
          </Text>
          
          <Card style={styles.tipsCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.tipText}>
                • Enable your device's screen reader (TalkBack on Android, VoiceOver on iOS) for voice navigation
              </Text>
              <Text variant="bodyLarge" style={styles.tipText}>
                • Use high contrast mode if you have difficulty seeing text
              </Text>
              <Text variant="bodyLarge" style={styles.tipText}>
                • Increase font size if text appears too small
              </Text>
              <Text variant="bodyLarge" style={styles.tipText}>
                • All buttons and interactive elements are designed to be large enough for easy tapping
              </Text>
              <Text variant="bodyLarge" style={styles.tipText}>
                • Voice commands and dictation work with text input fields
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Test Button */}
        <View style={styles.section}>
          <Button
            mode="contained"
            onPress={testAccessibility}
            style={styles.testButton}
            contentStyle={styles.testButtonContent}
            accessibilityLabel="Test accessibility features"
            accessibilityHint="Opens a sample alert to test current accessibility settings"
          >
            Test Accessibility Features
          </Button>
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
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.8,
  },
  content: {
    padding: 16,
  },
  statusCard: {
    marginBottom: 24,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusValue: {
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  settingCard: {
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    marginBottom: 8,
  },
  settingDescription: {
    opacity: 0.8,
    marginBottom: 16,
  },
  segmentedButtons: {
    marginTop: 8,
  },
  tipsCard: {
    backgroundColor: '#e8f5e8',
  },
  tipText: {
    marginBottom: 12,
    lineHeight: 24,
  },
  testButton: {
    marginTop: 16,
  },
  testButtonContent: {
    paddingVertical: 8,
  },
});