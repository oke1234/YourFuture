import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, onValue, get, set } from 'firebase/database';
import { db } from '../firebase'; // adjust path
import NetInfo from '@react-native-community/netinfo';

export default function PageWithBack({
  currentPage,
  pageName,
  setCurrentPage,
  title,
  bio,
  type,
  archived,
  mlUser,
}) {
  const [profileChatPage, setProfileChatPage] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef();

  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!pageName) return;

    const msgRef = ref(db, `chats/${pageName}/messages`);
    const unsubscribe = onValue(msgRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : [];
      setMessages(prev => {
        // Merge and remove duplicates by _id
        const all = [...prev, ...data];
        const unique = all.filter((v, i, a) => a.findIndex(m => m._id === v._id) === i);
        return unique;
      });
    });

    return () => unsubscribe();
  }, [pageName]);


  useEffect(() => {
    if (!pageName) return;

    // Listen to messages in real-time
    const msgRef = ref(db, `chats/${pageName}/messages`);
    const unsubscribe = onValue(msgRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : [];
      setMessages(data);
    });

    return () => unsubscribe(); // clean up listener
  }, [pageName]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      _id: `${mlUser.id}_${Date.now()}`,
      senderName: mlUser.name || mlUser.id,
      text: inputText,
      timestamp: Date.now(),
    };

    setInputText(""); // clear input

    if (isOffline) {
      // Queue and show locally
      setOfflineQueue(prev => [...prev, newMsg]);
      setMessages(prev => [...prev, newMsg]);
    } else {
      // Send immediately
      const msgRef = ref(db, `chats/${pageName}/messages`);
      get(msgRef).then(snap => {
        const current = snap.exists() ? snap.val() : [];
        // Avoid duplicates
        const exists = current.find(m => m._id === newMsg._id);
        if (!exists) {
          set(msgRef, [...current, newMsg]);
        }
      });
    }
  };



  if (profileChatPage) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => setProfileChatPage(false)} style={{ marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Ionicons
            name={type === 'group' ? "people-circle" : "person-circle"}
            size={30}
            color={currentPage === 'profile' ? '#2772BC' : 'grey'}
          />
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 10 }}>{title}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text>This is the profile chat page for: {title}</Text>
          <Text style={{ marginTop: 10 }}>{bio}</Text>
        </View>
      </View>
    );
  }

  if (currentPage !== pageName) return null;

  return (
    <KeyboardAvoidingView
      style={{ height: Dimensions.get('window').height - 200 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <View style={{ flex: 1, padding: 20 }}>
        {/* Top row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => setCurrentPage(archived ? 'archived' : 'people')} style={{ marginRight: 10 }}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setProfileChatPage(true)}>
            <Ionicons name={type === 'group' ? "people-circle" : "person-circle"} size={30} color={currentPage === 'profile' ? '#2772BC' : 'grey'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setProfileChatPage(true)}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 10 }}>{title}</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1, backgroundColor: 'lightgrey', borderRadius: 10 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 ? (
              <Text style={{ color: 'grey', textAlign: 'center', marginTop: 20 }}>No messages yet</Text>
            ) : (
              messages.map((msg) => (
                <View key={msg._id} style={{ marginBottom: 10 }}>
                  <Text style={{ fontWeight: 'bold' }}>{msg.senderName}</Text>
                  <Text>{msg.text}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* Input */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 10, borderColor: '#ccc', backgroundColor: 'white' }}>
          <TextInput
            placeholder="Shoot a text"
            value={inputText}
            onChangeText={setInputText}
            style={{ flex: 1, height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 10, backgroundColor: 'white' }}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={sendMessage} style={{ marginLeft: 10 }}>
            <Ionicons name="send" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};