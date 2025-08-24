import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { 
  Surface, 
  Text, 
  IconButton, 
  Button, 
  Portal, 
  Modal,
  ActivityIndicator 
} from 'react-native-paper';
import { createCallSession, updateCallSession, endCallSession } from '../../services/communications';
import { CallSession, CallType } from '../../utils/types';

interface InAppCallComponentProps {
  userId: string;
  targetUserId: string;
  targetUserName: string;
  jobId?: string;
  onCallEnd?: () => void;
}

export default function InAppCallComponent({ 
  userId, 
  targetUserId, 
  targetUserName, 
  jobId,
  onCallEnd 
}: InAppCallComponentProps) {
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [incomingCallVisible, setIncomingCallVisible] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callType, setCallType] = useState<CallType>('voice');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callSession?.status === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callSession?.status]);

  const initiateCall = async (type: CallType) => {
    try {
      setIsConnecting(true);
      setCallType(type);

      const newCallSession = await createCallSession({
        initiatorId: userId,
        participantId: targetUserId,
        type,
        jobId,
        startedAt: Date.now()
      });

      setCallSession(newCallSession);
      setCallModalVisible(true);

      // Simulate ringing for 30 seconds
      setTimeout(() => {
        if (callSession?.status === 'initiated') {
          simulateCallAnswer();
        }
      }, 3000);

    } catch (error) {
      console.error('Error initiating call:', error);
      Alert.alert('Call Failed', 'Unable to start the call. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const simulateCallAnswer = async () => {
    if (!callSession?.id) return;

    try {
      await updateCallSession(callSession.id, {
        status: 'active',
        startedAt: Date.now()
      });

      setCallSession(prev => prev ? {
        ...prev,
        status: 'active',
        startedAt: Date.now()
      } : null);

      setCallDuration(0);
    } catch (error) {
      console.error('Error answering call:', error);
    }
  };

  const hangUpCall = async () => {
    if (!callSession?.id) return;

    try {
      const duration = callSession.status === 'active' ? callDuration : 0;
      
      await endCallSession(callSession.id, duration);

      setCallSession(null);
      setCallModalVisible(false);
      setCallDuration(0);
      
      if (onCallEnd) {
        onCallEnd();
      }

      Alert.alert(
        'Call Ended', 
        duration > 0 ? `Call duration: ${formatDuration(duration)}` : 'Call was not connected'
      );
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusText = () => {
    if (!callSession) return '';
    
    switch (callSession.status) {
      case 'initiated':
      case 'ringing':
        return `Calling ${targetUserName}...`;
      case 'active':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call ended';
      default:
        return '';
    }
  };

  const renderCallInterface = () => (
    <View style={styles.callInterface}>
      <View style={styles.callHeader}>
        <Text variant="headlineSmall" style={styles.callerName}>
          {targetUserName}
        </Text>
        <Text variant="bodyLarge" style={styles.callStatus}>
          {getCallStatusText()}
        </Text>
        <Text variant="bodyMedium" style={styles.callType}>
          {callType === 'video' ? '📹 Video Call' : '📞 Voice Call'}
        </Text>
      </View>

      {callSession?.status === 'initiated' && (
        <View style={styles.connectingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text variant="bodyMedium" style={styles.connectingText}>
            Connecting...
          </Text>
        </View>
      )}

      {callType === 'video' && callSession?.status === 'active' && (
        <View style={styles.videoContainer}>
          <Surface style={styles.remoteVideo} elevation={2}>
            <Text variant="bodyLarge" style={styles.videoPlaceholder}>
              {targetUserName}'s Video
            </Text>
          </Surface>
          <Surface style={styles.localVideo} elevation={3}>
            <Text variant="bodySmall" style={styles.videoPlaceholder}>
              Your Video
            </Text>
          </Surface>
        </View>
      )}

      <View style={styles.callControls}>
        {callSession?.status === 'active' && callType === 'video' && (
          <>
            <IconButton
              icon="microphone-off"
              iconColor="#fff"
              containerColor="#666"
              size={30}
              onPress={() => {/* Handle mute */}}
            />
            <IconButton
              icon="video-off"
              iconColor="#fff"
              containerColor="#666"
              size={30}
              onPress={() => {/* Handle video toggle */}}
            />
          </>
        )}
        
        <IconButton
          icon="phone-hangup"
          iconColor="#fff"
          containerColor="#f44336"
          size={40}
          onPress={hangUpCall}
        />

        {callSession?.status === 'active' && (
          <IconButton
            icon="volume-high"
            iconColor="#fff"
            containerColor="#666"
            size={30}
            onPress={() => {/* Handle speaker */}}
          />
        )}
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <Surface style={styles.callButtons} elevation={2}>
          <Text variant="titleMedium" style={styles.callTitle}>
            Contact {targetUserName}
          </Text>
          
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              icon="phone"
              onPress={() => initiateCall('voice')}
              disabled={isConnecting}
              style={styles.callButton}
              buttonColor="#4caf50"
            >
              Voice Call
            </Button>
            
            <Button
              mode="contained"
              icon="video"
              onPress={() => initiateCall('video')}
              disabled={isConnecting}
              style={styles.callButton}
              buttonColor="#2196f3"
            >
              Video Call
            </Button>
          </View>

          {jobId && (
            <Text variant="bodySmall" style={styles.jobNote}>
              Call related to current job
            </Text>
          )}
        </Surface>
      </View>

      {/* Call Modal */}
      <Portal>
        <Modal
          visible={callModalVisible}
          onDismiss={hangUpCall}
          contentContainerStyle={styles.callModal}
        >
          {renderCallInterface()}
        </Modal>
      </Portal>

      {/* Incoming Call Modal (for demonstration) */}
      <Portal>
        <Modal
          visible={incomingCallVisible}
          contentContainerStyle={styles.incomingCallModal}
        >
          <View style={styles.incomingCallInterface}>
            <Text variant="headlineMedium" style={styles.incomingTitle}>
              Incoming Call
            </Text>
            <Text variant="titleLarge" style={styles.incomingCaller}>
              {targetUserName}
            </Text>
            <Text variant="bodyMedium" style={styles.incomingType}>
              📞 Voice Call
            </Text>

            <View style={styles.incomingControls}>
              <IconButton
                icon="phone-hangup"
                iconColor="#fff"
                containerColor="#f44336"
                size={40}
                onPress={() => setIncomingCallVisible(false)}
              />
              <IconButton
                icon="phone"
                iconColor="#fff"
                containerColor="#4caf50"
                size={40}
                onPress={() => {
                  setIncomingCallVisible(false);
                  simulateCallAnswer();
                }}
              />
            </View>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  callButtons: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  callTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  callButton: {
    flex: 1,
  },
  jobNote: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  callModal: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  callInterface: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  callHeader: {
    alignItems: 'center',
    marginTop: 60,
  },
  callerName: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  callStatus: {
    color: '#ccc',
    marginBottom: 4,
  },
  callType: {
    color: '#999',
  },
  connectingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  connectingText: {
    color: '#ccc',
    marginTop: 16,
  },
  videoContainer: {
    flex: 1,
    marginVertical: 40,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideo: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    backgroundColor: '#222',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    color: '#666',
    textAlign: 'center',
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 40,
  },
  incomingCallModal: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomingCallInterface: {
    alignItems: 'center',
    padding: 40,
  },
  incomingTitle: {
    color: '#fff',
    marginBottom: 20,
  },
  incomingCaller: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  incomingType: {
    color: '#ccc',
    marginBottom: 40,
  },
  incomingControls: {
    flexDirection: 'row',
    gap: 40,
  },
});