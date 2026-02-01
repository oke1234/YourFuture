import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import { countDone, countThisWeek } from './goalStats';
import { calculateStreaks } from './streakUtils';
import calculateWeekStreak from './calculateWeekStreak';
import  {Svg, Circle } from 'react-native-svg';

export default function ExpandableBlock({
  goalTitle,
  streakNumber,
  Currentstreak,
  longeststreak,
  consistency,
  weekStreak,
  weekConsistency,
  daysPerWeek,
  workoutCompleted,
  expanded,
  onPress,
  onDeleteGoal,
  onEditGoalPage,
  goalDates,
  color,
}) {
  const animation = useMemo(() => new Animated.Value(0), []);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const doneCount = countDone(goalDates, daysPerWeek);
  const doneThisWeek = countThisWeek(goalDates, daysPerWeek);

  const dropdownStyle = {
    position: 'absolute',
    top: 42,
    right: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'flex-start',
  };

  useEffect(() => {
    Animated.timing(animation, {
      toValue: expanded ? 1 : 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [expanded, animation]);

  useEffect(() => {
    if (!expanded) {
      setShowDropdown(false);
      setConfirmDelete(false);
    }
  }, [expanded]);

  const screenWidth = dimensions.width;
  const isTablet = screenWidth >= 768;
  
  const calendarWidth = isTablet ? screenWidth * 0.45 : screenWidth - 40;
  const cellSize = isTablet 
    ? Math.floor(calendarWidth / 8.5)
    : Math.min((screenWidth - 60) / 10, 38);  // ✅ Phone: smaller + more padding

  const inner = Math.round(cellSize * 0.75);
  const fontSize = Math.round(cellSize * 0.3);
  const fontSize2 = isTablet ? Math.round(cellSize * 0.4) : fontSize * 1.5;

  const containerHeight = isTablet 
    ? cellSize * 6.2 + 100
    : (expanded ? 355 : 270);

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(goalTitle);
  const [editDays, setEditDays] = useState(daysPerWeek.toString());

  const renderCalendar = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const totalCells = 35;

    let dayItems = [];

    for (let i = 0; i < totalCells; i++) {
      let day = null;
      let isCurrentMonth = true;

      if (i < firstDayWeekDay) {
        day = daysInPrevMonth - firstDayWeekDay + 1 + i;
        isCurrentMonth = false;
      } else if (i >= firstDayWeekDay + daysInMonth) {
        day = i - (firstDayWeekDay + daysInMonth) + 1;
        isCurrentMonth = false;
      } else {
        day = i - firstDayWeekDay + 1;
      }

      let cellYear = year;
      let cellMonth = month;

      if (i < firstDayWeekDay) {
        cellMonth = month - 1;
        if (cellMonth < 0) {
          cellMonth = 11;
          cellYear -= 1;
        }
      } else if (i >= firstDayWeekDay + daysInMonth) {
        cellMonth = month + 1;
        if (cellMonth > 11) {
          cellMonth = 0;
          cellYear += 1;
        }
      }

      const dayString = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const firstGoalDate = (goalDates && goalDates.length) 
        ? new Date(goalDates[0]) 
        : new Date();

      let isChecked = false;

      if (daysPerWeek === 0 && firstGoalDate) {
        const dayDateObj = new Date(dayString);
        const today = new Date();

        dayDateObj.setHours(0, 0, 0, 0);
        const firstGoalDateObj = new Date(firstGoalDate);
        firstGoalDateObj.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (dayDateObj >= firstGoalDateObj && dayDateObj <= today) {
          const hasCompletion = (goalDates || []).some(
            date => date.slice(0, 10) === dayString
          );
          isChecked = !hasCompletion;
        }
      } else {
        isChecked = (goalDates || []).some(
          date => date.slice(0, 10) === dayString
        );
      }

      dayItems.push(
        <View
          key={i}
          style={{
            width: cellSize,
            height: cellSize,
            borderRadius: cellSize / 2,
            backgroundColor: 'lightgrey',
            marginVertical: isTablet ? 2 : 2,  // ✅ Phone: 2px (was 1)
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isCurrentMonth ? 1 : 0.3,
          }}
        >
          <View
            style={{
              width: inner,
              height: inner,
              borderRadius: inner / 2,
              backgroundColor: isChecked ? 'lightgreen' : 'white',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Text
              style={{
                fontSize,
                color: 'grey',
                position: 'absolute',
                opacity: isChecked ? 0.4 : 1,
              }}
            >
              {day}
            </Text>
            {isChecked && (
              <Ionicons 
                name="checkmark" 
                size={Math.round(cellSize * 0.4)}
                color="darkgreen" 
              />
            )}
          </View>
        </View>
      );
    }

    return dayItems;
  };



  const StatsSection = () => {
    const progressPercentage = daysPerWeek > 0 
      ? Math.min((doneThisWeek / daysPerWeek) * 100, 100)
      : 0;

    const getDynamicColor = (value) => {
      if (value <= 20) return '#f44336';
      if (value <= 50) return '#ff9800';
      if (value <= 79) return '#ffeb3b';
      return '#4caf50';
    };

    const thisWeekColor = getDynamicColor(progressPercentage);
    const consistencyValue = parseInt(weekConsistency) || 0;
    const consistencyColor = getDynamicColor(consistencyValue);
    const weekStreakColor = '#4fc3f7';

    const CircleStat = ({ value, label, percentage, color }) => {
      const size = 70;
      const strokeWidth = 8;
      const radius = (size - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = circumference * (1 - percentage / 100);

      return (
        <View style={{ alignItems: 'center', flex: 1 }}>
          <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={size} height={size}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#e0e0e0"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            </Svg>

            {/* Value inside the circle */}
            <View style={{
              position: 'absolute',
              width: size,
              height: size,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color }}>{value}</Text>
            </View>
          </View>

          {/* Label outside, underneath */}
          <Text style={{ fontSize: 12, color: '#666', marginTop: 6, textAlign: 'center' }}>{label}</Text>
        </View>
      );
    };

    if (isTablet) {
      const circleSize = 310;
      const strokeWidth = 18;
      const radius = (circleSize - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const thisWeekOffset = circumference * (1 - progressPercentage / 100);

      return (
        <View style={{ paddingLeft: 20, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: circleSize, height: circleSize, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={circleSize} height={circleSize}>
              <Circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="#e0e0e0"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke={thisWeekColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={thisWeekOffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${circleSize / 2}, ${circleSize / 2}`}
              />
            </Svg>
            <View style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: [{ translateX: -circleSize/2 }, { translateY: -circleSize/2 }],
              width: circleSize,
              height: circleSize,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 16, color: '#999', marginBottom: 6 }}>This Week</Text>
              <Text style={{ fontSize: 42, fontWeight: 'bold', color: thisWeekColor, marginBottom: 20 }}>
                {doneThisWeek}/{daysPerWeek}
              </Text>
              <View style={{ width: 100, height: 1, backgroundColor: '#ddd', marginBottom: 16 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                <View style={{ alignItems: 'center', minWidth: 70 }}>
                  <Text style={{ fontSize: 36, fontWeight: 'bold', color: weekStreakColor }}>
                    {weekStreak}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#666', marginTop: 3 }}>
                    {weekStreak === 1 ? 'Week' : 'Weeks'}
                  </Text>
                </View>
                <View style={{ width: 1, height: 45, backgroundColor: '#ddd' }} />
                <View style={{ alignItems: 'center', minWidth: 70 }}>
                  <Text style={{ fontSize: 36, fontWeight: 'bold', color: consistencyColor }}>
                    {consistencyValue}%
                  </Text>
                  <Text style={{ fontSize: 13, color: '#666', marginTop: 3 }}>Rate</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    }

    const weekStreakPercentage = weekStreak > 0 ? 100 : 0;

    return (
      <View style={{ paddingLeft: 0, paddingTop: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <CircleStat value={`${doneThisWeek}/${daysPerWeek}`} label="This Week" percentage={progressPercentage} color={thisWeekColor} />
          <CircleStat value={weekStreak} label="Week Streak" percentage={weekStreakPercentage} color={weekStreakColor} />
          <CircleStat value={`${consistencyValue}%`} label="Consistency" percentage={consistencyValue} color={consistencyColor} />
        </View>
      </View>
    );
  };



  const CalendarSection = () => (
    <View style={{ 
      flex: isTablet ? undefined : 1,
      width: isTablet ? calendarWidth : '100%',
      paddingHorizontal: isTablet ? 0 : 0,  // ✅ Phone: 5px padding
    }}>
      <View style={{ 
        flexDirection: 'row', 
        width: '100%', 
        marginTop: isTablet ? 15 : 10,
        marginBottom: isTablet ? 8 : 8  // ✅ Phone: 8px (was 5)
      }}>
        {['Mo','Tu','We','Th','Fr','Sa','Su'].map((day, i) => (
          <Text
            key={i}
            style={{
              fontSize: fontSize2,
              fontWeight: 'bold',
              color: '#666',
              textAlign: 'center',
              width: `${100/7}%`,
            }}
          >
            {day}
          </Text>
        ))}
      </View>

      <View style={{ 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        width: '100%',
      }}>
        {renderCalendar().map((dayComponent, i) => (
          <View
            key={i}
            style={{
              width: `${100/7}%`,
              alignItems: 'center',
            }}
          >
            {dayComponent}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ position: 'relative' }}>
      {!goalTitle || goalTitle.trim() === "" ? (
        <Text>There are no goals</Text>
      ) : (
        <>
          {showDropdown && !confirmDelete && !editMode && (
            <View style={dropdownStyle}>
              <TouchableOpacity
                onPress={() => onEditGoalPage()} 
                style={{ padding: 10 }}
              >
                <Text style={{ color: 'blue' }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setConfirmDelete(true)}
                style={{ padding: 10 }}
              >
                <Text style={{ color: 'red' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          {confirmDelete && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={{ marginBottom: 15 }}>Are you sure?</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    width: '100%',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setConfirmDelete(false);
                      setShowDropdown(false);
                    }}
                    style={styles.modalButton}
                  >
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onDeleteGoal();
                      setConfirmDelete(false);
                      setShowDropdown(false);
                    }}
                    style={[styles.modalButton, { backgroundColor: 'red' }]}
                  >
                    <Text style={{ color: 'white' }}>Yes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity 
            onPress={isTablet ? undefined : onPress}
            activeOpacity={isTablet ? 1 : 0.2}
          >
            <View
              style={{
                padding: 20,
                marginBottom: 10,
                backgroundColor: "#eee",
                borderRadius: 10,
                minHeight: containerHeight,
                justifyContent: 'flex-start',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: isTablet ? 10 : 0,
                }}
              >
                <Text 
                  style={{ 
                    fontWeight: 'bold', 
                    fontSize: isTablet ? 50 : 25,
                    marginLeft: isTablet ? 15 : 0,
                    color: color 
                  }}
                >
                  {goalTitle}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {isTablet || expanded ? (
                    <TouchableOpacity
                      onPress={() => setShowDropdown(!showDropdown)}
                    >
                      <Ionicons 
                        name="ellipsis-horizontal" 
                        size={isTablet ? 28 : 24}
                        color="#000" 
                      />
                    </TouchableOpacity>
                  ) : (
                    <>
                      <Text style={{ fontWeight: 'bold', fontSize: 20 }}>
                        {doneCount}
                      </Text>
                      <Ionicons name="checkmark-sharp" size={25} color="green" />
                    </>
                  )}
                </View>
              </View>

              {isTablet ? (
                <View style={{ 
                  flexDirection: 'row', 
                  marginTop: 10,
                  alignItems: 'center',
                }}>
                  <CalendarSection />
                  
                  <View style={{ 
                    flex: 1,
                    justifyContent: 'center',
                    paddingLeft: 15,
                  }}>
                    <StatsSection />
                  </View>
                </View>
              ) : (
                <>
                  {expanded && (
                    <View style={{ marginTop: 10 }}>
                      <StatsSection />
                    </View>
                  )}
                  <CalendarSection />
                </>
              )}
            </View>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}