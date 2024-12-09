import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

export default function TravelChatbot() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    navigation.setOptions({
      headerShown: true,
      title: 'Travel Chatbot',
      headerStyle: {
        backgroundColor: '#ff6347', // changed to a warmer red
      },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  // Fetch user profile (for dynamic name)
  const fetchProfile = async () => {
    try {
      const response = await fetch('https://ade3-2401-4900-619b-b023-10d1-321a-a9e9-e77e.ngrok-free.app/view_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setName(data?.profile?.name || 'Guest');
        setMessages([
          { id: '1', text: `Hi ${data?.profile?.name || 'Guest'}! How can I assist you today?`, sender: 'bot' }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch profile data');
    }
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      id: String(Date.now()), // Generate unique ID using timestamp
      text: inputText,
      sender: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText(''); // Clear input field

    setIsLoading(true); // Show loader while fetching the response
    try {
      const response = await fetch('https://ade3-2401-4900-619b-b023-10d1-321a-a9e9-e77e.ngrok-free.app/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();

      if (data && data.response) {
        const botMessage = {
          id: String(Date.now() + 1),
          text: data.response,
          sender: 'bot',
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: String(Date.now() + 1),
          text: `Error: ${error.message}`,
          sender: 'bot',
        },
      ]);
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.chatbotText}>
        Welcome to your travel assistant chatbot. Ask me anything about travel planning!
      </Text>

      {/* Chat Window */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === 'user' ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        style={styles.chatWindow}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
      />

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="Type your message..."
          value={inputText}
          onChangeText={(text) => setInputText(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6347" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Changed background color to light gray
    padding: 20,
  },
  chatbotText: {
    fontSize: 18,
    fontFamily: 'sans-serif-medium',
    marginVertical: 10,
    color: '#333',
    textAlign: 'center',
  },
  chatWindow: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
    elevation: 3,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  botMessage: {
    backgroundColor: '#e1f5fe', // Light blue background for bot messages
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#ffcccb', // Light red background for user messages
    alignSelf: 'flex-end',
  },
  messageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 10,
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#ff6347', // Red send button to match header
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    transform: [{ translateX: -25 }],
  },
});
