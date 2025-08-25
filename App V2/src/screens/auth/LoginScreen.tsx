
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Surface,
  Card,
  IconButton,
  Divider
} from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Navigation will be handled automatically by auth state change
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'Login failed. Please try again.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    // Demo credentials for quick testing
    const demoCredentials = {
      admin: { email: 'admin@handyman.com', password: 'admin123' },
      worker: { email: 'worker@handyman.com', password: 'worker123' },
      client: { email: 'client@handyman.com', password: 'client123' }
    };

    const creds = demoCredentials[role as keyof typeof demoCredentials];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Surface style={styles.header} elevation={1}>
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            <Text style={styles.logo}>🔧</Text>
            <Text variant="headlineLarge" style={styles.appName}>
              Handyman Pro
            </Text>
            <Text variant="bodyMedium" style={styles.tagline}>
              Professional Home Services
            </Text>
          </View>
        </View>
      </Surface>

      <View style={styles.content}>
        <Card style={styles.loginCard} elevation={3}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.welcomeTitle}>
              Welcome Back
            </Text>
            <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
              Sign in to your account to continue
            </Text>

            <View style={styles.formSection}>
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
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                autoComplete="password"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                placeholder="Your password"
              />

              <Button 
                mode="contained" 
                onPress={login} 
                loading={loading}
                style={styles.loginButton}
                icon="login"
              >
                Sign In
              </Button>

              <Button 
                mode="text" 
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotButton}
              >
                Forgot Password?
              </Button>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.signupSection}>
              <Text variant="bodyMedium" style={styles.signupText}>
                Don't have an account?
              </Text>
              <Button 
                mode="outlined" 
                onPress={() => navigation.navigate('Signup')}
                style={styles.signupButton}
                icon="account-plus"
              >
                Create Account
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Demo Login Section */}
        <Card style={styles.demoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.demoTitle}>
              Quick Demo Access
            </Text>
            <Text variant="bodySmall" style={styles.demoSubtitle}>
              Try the app with different user roles
            </Text>
            
            <View style={styles.demoButtons}>
              <Button 
                mode="outlined" 
                onPress={() => quickLogin('admin')}
                style={styles.demoButton}
                icon="shield-account"
                compact
              >
                Admin Demo
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => quickLogin('worker')}
                style={styles.demoButton}
                icon="account-hard-hat"
                compact
              >
                Worker Demo
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => quickLogin('client')}
                style={styles.demoButton}
                icon="account"
                compact
              >
                Client Demo
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text variant="titleMedium" style={styles.featuresTitle}>
            Why Choose Handyman Pro?
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text variant="bodyMedium" style={styles.featureText}>
                Verified professional handymen
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text variant="bodyMedium" style={styles.featureText}>
                Real-time job tracking & GPS
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💳</Text>
              <Text variant="bodyMedium" style={styles.featureText}>
                Secure payments & estimates
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🛡️</Text>
              <Text variant="bodyMedium" style={styles.featureText}>
                Insured & background-checked
              </Text>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <Card style={styles.supportCard}>
          <Card.Content>
            <View style={styles.supportContent}>
              <IconButton icon="help-circle" size={24} iconColor="#2196f3" />
              <View style={styles.supportText}>
                <Text variant="titleSmall" style={styles.supportTitle}>
                  Need Help?
                </Text>
                <Text variant="bodySmall" style={styles.supportDescription}>
                  Contact our 24/7 support team
                </Text>
              </View>
              <Button mode="text" compact>
                Get Help
              </Button>
            </View>
          </Card.Content>
        </Card>
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
    paddingVertical: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
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
  loginCard: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#2196f3',
    marginBottom: 12,
    paddingVertical: 4,
  },
  forgotButton: {
    alignSelf: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  signupSection: {
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    marginBottom: 12,
  },
  signupButton: {
    borderColor: '#2196f3',
  },
  demoCard: {
    backgroundColor: 'white',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  demoTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  demoSubtitle: {
    color: '#666',
    marginBottom: 16,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  demoButton: {
    flex: 1,
    minWidth: '30%',
  },
  featuresSection: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  featureText: {
    flex: 1,
    color: '#666',
  },
  supportCard: {
    backgroundColor: 'white',
  },
  supportContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportText: {
    flex: 1,
    marginLeft: 8,
  },
  supportTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  supportDescription: {
    color: '#666',
    marginTop: 2,
  },
});
