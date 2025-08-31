import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { 
  Appbar, 
  Portal, 
  Dialog, 
  Button, 
  Text, 
  ProgressBar, 
  Menu,
  IconButton
} from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG } from '../../config/env';
import { useFocusEffect } from '@react-navigation/native';

export default function AdminPortalScreen() {
  const { user } = useAuth();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState(APP_CONFIG.adminPortalUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLoadingDialog, setShowLoadingDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [canGoBack])
  );

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
  };

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setLoading(false);
    setProgress(1);
  };

  const handleLoadProgress = ({ nativeEvent }: any) => {
    setProgress(nativeEvent.progress);
  };

  const handleError = (error: any) => {
    setLoading(false);
    setError('Failed to load admin portal. Please check your internet connection.');
    console.error('WebView error:', error);
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleGoHome = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
    setShowMenu(false);
  };

  const handleGoBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const handleOpenInBrowser = () => {
    Alert.alert(
      'Open in Browser',
      'This will open the admin portal in your default browser.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open', 
          onPress: () => {
            // In a real app, you'd use Linking.openURL(currentUrl)
            Alert.alert('Info', 'Would open in external browser');
          }
        }
      ]
    );
    setShowMenu(false);
  };

  // JavaScript code to inject authentication context
  const injectedJavaScript = `
    (function() {
      // Inject user context for admin portal
      window.handymanProUser = {
        uid: '${user?.uid}',
        email: '${user?.email}',
        role: '${user?.role}',
        timestamp: new Date().toISOString()
      };
      
      // Notify portal that user context is available
      window.dispatchEvent(new CustomEvent('handymanProUserLoaded', {
        detail: window.handymanProUser
      }));
      
      // Add custom styling for mobile
      const style = document.createElement('style');
      style.textContent = \`
        body { 
          margin: 0 !important; 
          padding: 0 !important;
          font-size: 14px !important;
        }
        .mobile-hidden { display: none !important; }
        .sidebar { width: 100% !important; }
        .main-content { margin-left: 0 !important; }
      \`;
      document.head.appendChild(style);
    })();
    true; // Required for iOS
  `;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleGoBack} disabled={!canGoBack} />
        <Appbar.Content title="Admin Portal" />
        <Appbar.Action 
          icon="refresh" 
          onPress={handleRefresh}
          disabled={loading}
        />
        <Menu
          visible={showMenu}
          onDismiss={() => setShowMenu(false)}
          anchor={
            <Appbar.Action 
              icon="dots-vertical" 
              onPress={() => setShowMenu(true)}
            />
          }
        >
          <Menu.Item onPress={handleGoHome} title="Home" leadingIcon="home" />
          <Menu.Item 
            onPress={handleGoForward} 
            title="Forward" 
            leadingIcon="arrow-right"
            disabled={!canGoForward}
          />
          <Menu.Item 
            onPress={handleOpenInBrowser} 
            title="Open in Browser" 
            leadingIcon="open-in-new" 
          />
        </Menu>
      </Appbar.Header>

      {loading && progress < 1 && (
        <ProgressBar progress={progress} style={styles.progressBar} />
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorTitle}>
            Connection Error
          </Text>
          <Text variant="bodyMedium" style={styles.errorMessage}>
            {error}
          </Text>
          <Button 
            mode="contained" 
            onPress={handleRefresh}
            style={styles.retryButton}
            icon="refresh"
          >
            Retry
          </Button>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onLoadProgress={handleLoadProgress}
          onError={handleError}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          bounces={false}
          scrollEnabled={true}
          // Allow file downloads (using onFileDownload event handler instead)
          onFileDownload={() => true}
          // Security settings
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          // User agent for mobile optimization
          userAgent="Mozilla/5.0 (Mobile; HandymanPro App) AppleWebKit/537.36"
          // Handle messages from web content
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              console.log('Message from web:', data);
              
              // Handle specific actions from the web portal
              if (data.action === 'notification') {
                Alert.alert('Portal Notification', data.message);
              } else if (data.action === 'logout') {
                Alert.alert(
                  'Logout',
                  'Are you sure you want to logout?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Logout', onPress: () => {
                      // Handle logout
                    }}
                  ]
                );
              }
            } catch (error) {
              console.log('Non-JSON message from web:', event.nativeEvent.data);
            }
          }}
        />
      )}

      <Portal>
        <Dialog visible={showLoadingDialog} dismissable={false}>
          <Dialog.Title>Loading Admin Portal</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Please wait while we load the admin portal...
            </Text>
            <ProgressBar indeterminate style={styles.dialogProgress} />
          </Dialog.Content>
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
  webview: {
    flex: 1,
  },
  progressBar: {
    height: 3,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    marginBottom: 16,
    textAlign: 'center',
    color: '#d32f2f',
  },
  errorMessage: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  retryButton: {
    marginTop: 16,
  },
  dialogProgress: {
    marginTop: 16,
  },
});