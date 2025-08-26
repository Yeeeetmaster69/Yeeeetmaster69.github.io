import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Text, 
  TextInput, 
  IconButton, 
  Surface, 
  Avatar,
  Card
} from 'react-native-paper';
import { Message, Chat } from '../../utils/types';

interface ChatScreenProps {
  navigation: any;
  route?: {
    params?: {
      chatId?: string;
      jobId?: string;
    };
  };
}

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChat();
  }, []);

  const loadChat = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from Firebase
      const mockChat: Chat = {
        id: route?.params?.chatId || 'chat1',
        participants: ['client1', 'admin1'],
        participantRoles: ['client', 'admin'],
        type: route?.params?.jobId ? 'job' : 'support',
        title: route?.params?.jobId ? 'Job Support' : 'General Support',
        isActive: true,
        createdAt: Date.now() - 86400000
      };

      const mockMessages: Message[] = [
        {
          id: '1',
          chatId: mockChat.id!,
          senderId: 'admin1',
          senderRole: 'admin',
          content: 'Hello! How can I help you today?',
          timestamp: Date.now() - 3600000,
          isRead: true,
          type: 'text'
        },
        {
          id: '2',
          chatId: mockChat.id!,
          senderId: 'client1',
          senderRole: 'client',
          content: 'Hi, I have a question about my upcoming job.',
          timestamp: Date.now() - 1800000,
          isRead: true,
          type: 'text'
        },
        {
          id: '3',
          chatId: mockChat.id!,
          senderId: 'admin1',
          senderRole: 'admin',
          content: 'Sure! What would you like to know?',
          timestamp: Date.now() - 900000,
          isRead: true,
          type: 'text'
        }
      ];

      setChat(mockChat);
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chat) return;

    const message: Message = {
      id: Date.now().toString(),
      chatId: chat.id!,
      senderId: 'client1', // Current user
      senderRole: 'client',
      content: newMessage.trim(),
      timestamp: Date.now(),
      isRead: false,
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // TODO: Send to Firebase
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwnMessage = (message: Message) => {
    return message.senderId === 'client1'; // Current user
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Surface style={styles.header} elevation={1}>
        <View style={styles.headerContent}>
          <Avatar.Icon size={40} icon="headset" style={styles.avatar} />
          <View style={styles.headerText}>
            <Text variant="titleMedium" style={styles.chatTitle}>
              {chat?.title || 'Support Chat'}
            </Text>
            <Text variant="bodySmall" style={styles.chatSubtitle}>
              {chat?.type === 'job' ? 'Job-related support' : 'General support'}
            </Text>
          </View>
        </View>
      </Surface>

      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map(message => (
          <View 
            key={message.id} 
            style={[
              styles.messageContainer,
              isOwnMessage(message) ? styles.ownMessage : styles.otherMessage
            ]}
          >
            <Card style={[
              styles.messageCard,
              isOwnMessage(message) ? styles.ownMessageCard : styles.otherMessageCard
            ]}>
              <Card.Content style={styles.messageContent}>
                {!isOwnMessage(message) && (
                  <Text variant="bodySmall" style={styles.senderName}>
                    Support Team
                  </Text>
                )}
                <Text variant="bodyMedium" style={[
                  styles.messageText,
                  isOwnMessage(message) ? styles.ownMessageText : styles.otherMessageText
                ]}>
                  {message.content}
                </Text>
                <Text variant="bodySmall" style={[
                  styles.messageTime,
                  isOwnMessage(message) ? styles.ownMessageTime : styles.otherMessageTime
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
              </Card.Content>
            </Card>
          </View>
        ))}
      </ScrollView>

      <Surface style={styles.inputContainer} elevation={2}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            mode="outlined"
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
          />
          <IconButton
            icon="send"
            mode="contained"
            onPress={sendMessage}
            disabled={!newMessage.trim()}
            style={styles.sendButton}
          />
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#2196f3',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  chatTitle: {
    fontWeight: '600',
  },
  chatSubtitle: {
    color: '#666',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageCard: {
    elevation: 1,
  },
  ownMessageCard: {
    backgroundColor: '#2196f3',
  },
  otherMessageCard: {
    backgroundColor: 'white',
  },
  messageContent: {
    padding: 12,
  },
  senderName: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#666',
  },
  messageText: {
    marginBottom: 4,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#1a1a1a',
  },
  messageTime: {
    fontSize: 11,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
  },
  sendButton: {
    marginBottom: 8,
  },
});