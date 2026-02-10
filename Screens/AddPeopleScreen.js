import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ExpandableGroup from '../Functions/ExpandableGroup'; // make sure path is correct

export default function AddPeopleScreen({
  search,
  setSearch,
  filteredList,
  suggestions,
  expandedTitle,
  onToggle,
  handleAddAndMove,
  setCurrentPage,
  userBio,
}) {
  return (
    <View style={{ minHeight: Dimensions.get('window').height, flexGrow: 1, padding: 20 }}>
      {/* Back bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => setCurrentPage('people')}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 10 }}>Add People</Text>
      </View>

      {/* Search bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderColor: '#ccc',
          borderWidth: 1,
          borderRadius: 10,
          paddingHorizontal: 10,
          height: 40,
          marginBottom: 15,
        }}
      >
        <TextInput
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, borderWidth: 0, outlineStyle: 'none' }}
        />
        <Ionicons name="search" size={20} color="grey" />
      </View>

      {/* Content */}
      {search.length > 0 ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <ExpandableGroup
                key={item.page}
                item={item}
                onAddUser={handleAddAndMove}
                expanded={expandedTitle === item.page}
                onToggle={() => onToggle(item.page)}
                setCurrentPage={setCurrentPage}
              />
            ))
          ) : (
            <Text style={{ padding: 20, textAlign: 'center' }}>No users found</Text>
          )}
        </ScrollView>
      ) : (
        <>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>Suggested:</Text>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 500 }} showsVerticalScrollIndicator={false}>
            {suggestions.map((item) => (
              <ExpandableGroup
                key={item.page}
                item={item}
                onAddUser={handleAddAndMove}
                expanded={expandedTitle === item.page}
                onToggle={() => onToggle(item.page)}
                setCurrentPage={setCurrentPage}
              />
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
