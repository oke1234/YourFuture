import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ExpandableBlock from '../Functions/ExpandableBlock'; // adjust path

export default function TargetScreen({
  goals,
  expandedGoalIndex,
  handleGoalPress,
  handleEditGoal,
  setGoals,
}) {
  return (
    <View>
      {goals.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          There are no goals.{"\n"}
          Add goals by clicking the{" "}
          <Ionicons name="add-circle-outline" size={18} color="black" /> icon in the top right
        </Text>
      ) : (
        goals.map((goal, index) => (
          <ExpandableBlock
            key={index}
            goalTitle={goal.title}
            streakNumber={goal.streakNumber}
            Currentstreak={goal.Currentstreak}
            longeststreak={goal.longeststreak}
            consistency={goal.consistency}
            weekStreak={goal.weekStreak}
            weekConsistency={goal.weekConsistency}
            workoutCompleted={goal.workoutCompleted}
            expanded={expandedGoalIndex === index}
            onPress={() => handleGoalPress(index)}
            daysPerWeek={goal.daysPerWeek}
            onEditGoalPage={() => handleEditGoal(index)}
            goalDates={goal.dates}
            onDeleteGoal={() => {
            const updated = goals.filter((_, idx) => idx !== index);
            setGoals(updated); // now a plain array
            }}
            setGoalDates={(newDates) => {
              const updated = [...goals];
              updated[index].dates = newDates;
              setGoals(updated);
            }}
          />
        ))
      )}
    </View>
  );
}
