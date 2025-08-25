
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Surface,
  Card,
  RadioButton,
  Checkbox,
  Divider
} from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

const USER_TYPES = [
  {
    value: 'client',
    label: 'Homeowner/Client',
    description: 'I need handyman services for my home',
    icon: '🏠'
  },
  {
    value: 'worker',
    label: 'Handyman/Worker',
    description: 'I provide handyman services',
    icon: '🔧'
  }
];

export default function Signup({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState('client');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [agreeToMarketing, setAgreeToMarketing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing Information', 'Please enter your first and last name');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Missing Information', 'Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    if (!password) {
      Alert.alert('Missing Information', 'Please enter a password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Missing Information', 'Please enter your phone number');
      return false;
    }

    if (!agreeToTerms) {
      Alert.alert('Terms Required', 'Please agree to the Terms of Service to continue');
      return false;
    }

    return true;
  };

  const signup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: userType,
        agreeToMarketing,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        profileComplete: false
      };

      await setDoc(doc(db, 'users', cred.user.uid), userData);
      
      Alert.alert(
        'Account Created Successfully!',
        `Welcome to Handyman Pro! Your ${userType} account has been created. You can now start using the app.`,
        [
          {
            text: 'Get Started',
            onPress: () => {
              if (userType === 'worker') {
                navigation.navigate('RoleSelect');
              }
              // For clients, they'll be automatically navigated by auth state change
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'Account creation failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please sign in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Contact support.';
          break;
        default:
          errorMessage = error.message || 'Account creation failed. Please try again.';
      }
      
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: '', color: '#ccc' };
    if (password.length < 6) return { strength: 25, label: 'Weak', color: '#f44336' };
    if (password.length < 8) return { strength: 50, label: 'Fair', color: '#ff9800' };
    if (password.length < 12) return { strength: 75, label: 'Good', color: '#4caf50' };
    return { strength: 100, label: 'Strong', color: '#2e7d32' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <View style={styles.headerContent}>
          <Text style={styles.logo}>🔧</Text>
          <Text variant="headlineLarge" style={styles.appName}>
            Join Handyman Pro
          </Text>
          <Text variant="bodyMedium" style={styles.tagline}>
            Create your account to get started
          </Text>
        </View>
      </Surface>

      <View style={styles.content}>
        <Card style={styles.signupCard} elevation={3}>
          <Card.Content>
            {/* User Type Selection */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                I am a...
              </Text>
              
              <RadioButton.Group onValueChange={setUserType} value={userType}>
                {USER_TYPES.map((type) => (
                  <Card 
                    key={type.value} 
                    style={[
                      styles.typeCard,
                      userType === type.value && styles.selectedTypeCard
                    ]}
                    onPress={() => setUserType(type.value)}
                  >
                    <Card.Content style={styles.typeContent}>
                      <View style={styles.typeInfo}>
                        <Text style={styles.typeIcon}>{type.icon}</Text>
                        <View style={styles.typeText}>
                          <Text variant="titleSmall" style={[
                            styles.typeLabel,
                            userType === type.value && styles.selectedTypeLabel
                          ]}>
                            {type.label}
                          </Text>
                          <Text variant="bodySmall" style={styles.typeDescription}>
                            {type.description}
                          </Text>
                        </View>
                      </View>
                      <RadioButton value={type.value} />
                    </Card.Content>
                  </Card>
                ))}
              </RadioButton.Group>
            </View>

            <Divider style={styles.divider} />

            {/* Personal Information */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Personal Information
              </Text>
              
              <View style={styles.nameRow}>
                <TextInput
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  left={<TextInput.Icon icon="account" />}
                />
                <TextInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
              </View>

              <TextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                left={<TextInput.Icon icon="email" />}
                placeholder="your@email.com"
              />

              <TextInput
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                mode="outlined"
                style={styles.input}
                keyboardType="phone-pad"
                left={<TextInput.Icon icon="phone" />}
                placeholder="(555) 123-4567"
              />
            </View>

            <Divider style={styles.divider} />

            {/* Security */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Security
              </Text>
              
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                placeholder="Choose a strong password"
              />

              {password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthBar}>
                    <View 
                      style={[
                        styles.strengthFill, 
                        { 
                          width: `${passwordStrength.strength}%`,
                          backgroundColor: passwordStrength.color
                        }
                      ]} 
                    />
                  </View>
                  <Text variant="bodySmall" style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                    {passwordStrength.label}
                  </Text>
                </View>
              )}

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon 
                    icon={showConfirmPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                placeholder="Re-enter your password"
                error={confirmPassword.length > 0 && password !== confirmPassword}
              />

              {confirmPassword.length > 0 && password !== confirmPassword && (
                <Text variant="bodySmall" style={styles.errorText}>
                  Passwords do not match
                </Text>
              )}
            </View>

            <Divider style={styles.divider} />

            {/* Agreements */}
            <View style={styles.section}>
              <View style={styles.checkboxRow}>
                <Checkbox
                  status={agreeToTerms ? 'checked' : 'unchecked'}
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                />
                <Text variant="bodyMedium" style={styles.checkboxLabel}>
                  I agree to the{' '}
                  <Text style={styles.linkText}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </Text>
              </View>

              <View style={styles.checkboxRow}>
                <Checkbox
                  status={agreeToMarketing ? 'checked' : 'unchecked'}
                  onPress={() => setAgreeToMarketing(!agreeToMarketing)}
                />
                <Text variant="bodyMedium" style={styles.checkboxLabel}>
                  I want to receive updates and promotional emails
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <Button 
              mode="contained" 
              onPress={signup} 
              loading={loading}
              style={styles.signupButton}
              icon="account-plus"
            >
              Create Account
            </Button>

            <View style={styles.loginSection}>
              <Text variant="bodyMedium" style={styles.loginText}>
                Already have an account?
              </Text>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
              >
                Sign In
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text variant="titleMedium" style={styles.benefitsTitle}>
            What you get with Handyman Pro
          </Text>
          
          <View style={styles.benefitsList}>
            {userType === 'client' ? (
              <>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>✨</Text>
                  <Text variant="bodyMedium" style={styles.benefitText}>
                    Access to verified professionals
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>📱</Text>
                  <Text variant="bodyMedium" style={styles.benefitText}>
                    Real-time job tracking
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>💳</Text>
                  <Text variant="bodyMedium" style={styles.benefitText}>
                    Secure payment processing
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>💼</Text>
                  <Text variant="bodyMedium" style={styles.benefitText}>
                    Find jobs in your area
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>📊</Text>
                  <Text variant="bodyMedium" style={styles.benefitText}>
                    Track earnings and hours
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>🏆</Text>
                  <Text variant="bodyMedium" style={styles.benefitText}>
                    Build your reputation
                  </Text>
                </View>
              </>
            )}
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
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 40,
    marginBottom: 8,
  },
  appName: {
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tagline: {
    color: '#666',
  },
  content: {
    padding: 16,
  },
  signupCard: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  typeCard: {
    marginBottom: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTypeCard: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  typeContent: {
    paddingVertical: 8,
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  typeText: {
    flex: 1,
  },
  typeLabel: {
    fontWeight: '600',
    marginBottom: 2,
  },
  selectedTypeLabel: {
    color: '#2196f3',
  },
  typeDescription: {
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  passwordStrength: {
    marginTop: -12,
    marginBottom: 16,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 4,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
  },
  errorText: {
    color: '#f44336',
    marginTop: -12,
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
  linkText: {
    color: '#2196f3',
    textDecorationLine: 'underline',
  },
  signupButton: {
    backgroundColor: '#2196f3',
    marginVertical: 16,
    paddingVertical: 4,
  },
  loginSection: {
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    marginBottom: 8,
  },
  loginButton: {
    alignSelf: 'center',
  },
  benefitsSection: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  benefitText: {
    flex: 1,
    color: '#666',
  },
});
