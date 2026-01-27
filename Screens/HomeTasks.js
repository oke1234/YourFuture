import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import TaskItem from '../Functions/TaskItem';
import { styles } from '../styles';

export default function HomeTasks({
  isAddingTask,
  newTaskText,
  setNewTaskText,
  filteredSuggestions,
  setFilteredSuggestions,
  goals,
  getGoalColor,  // ← ADD THIS
  handleAddTask,
  handleAddSuggestionTask,
  setIsAddingTask,
  activeTasks,
  doneTasks,
  doneCollapsed,
  setDoneCollapsed,
  toggleCheckTask,
  updateSubtaskChecked,
  deleteSubtask,
  setSelectedTask,
  setEditedText,
  setEditedDesc,
  setSelectedSubtask,
  setEditedSubtaskText,
  setEditedSubtaskDesc,
  setSubtaskFromTaskModal,
  setCurrentPage,
  inputRef,
  tasks,
}) {
  const wrapperRef = useRef(null);

  const saveTaskIfNeeded = () => {
    if (newTaskText.trim()) {
      handleAddTask();
    }
    setIsAddingTask(false);
    setNewTaskText('');
    setFilteredSuggestions([]);
  };

  // Listen for keyboard dismiss
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (isAddingTask && newTaskText.trim()) {
          handleAddTask();
        }
        if (isAddingTask) {
          setIsAddingTask(false);
          setNewTaskText('');
          setFilteredSuggestions([]);
        }
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [isAddingTask, newTaskText]);

  useEffect(() => {
    if (isAddingTask) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isAddingTask]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={{ flex: 1 }}>
          {isAddingTask && (
            <View ref={wrapperRef} style={styles.taskInputWrapper}>
              <View style={styles.squareBox} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <TextInput
                  ref={inputRef}
                  placeholder="Type your task"
                  value={newTaskText}
                  onChangeText={(text) => {
                    setNewTaskText(text);
                    if (!text.length) {
                      setFilteredSuggestions(
                        goals.map((g) => `Goal - ${g.title}`)
                      );
                    } else {
                      setFilteredSuggestions(
                        goals
                          .map((g) => `Goal - ${g.title}`)
                          .filter((item) =>
                            item.toLowerCase().startsWith(text.toLowerCase())
                          )
                      );
                    }
                  }}
                  style={styles.underlineInput}
                  autoFocus
                  onSubmitEditing={() => {
                    if (newTaskText.trim()) {
                      handleAddTask();
                      setIsAddingTask(false);
                      setNewTaskText('');
                      setFilteredSuggestions([]);
                    }
                  }}
                  onBlur={() => {
                    // Save when input loses focus
                    setTimeout(() => {
                      if (newTaskText.trim()) {
                        handleAddTask();
                      }
                      setIsAddingTask(false);
                      setNewTaskText('');
                      setFilteredSuggestions([]);
                    }, 100);
                  }}
                />
                {filteredSuggestions.length > 0 && (
                  <View style={{ maxHeight: 120, marginTop: 5 }}>
                    {filteredSuggestions.map((item) => (
                      <Pressable
                        key={item}
                        onPress={() => handleAddSuggestionTask(item)}
                        style={{
                          padding: 8,
                          backgroundColor: '#eee',
                          marginBottom: 2,
                          borderRadius: 5,
                        }}
                      >
                        <Text>{item}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Active Tasks list */}
          {activeTasks.map((task) => {
            const originalIndex = tasks.findIndex(t => t === task);
            
            return (
              <TaskItem
                key={originalIndex}
                text={task.text}
                getGoalColor={getGoalColor}  // ← ADD THIS
                checked={false}
                subtitle={task.desc}
                subtasks={task.subtasks}
                onToggle={() => toggleCheckTask(originalIndex)}
                onToggleSubtask={(subIdx) => updateSubtaskChecked(originalIndex, subIdx)}
                onDeleteSubtask={(subIdx) => deleteSubtask(originalIndex, subIdx)}
                onPress={() => {
                  setSelectedTask(originalIndex);
                  setEditedText(task.text);
                  setEditedDesc(task.desc);
                  setCurrentPage('editTask');
                }}
                onPressSubtask={(subIdx) => {
                  setSelectedSubtask({ taskIdx: originalIndex, subIdx });
                  setEditedSubtaskText(task.subtasks[subIdx].text);
                  setEditedSubtaskDesc(task.subtasks[subIdx].desc || '');
                  setSubtaskFromTaskModal(false);
                  setCurrentPage('editSubtask');
                }}
              />
            );
          })}

          {/* Done toggle */}
          <TouchableOpacity
            onPress={() => setDoneCollapsed(!doneCollapsed)}
            style={{
              padding: 10,
              backgroundColor: 'white',
              marginTop: 20,
              marginHorizontal: 25,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: 'bold' }}>
              Done Tasks {doneCollapsed ? '▼' : '▲'}
            </Text>
          </TouchableOpacity>

          {/* Done Tasks list */}
          {!doneCollapsed &&
            doneTasks.map((task) => {
              const originalIndex = tasks.findIndex(t => t === task);
              
              return (
                <TaskItem
                  key={originalIndex}
                  text={task.text}
                  getGoalColor={getGoalColor}  // ← ADD THIS
                  checked={true}
                  subtitle={task.desc}
                  subtasks={task.subtasks}
                  onToggle={() => toggleCheckTask(originalIndex)}
                  onToggleSubtask={(subIdx) => updateSubtaskChecked(originalIndex, subIdx)}
                  onDeleteSubtask={(subIdx) => deleteSubtask(originalIndex, subIdx)}
                  onPress={() => {
                    setSelectedTask(originalIndex);
                    setEditedText(task.text);
                    setEditedDesc(task.desc);
                    setCurrentPage('editTask');
                  }}
                  onPressSubtask={(subIdx) => {
                    setSelectedSubtask({ taskIdx: originalIndex, subIdx });
                    setEditedSubtaskText(task.subtasks[subIdx].text);
                    setEditedSubtaskDesc(task.subtasks[subIdx].desc || '');
                    setSubtaskFromTaskModal(false);
                    setCurrentPage('editSubtask');
                  }}
                />
              );
            })}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}