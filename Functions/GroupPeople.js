import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

export default function GroupPeople({ setCurrentPage, archived = false, items, setItems }) {
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const ellipsisRefs = useRef({});
  const [itemToDelete, setItemToDelete] = useState(null);

  const truncate = (text, max = 20) =>
    text.length > max ? text.slice(0, max) + '…' : text;

  // Filters
  const currentGroups = items.filter(
    (i) => i.type === 'group' && i.status === (archived ? 'archived' : 'active')
  );
  const currentPeople = items.filter(
    (i) =>
      i.type === 'person' && i.status === (archived ? 'archived' : 'active')
  );

  const moveItem = (pageName, newStatus) => {
    setItems((prev) =>
      prev.map((item) =>
        item.page === pageName ? { ...item, status: newStatus } : item
      )
    );
  };

  const deleteItem = (pageName) => {
    let deleted = null;
    setItems((prev) => {
      const updated = prev.filter((item) => {
        if (item.page === pageName) {
          deleted = { ...item, status: 'suggestion' };
          return false;
        }
        return true;
      });
      return deleted ? [deleted, ...updated] : updated;
    });
    closeMenu();
  };

  const openMenu = (page) => {
    ellipsisRefs.current[page]?.measureInWindow((x, y, width, height) => {
      setDropdownPosition({ x, y: y + height });
      setOpenMenuFor(page);
    });
  };

  const closeMenu = () => setOpenMenuFor(null);

  return (
    <>
      {currentGroups.map((group) => (
        <TouchableOpacity
          key={group.page}
          onPress={() => {
            setCurrentPage(group.page);
            closeMenu();
          }}>
          <View style={styles.textbox1}>
            <Ionicons name="people" size={24} color="grey" />
            <Text style={styles.box1text}>{truncate(group.name)}</Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <TouchableOpacity
                ref={(ref) => (ellipsisRefs.current[group.page] = ref)}
                onPress={() => openMenu(group.page)}>
                <Ionicons name="ellipsis-horizontal" size={20} color="grey" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {(currentGroups.length > 0 && currentPeople.length > 0) && (
        <View style={styles.dashedLine} />
      )}

      {currentGroups.length === 0 && currentPeople.length === 0 && (
        <Text style={{ 
          color: 'lightgray', 
          textAlign: 'center', 
          marginTop: 20, 
          fontSize: 16 
        }}>
          {archived ? 'No archived contacts' : 'No active contacts'}
        </Text>
      )}

      {currentPeople.map((person) => (
        <TouchableOpacity
          key={person.page}
          onPress={() => {
            setCurrentPage(person.page);
            closeMenu();
          }}>
          <View style={styles.textbox1}>
            <Ionicons
              name={person.icon || 'person-circle'}
              size={24}
              color="grey"
            />
            <Text style={styles.box1text}>{truncate(person.name)}</Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <TouchableOpacity
                ref={(ref) => (ellipsisRefs.current[person.page] = ref)}
                onPress={() => openMenu(person.page)}>
                <Ionicons name="ellipsis-horizontal" size={20} color="grey" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {confirmDelete && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ marginBottom: 15 }}>Are you sure?</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
              }}>
              <TouchableOpacity
                onPress={() => setConfirmDelete(false)}
                style={styles.modalButton}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  deleteItem(itemToDelete);
                  setConfirmDelete(false);
                  setItemToDelete(null);
                }}
                style={[styles.modalButton, { backgroundColor: 'red' }]}>
                <Text style={{ color: 'white' }}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Modal transparent visible={!!openMenuFor} onRequestClose={closeMenu}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={closeMenu}>
          <View
            style={[
              styles.dropdown,
              {
                position: 'absolute',
                top: dropdownPosition.y,
                left: dropdownPosition.x - 70,
                maxWidth: 110,
                elevation: 10,
                zIndex: 100,
              },
            ]}>
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                setItemToDelete(openMenuFor);
                closeMenu();
                setConfirmDelete(true);
              }}>
              <Text style={styles.text}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                moveItem(openMenuFor, archived ? 'active' : 'archived');
                closeMenu();
              }}>
              <Text style={styles.text}>
                {archived ? 'Unarchive' : 'Archive'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}