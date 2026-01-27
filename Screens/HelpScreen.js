import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HelpScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Help Icon and Title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
        <Ionicons name="information-circle" size={80} color="#2772BC" />
        <View style={{ marginLeft: 15 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold' }}>Help</Text>
          <Text style={{ fontSize: 14, color: '#555' }}>How to use the app effectively</Text>
        </View>
      </View>

      {/* Scrollable Help Sections */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, minHeight: 300}}>
        <View
          style={{
            height: 100,
            backgroundColor: '#DB4A2B',
            borderRadius: 10,
            marginBottom: 15,
            padding: 15,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Tasks</Text>
          <Text style={{ color: 'white', marginTop: 5 }}>
            Create tasks using the plus icon on the top right on the main screen. Tap to add details or subtasks.
          </Text>
        </View>

        <View
          style={{
            height: 100,
            backgroundColor: '#2772BC',
            borderRadius: 10,
            padding: 15,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Navigation</Text>
          <Text style={{ color: 'white', marginTop: 5 }}>
            Use the bottom menu to switch pages.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
