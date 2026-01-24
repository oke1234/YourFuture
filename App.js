import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  Modal,
  Animated,
  FlatList,
  Pressable,
  Keyboard,
  Dimensions,
  Button
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Alert } from 'react-native'; // Add these
import NetInfo from '@react-native-community/netinfo';

import { styles } from './styles'; // <- import styles
import { runMatching } from "./runMatching"; // Algorithm

import useTasks from './Const/useTasks';
import { ErrorOverlay } from './Const/Overlay'; // adjust the path if needed
import { OfflineIndicator } from './Const/OfflineIndicator'; // adjust path

// --- IMPORTS (functions) FOR COMPRIMIZING ---
import GroupPeople from './Functions/GroupPeople';
import PageWithBack from './Functions/PageWithBack';
import ExpandableGroup from './Functions/ExpandableGroup';
import TaskItem from './Functions/TaskItem';
import ArchivedBar from './Functions/ArchivedBar';
import ExpandableBlock from './Functions/ExpandableBlock';
import { countDone, countThisWeek } from './Functions/goalStats';
import { calculateStreaks } from './Functions/streakUtils';
import calculateWeekStreak from './Functions/calculateWeekStreak';

// --- IMPORTS (Pages) FOR COMPRIMIZING ---
import AddPeopleScreen from './Screens/AddPeopleScreen';
import HelpScreen from './Screens/HelpScreen';
import ArchivedScreen from './Screens/ArchivedScreen';
import TargetScreen from './Screens/TargetScreen';
import AddGoalScreen from './Screens/AddGoalScreen';
import EditGoalScreen from './Screens/EditGoalScreen';
import HomeTasks from './Screens/HomeTasks';
import ProfilePage from './Screens/ProfilePage';
import EditTaskPage from './Screens/EditTaskPage';
import EditSubtaskPage from './Screens/EditSubtaskPage';

// --- FIREBASE IMPORTS & CONFIGURATION START ---
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { getDatabase, ref, set, update, push, child , onValue , get , remove } from "firebase/database";
import { signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBCVfUpTplRIqiLAcgHrc5VVA7LO6T_Bbc",
  authDomain: "messages1-fb178.firebaseapp.com",
  databaseURL: "https://messages1-fb178-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "messages1-fb178",
  storageBucket: "messages1-fb178.firebasestorage.app",
  messagingSenderId: "714454103672",
  appId: "1:714454103672:web:9aa14f39038c7671b01f8d",
  measurementId: "G-FQN9B0BTME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); 
const auth = getAuth(app);

// Initialize Database (na initializeApp)
const db = getDatabase(app);
const screenHeight = Dimensions.get('window').height;
// Add after your Firebase config

export default function App() {
  // ==================== STATE: ERROR & LOADING ====================
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ← ADD THIS LINE

  const [goals, setGoals] = useState([]); // ← Leeg, wordt uit Firebase geladen

  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [expandedTitle, setExpandedTitle] = useState(null);
  const [expandedGoalIndex, setExpandedGoalIndex] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editedText, setEditedText] = useState('');
  const [editedDesc, setEditedDesc] = useState('');
  const [subtaskFromTaskModal, setSubtaskFromTaskModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDays, setNewGoalDays] = useState('');

  // Add this useEffect in your App.js after the useTasks hook

// In App.js, update the destructuring from useTasks:
  const {
    tasks,
    setTasks, 
    activeTasks, // NEW
    doneTasks, // NEW (computed from tasks)
    doneCollapsed,
    selectedSubtask,
    editedSubtaskText,
    editedSubtaskDesc,
    showSubtaskDropdown,
    addingTask,
    newTaskText,
    newTaskDesc,
    filteredSuggestions,
    setFilteredSuggestions, 
    setDoneCollapsed,
    setSelectedSubtask,
    setEditedSubtaskText,
    setEditedSubtaskDesc,
    setShowSubtaskDropdown,
    setAddingTask,
    setNewTaskText,
    setNewTaskDesc,
    saveSubtaskInline,
    updateSubtaskChecked,
    deleteSubtask,
    handleAddSuggestionTask,
    handleAddTask,
    handleDelete,
    toggleCheckTask,
    // REMOVED: toggleUncheckDoneTask - no longer exists
  } = useTasks({   
    setGoals,
    calculateStreaks,
    setWorkoutCompleted,
    setIsAddingTask,
    setShowAddSubtask,
    setSelectedTask,
    setEditedText,
    setEditedDesc,
    setNewTaskText,
    setFilteredSuggestions,
    setCurrentPage,
  });

  // ADD THIS NEW EFFECT TO SYNC TASKS TO FIREBASE
  useEffect(() => {
    if (!userId || !tasks) return;
    
    const saveTasksToFirebase = async () => {
      try {
        await set(ref(db, `users/${userId}/tasks`), tasks);
        console.log("✅ Tasks saved to Firebase");
      } catch (err) {
        console.error("❌ Error saving tasks to Firebase:", err);
        setError("Failed to save tasks");
      }
    };

    // Debounce the save to avoid too many writes
    const timer = setTimeout(saveTasksToFirebase, 500);
    return () => clearTimeout(timer);
  }, [tasks, userId]);

  // ADD THIS NEW EFFECT TO LOAD TASKS FROM FIREBASE ON STARTUP
  useEffect(() => {
    if (!userId) return;
    
    const loadTasksFromFirebase = async () => {
      try {
        const snapshot = await get(ref(db, `users/${userId}/tasks`));
        if (snapshot.exists()) {
          const loadedTasks = snapshot.val();
          setTasks(loadedTasks);
          console.log("✅ Tasks loaded from Firebase");
        }
      } catch (err) {
        console.error("❌ Error loading tasks from Firebase:", err);
      }
    };

    loadTasksFromFirebase();
  }, [userId]);

  const addTaskInputRef = useRef(null); // ← ADD THIS LINE

  useEffect(() => {
    if (isAddingTask) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // slight delay
      return () => clearTimeout(timer);
    }
  }, [isAddingTask]);
  
  // REST DATA
  const [search, setSearch] = useState('');

  const [items, setItems] = React.useState([]); // ← Leeg, wordt uit Firebase geladen

  const filteredList = items.filter(
    i =>
      i.status === "suggested" &&
      i.name.toLowerCase().includes(search.toLowerCase()) &&
      i.page !== mlUser?.id
  );

  const [peoplePages, setPeoplePages] = useState([
    'people',
    'archived',
    'gymboys',
    'travelgang',
    'futureyou',
    'jake',
    'addpeople',
  ]);

  const [algorithmResult, setAlgorithmResult] = useState(null);
  const [mlUser, setMlUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [allGroupsDB, setAllGroupsDB] = useState([]);

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(""); // stores name from input

  const [debouncedName, setDebouncedName] = useState(userName);

  const [userBio, setUserBio] = useState(""); 
  const [debouncedBio, setDebouncedBio] = useState(userBio);

  const [myRanking, setMyRanking] = useState([]);

  // ==================== AUTHENTICATION ====================
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("🔍 CHECKING FOR EXISTING USER ID...");
        
        // 1️⃣ Check AsyncStorage first
        const storedUserId = await AsyncStorage.getItem("USER_ID");
        
        if (storedUserId) {
          console.log("✅ FOUND STORED USER ID:", storedUserId);
          setUserId(storedUserId);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        console.log("⚠️ NO STORED USER ID - Creating new user");
        
        // 2️⃣ Create new anonymous user
        const credential = await signInAnonymously(auth);
        const uid = credential.user.uid;

        console.log("🆕 NEW USER CREATED:", uid);

        // 3️⃣ Save to AsyncStorage
        await AsyncStorage.setItem("USER_ID", uid);
        console.log("💾 USER ID SAVED");

        setUserId(uid);
        setIsAuthenticated(true);
        setIsLoading(false);
        
      } catch (err) {
        console.error("❌ Auth error:", err);
        setError("Authentication failed. Please restart the app.");
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    };

    initAuth();
  }, []); // Empty dependency - runs ONLY once on mount

  // ==================== LOAD USER DATA FROM FIREBASE ====================
  useEffect(() => {
    if (!userId) return;
    
    const loadUserData = async () => {
      try {
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          
          // Load name and bio from Firebase
          if (userData.name) {
            setUserName(userData.name);
            setDebouncedName(userData.name);
            console.log("✅ Name loaded:", userData.name);
          }
          
          if (userData.bio) {
            setUserBio(userData.bio);
            setDebouncedBio(userData.bio);
            console.log("✅ Bio loaded:", userData.bio);
          }
          
          console.log("✅ User data loaded from Firebase");
        } else {
          console.log("ℹ️ No existing user data, starting fresh");
        }
      } catch (err) {
        console.error("❌ Error loading user data:", err);
      }
    };
    
    loadUserData();
  }, [userId]); // Runs when userId changes

  // ADD THIS NEW EFFECT TO LOAD TASKS FROM FIREBASE ON STARTUP
  useEffect(() => {
    if (!userId) return;
    
    const loadTasksFromFirebase = async () => {
      try {
        const snapshot = await get(ref(db, `users/${userId}/tasks`));
        if (snapshot.exists()) {
          const loadedTasks = snapshot.val();
          setTasks(loadedTasks);
          console.log("✅ Tasks loaded from Firebase");
        }
      } catch (err) {
        console.error("❌ Error loading tasks from Firebase:", err);
      }
    };

    loadTasksFromFirebase();
  }, [userId]);

  // ⬇️ VOEG DIT TOE ⬇️
  // ==================== LOAD GOALS FROM FIREBASE ====================
  useEffect(() => {
  if (!userId) return;


  const loadGoalsFromFirebase = async () => {
  try {
  const snapshot = await get(ref(db, `users/${userId}/goals`));


  if (snapshot.exists()) {
  const data = snapshot.val();
  const loadedGoals = Array.isArray(data)
  ? data.map(g => ({
  ...g,
  daysPerWeek: Number(g.daysPerWeek) || 0,
  streakNumber: Number(g.streakNumber) || 0,
  weekStreak: Number(g.weekStreak) || 0,
  dates: g.dates || [],
  weeks: g.weeks || [],
  }))
  : Object.values(data).map(g => ({
  ...g,
  daysPerWeek: Number(g.daysPerWeek) || 0,
  streakNumber: Number(g.streakNumber) || 0,
  weekStreak: Number(g.weekStreak) || 0,
  dates: g.dates || [],
  weeks: g.weeks || [],
  }));
  setGoals(loadedGoals);
  } else {
  // VERY FIRST APP START → only add default once
  const firstLaunchFlag = await AsyncStorage.getItem("FIRST_LAUNCH_DONE");


  if (!firstLaunchFlag) {
  const defaultGoals = [
  {
  title: 'Workout',
  daysPerWeek: 1,
  streakNumber: 0,
  Currentstreak: '0',
  longeststreak: '0 days',
  consistency: '0%',
  weekStreak: 0,
  weekConsistency: '0%',
  workoutCompleted: false,
  dates: [],
  weeks: [],
  },
  ];


  setGoals(defaultGoals);
  await set(ref(db, `users/${userId}/goals`), defaultGoals);


  // Mark that first launch default has been done
  await AsyncStorage.setItem("FIRST_LAUNCH_DONE", "true");
  } else {
  // User has intentionally no goals → stay empty
  setGoals([]);
  }
  }
  } catch (err) {
  console.error("❌ Error loading goals from Firebase:", err);
  }
  };


  loadGoalsFromFirebase();
  }, [userId]);

  // ==================== SAVE GOALS TO FIREBASE ====================
  useEffect(() => {
    if (!userId || !goals || goals.length === 0) return;
    
    const saveGoalsToFirebase = async () => {
      try {
        await set(ref(db, `users/${userId}/goals`), goals);
        console.log("✅ Goals saved to Firebase");
      } catch (err) {
        console.error("❌ Error saving goals to Firebase:", err);
      }
    };

    // Debounce the save
    const timer = setTimeout(saveGoalsToFirebase, 500);
    return () => clearTimeout(timer);
  }, [goals, userId]);

  // ==================== LOAD ITEMS (CHATS) FROM FIREBASE ====================
  useEffect(() => {
    if (!userId) return;
    
    const loadItemsFromFirebase = async () => {
      try {
        const snapshot = await get(ref(db, `users/${userId}/items`));
        if (snapshot.exists()) {
          const loadedItems = Object.values(snapshot.val());
          setItems(loadedItems);
          console.log("✅ Items loaded from Firebase:", loadedItems);
        } else {
          console.log("ℹ️ No items found, starting with empty list");
          setItems([]);
        }
      } catch (err) {
        console.error("❌ Error loading items from Firebase:", err);
      }
    };

    loadItemsFromFirebase();
  }, [userId]);

  // ==================== SAVE ITEMS TO FIREBASE ====================
  useEffect(() => {
    if (!userId || !items || items.length === 0) return;
    
    const saveItemsToFirebase = async () => {
      try {
        // Convert array to object with page as key
        const itemsObj = {};
        items.forEach(item => {
          if (item.page) {
            itemsObj[item.page] = item;
          }
        });
        
        await set(ref(db, `users/${userId}/items`), itemsObj);
        console.log("✅ Items saved to Firebase");
      } catch (err) {
        console.error("❌ Error saving items to Firebase:", err);
      }
    };

    // Debounce the save
    const timer = setTimeout(saveItemsToFirebase, 500);
    return () => clearTimeout(timer);
  }, [items, userId]);

  // DEBOUNCE BIO
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBio(userBio);
    }, 1000);
    return () => clearTimeout(handler);
  }, [userBio]);

  useEffect(() => {
    if (!mlUser) return;
    setMlUser(prev => ({ ...prev, bio: debouncedBio }));

    update(ref(db, `users/${mlUser.id}`), {
      bio: debouncedBio
    });
  }, [debouncedBio]);

  // DEBOUNCE NAME
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedName(userName);
    }, 1000); // 1000ms after last keystroke

    return () => clearTimeout(handler); // reset timeout if typing continues
  }, [userName]);

  // MAKES THE ITEMS LOCAL WORK
  const handleAddAndMove = async (item) => {
      const pageName = getPageName(item);

      console.log("🟡 Adding item:", item);

      moveItem(pageName, 'active'); // optional, for local UI
      await handleAddUser(item);    // handles Firebase write & UI update
  };

  // REMOVES DUPLITCATES? (NOTNEEDED)??
  const removeSuggestedIfActiveDuplicate = (items) => {
    const ensureId = (item) =>
      item.id ? item : { ...item, id: `${item.name}_${Math.random().toString(36).slice(2)}_${Date.now()}` };

    const allItems = items.map(ensureId);

    const priority = (s) => (s === "active" ? 3 : s === "suggested" ? 2 : 1);
    const nameBest = new Map();

    for (const item of allItems) {
      const existing = nameBest.get(item.name);

      if (!existing) {
        nameBest.set(item.name, item);
        continue;
      }

      const pItem = priority(item.status);
      const pExisting = priority(existing.status);

      let winner = existing;

      if (pItem > pExisting) {
        winner = item;
      } else if (pItem === pExisting) {
        // same status → prefer longer ID
        winner = existing.id.length > item.id.length ? existing : item;
      }

      nameBest.set(item.name, winner);
    }

    return Array.from(nameBest.values());
  };

  // Run algorithm whenever userId, tasks, or goals change
  useEffect(() => {
    if (!userId || !tasks || !goals) {
      setIsLoading(true);
      return;
    }

    const setupAndRun = async () => {
      // ✅ CHECK DIRECT HIER: Skip als user bestaat maar naam nog niet geladen is
      const userSnapshot = await get(ref(db, `users/${userId}`));
      if (userSnapshot.exists() && !userName) {
        console.log("⏳ Skipping algorithm: waiting for userName to load");
        return;
      }

      console.log("⚡ useEffect triggered (setup + algorithm)");

      // ✅ LOAD EXISTING USER DATA FIRST
      const existingUserSnap = await get(ref(db, `users/${userId}`));
      const existingUser = existingUserSnap.exists() ? existingUserSnap.val() : {};

      console.log("📦 Existing user data:", existingUser);

      // ✅ MERGE: Keep existing data, only update what's needed
      const userData = {
        ...existingUser, // Keep ALL existing data
        id: String(userId),
        name: userName || existingUser.name || `User${Math.floor(10000000 + Math.random() * 90000000)}`,
        bio: userBio || existingUser.bio || "This is my bio.",
        streak_days: goals.reduce((sum, g) => sum + (g.streakNumber || 0), 0),
        days_active_per_week: goals.length
          ? Math.round(goals.reduce((sum, g) => sum + (g.weekStreak || 0), 0) / goals.length)
          : 0,
        // Only set defaults if they don't exist yet
        Country: existingUser.Country || "NL",
        time_zone: existingUser.time_zone || "CET",
        groupsEntered: existingUser.groupsEntered || [],
        status: existingUser.status || "Active",
        pic: existingUser.pic || "https://example.com/profile.jpg",
      };

      console.log("💾 Merged user data:", userData);

      setMlUser(userData);

      try {
        // Update user in Firebase with merged data
        await set(ref(db, `users/${String(userData.id)}`), userData);

      // Get all users + groups
      const [usersSnap, groupsSnap] = await Promise.all([
        get(ref(db, "users")),
        get(ref(db, "groups")),
      ]);

      const usersData = usersSnap.exists()
        ? Object.values(usersSnap.val())
        : [];

      const groupsData = groupsSnap.exists()
        ? Object.values(groupsSnap.val())
        : [];

      const filteredUsers = usersData.filter(u => u.id !== userId);

      // Run algorithm locally (NO SERVER)
      const algData = runMatching(usersData, groupsData);

      setAlgorithmResult(algData);

      const myId = userData.id;
      const myRankings =
        algData.combined_best_to_worst?.[myId] || [];

      const myGroupRankings =
        myRankings.filter(item => item.type === "group");

      setMyRanking(myGroupRankings);

      // Map users + groups into items
      const mappedUsers = filteredUsers.map(u => ({
          id: u.id,
          name: u.name,
          bio: u.bio || "",
          type: "person",
          page: u.id,
          status: "suggested",
      }));

      const mappedGroups = groupsData.map(g => ({
          id: g.id,
          name: g.name,
          bio: g.bio || "",
          type: "group",
          page: g.id,
          status: "suggested",
      }));

      // Build ranked items from algorithm
      const rankedItems = algData.combined_best_to_worst[userId]
          .map(r => {
          if (r.type === "group") {
              const g = groupsData.find(g => g.id === r.id);
              if (!g) return null;
              return { id: g.id, name: g.name, bio: g.bio, type: "group", page: g.id, status: "suggested" };
          } else if (r.type === "user") {
              const u = filteredUsers.find(u => u.id === r.id);
              if (!u) return null;
              return { id: u.id, name: u.name, bio: u.bio, type: "person", page: u.id, status: "suggested" };
          }
          return null;
          })
          .filter(Boolean);

      // Merge with existing items (same as before)
      setItems(prev => {
          const ensureId = item =>
          item.id ? item : { ...item, id: `${item.name}_${Math.random().toString(36).slice(2)}_${Date.now()}` };

          const prevWithIds = prev.map(ensureId);
          const rankedWithIds = rankedItems.map(ensureId);

          const suggestedIds = new Set(rankedWithIds.map(i => i.id));

          const cleaned = prevWithIds.filter(item => {
          const isMatch = suggestedIds.has(item.id);
          if (item.status !== "suggested") return true;
          return !isMatch;
          });

          const existingIds = new Set(cleaned.map(i => i.id));
          const toAdd = rankedWithIds.filter(i => !existingIds.has(i.id));

          const merged = [...cleaned, ...toAdd];

          const priority = s => (s === "active" ? 3 : s === "suggested" ? 2 : 1);
          const nameBest = new Map();

          for (let i = merged.length - 1; i >= 0; i--) {
          const it = merged[i];
          const existing = nameBest.get(it.name);
          if (!existing) {
              nameBest.set(it.name, it);
              continue;
          }
          const pIt = priority(it.status);
          const pExist = priority(existing.status);
          let winner = existing;
          if (pIt > pExist) winner = it;
          else if (pIt === pExist) winner = existing.id.length > it.id.length ? existing : it;
          nameBest.set(it.name, winner);
          }

          return merged.filter(it => nameBest.get(it.name) === it);
      });
      } catch (err) {
      console.error("❌ Setup or algorithm error:", err);
      }
  };

  setupAndRun();
  }, [tasks, goals, userId, userName, userBio]); // ← Gebruik userName en userBio!

  // PAGEID
  const generateUniqueId = async () => {
    try {
      const snap = await get(ref(db, "users"));
      const existingIds = snap.exists() ? Object.keys(snap.val()) : [];

      let newId;
      do {
        newId = Math.floor(10000000 + Math.random() * 90000000).toString();
      } while (existingIds.includes(newId));

      console.log("🆕 Unique userId generated:", newId);
      return newId; // <-- return it
    } catch (err) {
      console.error("❌ Error fetching existing IDs:", err);
      return null;
    }
  };

  // CREATE CONSISTENT PAGE NAME
  const getPageName = (item) => {
    if (item.type === "person") {
      return `chat_${[mlUser.id, item.id].sort().join("_")}`; // altijd dezelfde voor dezelfde users
    }
    // Voor groepen gebruik bestaande page of genereer nieuwe
    return item.page || `group-${item.id}`;
  }; 

 const updateGoalsInDB = async (updatedGoals) => {
    if (!userId) return;

    try {
    await set(ref(db, `users/${userId}/goals`), updatedGoals);
    setGoals(updatedGoals); // update local state too
    console.log("✅ Goals updated in Firebase");
    } catch (err) {
    console.error("❌ Error updating goals in Firebase:", err);
    }
  };

  // HANDLE ADDING USER OR GROUP FOR SERVER
  const handleAddUser = async (item) => {
    try {
      setError(null); // Clear previous errors
      const pageName = getPageName(item);
      const userA = mlUser.id;   // the one adding
      const userB = item.id;     // the one being added

      const chatRef = ref(db, `chats/${pageName}`);

      if (item.type === "person") {
        await set(chatRef, {
          type: "person",
          pageName,
          addedBy: userA,          // store who added
          addedUserId: userB,      // store who was added
          allowedUsers: [userA, userB],
          timestamp: Date.now(),
        });
      } else if (item.type === "group") {
        await set(chatRef, {
          type: "group",
          pageName,
          groupId: item.id,
          addedBy: userA,
          allowedUsers: [userA],   // groups can expand later
          timestamp: Date.now(),
        });
        // Add the user to the group's members array
        const groupRef = ref(db, `groups/${item.id}/members`);
        const snapshot = await get(groupRef);
        const members = snapshot.exists() ? snapshot.val() : [];
        
        if (!members.includes(userA)) {
          members.push(userA);
          await set(groupRef, members);
        }
      }

      // Update local UI
      setItems(prev => prev.filter(i => i.page !== pageName));
      handleAdd({ ...item, status: "active", page: pageName });

    } catch (err) {
      console.error("❌ Error adding:", err);
    }
  };
  // ADD ITEM LOCALLY
  const handleAdd = (item) => {
    const newPage = item.page || createUniquePageId();

    // Only add if it doesn’t already exist
    setItems((prev) => {
      // Remove suggested duplicates again just in case
      const filtered = prev.filter(i => !(i.id === item.id && i.status === "suggested"));

      const exists = filtered.some(i => i.page === newPage);
      if (exists) {
        return filtered.map(i => i.page === newPage ? { ...i, status: "active" } : i);
      }

      const newItem = {
        ...item,
        page: newPage,
        name: item.name || (item.type === 'group' ? 'New Group' : 'New Chat'),
        bio: item.bio || '',
        type: item.type || 'person',
        status: 'active',
        icon: item.type === "person" ? "person-circle" : "people",
        useMaterial: item.useMaterial ?? false,
        isPerson: item.type === 'person',
      };

      return [newItem, ...prev];
    });

    // Update pages
    setPeoplePages(prev => (prev.includes(newPage) ? prev : [...prev, newPage]));

    // Navigate
    setCurrentPage(newPage);
  };

  // AUTO UPDATE 
  useEffect(() => {
  const interval = setInterval(async () => {
      try {
      const [usersSnap, groupsSnap] = await Promise.all([
          get(ref(db, "users")),
          get(ref(db, "groups")),
      ]);

      const usersData = usersSnap.exists() ? Object.values(usersSnap.val()) : [];
      const groupsData = groupsSnap.exists() ? Object.values(groupsSnap.val()) : [];

      setItems(prev => {
          return prev.map(item => {
          const updated = { ...item };

          if (item.type === "person") {
              const user = usersData.find(u => u.id === item.id);
              if (user) {
              updated.name = user.name;
              updated.bio = user.bio || updated.bio;
              }
          } else if (item.type === "group") {
              const group = groupsData.find(g => g.id === item.id);
              if (group) {
              updated.name = group.name;
              updated.bio = group.bio || updated.bio;
              }
          }

          return updated;
          });
      });
      } catch (err) {
      console.error("❌ Auto-refresh name update error:", err);
      }
  }, 10000);

  return () => clearInterval(interval);
  }, [mlUser?.id]);

  // ADD WHEN APART OF A CHAT
  useEffect(() => {
    if (!mlUser?.id) return;

    const chatsRef = ref(db, "chats");

    const unsubscribe = onValue(chatsRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const allChats = snapshot.val();

      Object.keys(allChats).forEach((pageName) => {
        const chat = allChats[pageName];

        console.log("📡 Checking chat:", pageName, chat);

        const allowed = chat.allowedUsers || [];
        const addedBy = chat.addedBy;
        const addedUserId = chat.addedUserId;

        // Only continue if this chat involves the current user
        if (!allowed.includes(mlUser.id)) {
          console.log("⛔ User not in allowedUsers, skipping:", mlUser.id);
          return;
        }

        console.log("✅ User is part of this chat:", mlUser.id);

        // Determine the "other" user for person chats
        const otherUserId =
          chat.type === "person"
            ? allowed.find((u) => u !== mlUser.id)
            : null;

        // Check if THIS chat already exists locally
        const existingChat = items.find((i) => i.page === pageName);
        if (existingChat) {
          console.log("🔁 Chat already exists locally, skipping:", pageName);
          return;
        }

        // CASE 1: Current user is the one who ADDED someone
        if (addedBy === mlUser.id && addedUserId) {
          console.log("🟦 Current user ADDED someone:", addedUserId);

          const suggested = items.find(
            (i) => i.page === addedUserId && i.status === "suggested"
          );

          if (suggested) {
            console.log("🔄 Converting suggested → active for added user:", addedUserId);

            const updatedItem = {
              ...suggested,
              page: pageName,
              status: "active",
            };

            setItems((prev) =>
              prev
                .map((i) =>
                  i.page === suggested.page ? updatedItem : i
                )
                .filter(
                  (i) =>
                    i.page !== mlUser.id &&
                    i.page !== addedUserId
                )
            );

            console.log("💾 Saving updated active item to Firebase:", updatedItem);
            set(ref(db, `users/${mlUser.id}/items/${pageName}`), updatedItem);

            console.log("🧹 Cleaning up old suggested entries");
            remove(ref(db, `users/${mlUser.id}/items/${addedUserId}`));
            remove(ref(db, `users/${mlUser.id}/items/${mlUser.id}`));

            return;
          }
        }

        // CASE 2: Current user is the one who GOT ADDED
        if (addedUserId === mlUser.id && addedBy) {
          console.log("🟩 Current user WAS ADDED by:", addedBy);

          const suggested = items.find(
            (i) => i.page === addedBy && i.status === "suggested"
          );

          if (suggested) {
            console.log("🔄 Converting suggested → active for adder:", addedBy);

            const updatedItem = {
              ...suggested,
              page: pageName,
              status: "active",
            };

            setItems((prev) =>
              prev
                .map((i) =>
                  i.page === suggested.page ? updatedItem : i
                )
                .filter(
                  (i) =>
                    i.page !== mlUser.id &&
                    i.page !== addedBy
                )
            );

            console.log("💾 Saving updated active item to Firebase:", updatedItem);
            set(ref(db, `users/${mlUser.id}/items/${pageName}`), updatedItem);

            console.log("🧹 Cleaning up old suggested entries");
            remove(ref(db, `users/${mlUser.id}/items/${addedBy}`));
            remove(ref(db, `users/${mlUser.id}/items/${mlUser.id}`));

            return;
          }
        }

        // CASE 3: No suggested item → create new active chat item
        console.log("🆕 Creating new active chat item:", pageName);

        const newItem = {
          page: pageName,
          name: otherUserId || chat.pageName,
          type: chat.type || "person",
          status: "active",
          bio: "",
        };

        setItems((prev) =>
          prev
            .concat(newItem)
            .filter(
              (i) =>
                i.page !== mlUser.id &&
                (otherUserId ? i.page !== otherUserId : true)
            )
        );

        console.log("💾 Saving new active item to Firebase:", newItem);
        set(ref(db, `users/${mlUser.id}/items/${pageName}`), newItem);

        console.log("🧹 Cleaning up old suggested entries");
        remove(ref(db, `users/${mlUser.id}/items/${mlUser.id}`));
        if (otherUserId) {
          remove(ref(db, `users/${mlUser.id}/items/${otherUserId}`));
        }
      });
    });

    return () => unsubscribe();
  }, [mlUser, items]);

  // FILTERS
  const people = items.filter(
    (i) => i.type === 'person' && i.status === 'active'
  );
  const groups = items.filter(
    (i) => i.type === 'group' && i.status === 'active'
  );
  const archivedGroups = items.filter(
    (i) => i.type === 'group' && i.status === 'archived'
  );
  const archivedPeople = items.filter(
    (i) => i.type === 'person' && i.status === 'archived'
  );
  const suggestions = items.filter((i) => i.status === 'suggested');

  // Move item to a new status (works for anything)
  const moveItem = (pageName, newStatus) => {
    setItems((prev) =>
      prev.map((item) =>
        item.page === pageName ? { ...item, status: newStatus } : item
      )
    );
  };

  // GOALS:
  const [editGoalIndex, setEditGoalIndex] = useState(null);
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editGoalDays, setEditGoalDays] = useState('');

  const handleEditGoal = (index) => {
    setEditGoalIndex(index);
    setEditGoalTitle(goals[index].title);
    setEditGoalDays(goals[index].daysPerWeek.toString());
    setCurrentPage('editGoal');
  };


  // UI helpers
  function onToggle(title) {
    setExpandedTitle((prev) => (prev === title ? null : title));
  }

  const handleGoalPress = (index) => {
    setExpandedGoalIndex(expandedGoalIndex === index ? null : index);
  };

  useEffect(() => {
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (newTaskText.trim() === '') {
        setIsAddingTask(false);
        setFilteredSuggestions([]);
      }
    });


    return () => keyboardHideListener.remove();
  }, [newTaskText]);

  const inputRef = useRef(null);
  const pressingAdd = useRef(false);

  useEffect(() => {
    if (showAddSubtask) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [showAddSubtask]);

  useEffect(() => {
    if (currentPage !== 'target') {
      setExpandedGoalIndex(null);
    }
  }, [currentPage]);


  useEffect(() => {
    if (currentPage !== 'home') {
      setIsAddingTask(false);
      setNewTaskText('');
      setFilteredSuggestions([]);
    }
  }, [currentPage]);

  
  useEffect(() => {
  if (currentPage !== 'editTask') {
      setShowDropdown(false);
  }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage !== 'editTask') {
      setShowDropdown(false);
    }
    if (currentPage !== 'editSubtask') {
      setShowSubtaskDropdown(false);
    }
  }, [currentPage]);


  return (
    <>
      <ErrorOverlay error={error} onDismiss={() => setError(null)} />
      
      <View style={styles.container}>
        <OfflineIndicator />
        <View style={styles.line} />
        <View style={styles.contentWrapper}>
          <TouchableOpacity onPress={() => setCurrentPage('profile')}>
            <Ionicons
              name="person-circle"
              size={60}
              color={currentPage === 'profile' ? '#2772BC' : 'grey'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (currentPage === 'profile') {
                setCurrentPage('help');
              } else if (currentPage === 'home') {
                setIsAddingTask(true); // show input
                setFilteredSuggestions(goals.map((g) => `Goal - ${g.title}`)); // show suggestions immediately
              } else if (currentPage === 'people' || currentPage === 'archived') {
                setCurrentPage('addpeople'); // go to Suggestion page from people or archived
              } else if (currentPage === 'target' || currentPage === 'editGoal') {
                setCurrentPage('addGoal');
              } else if (currentPage === 'editTask') {
                setShowAddSubtask(true);
                setShowDropdown(false);
              }
            }}>
            <Ionicons
              name={
                currentPage === 'profile' || currentPage === 'help'
                  ? 'information-circle'
                  : 'add-circle'
              }
              size={60}
              color={currentPage === 'help' ? '#2772Bc' : 'grey'}
            />
          </TouchableOpacity>
        </View>

        {currentPage === 'addpeople' && (
          <AddPeopleScreen
            search={search}
            setSearch={setSearch}
            filteredList={filteredList}
            suggestions={suggestions}
            expandedTitle={expandedTitle}
            onToggle={onToggle}
            handleAddAndMove={handleAddAndMove}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'help' && <HelpScreen />}

        {items.map((item) => (
          <PageWithBack
            key={item.page}
            mlUser={mlUser}
            currentPage={currentPage}
            pageName={item.page}
            setCurrentPage={setCurrentPage}
            title={item.name}
            bio={item.bio}      // 👈 this comes straight from your items var
            type={item.type} 
            icon={
              item.useMaterial ? (
                <MaterialCommunityIcons name={item.icon} size={24} color="grey" />
              ) : (
                <Ionicons name={item.icon} size={24} color="grey" />
              )
            }
          />
        ))}

        {currentPage === 'archived' && (
          <ArchivedScreen
            setCurrentPage={setCurrentPage}
            archivedGroups={archivedGroups}
            archivedPeople={archivedPeople}
            setItems={setItems}
          />
        )}

        <ScrollView
          style={styles.taskList}
          keyboardShouldPersistTaps="handled"  // <-- Add this>
          contentContainerStyle={{ paddingBottom: 120 }}
          >
          {currentPage === 'target' && (
            <TargetScreen
              goals={goals}
              expandedGoalIndex={expandedGoalIndex}
              handleGoalPress={handleGoalPress}
              handleEditGoal={handleEditGoal}
              setGoals={updateGoalsInDB} // <- use the helper we created
            />
          )}

          {currentPage === 'addGoal' && (
            <AddGoalScreen
              newGoalTitle={newGoalTitle}
              setNewGoalTitle={setNewGoalTitle}
              newGoalDays={newGoalDays}
              setNewGoalDays={setNewGoalDays}
              goals={goals}
              setGoals={setGoals}
              setCurrentPage={setCurrentPage}
            />
          )}

          {currentPage === 'editGoal' && (
            <EditGoalScreen
              editGoalTitle={editGoalTitle}
              setEditGoalTitle={setEditGoalTitle}
              editGoalDays={editGoalDays}
              setEditGoalDays={setEditGoalDays}
              editGoalIndex={editGoalIndex}
              setEditGoalIndex={setEditGoalIndex}
              setCurrentPage={setCurrentPage}
              goals={goals}
              setGoals={setGoals}
              countThisWeek={countThisWeek}
              calculateStreaks={calculateStreaks}
            />
          )}


          {currentPage === 'people' && (
            <>
              <ArchivedBar setCurrentPage={setCurrentPage} />
              <GroupPeople
                setCurrentPage={setCurrentPage}
                items={items}
                setItems={setItems}
              />
            </>
          )}

          


          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              Keyboard.dismiss(); // Hide keyboard first
              if (newTaskText.trim() === '') {
                setIsAddingTask(false);
                setFilteredSuggestions([]);
              } else {
                handleAddTask();
                setIsAddingTask(false);
                setNewTaskText('');
                setFilteredSuggestions([]);
              }
            }}>
            {currentPage === 'home' && (
              <HomeTasks
                isAddingTask={isAddingTask}
                newTaskText={newTaskText}
                setNewTaskText={setNewTaskText}
                filteredSuggestions={filteredSuggestions}
                setFilteredSuggestions={setFilteredSuggestions}
                goals={goals}
                handleAddTask={handleAddTask}
                handleAddSuggestionTask={handleAddSuggestionTask}
                setIsAddingTask={setIsAddingTask}
                tasks={tasks} // Full tasks array for finding indices
                activeTasks={activeTasks} // NEW: filtered active tasks
                doneTasks={doneTasks} // Already filtered done tasks
                doneCollapsed={doneCollapsed}
                setDoneCollapsed={setDoneCollapsed}
                toggleCheckTask={toggleCheckTask}
                // REMOVED: toggleUncheckDoneTask
                updateSubtaskChecked={updateSubtaskChecked}
                deleteSubtask={deleteSubtask}
                setSelectedTask={setSelectedTask}
                setEditedText={setEditedText}
                setEditedDesc={setEditedDesc}
                setSelectedSubtask={setSelectedSubtask}
                setEditedSubtaskText={setEditedSubtaskText}
                setEditedSubtaskDesc={setEditedSubtaskDesc}
                setSubtaskFromTaskModal={setSubtaskFromTaskModal}
                setCurrentPage={setCurrentPage}
                inputRef={addTaskInputRef}
              />
            )}
          </Pressable>

          {currentPage === 'profile' && (
            <ProfilePage
              userName={userName}
              setUserName={setUserName}
              userBio={userBio}
              setUserBio={setUserBio}
            />
          )}

          {/* Task Modal */}
          {currentPage === 'editTask' && selectedTask !== null && (
            <EditTaskPage
              tasks={tasks}
              selectedTask={selectedTask}
              editedText={editedText}
              setEditedText={setEditedText}
              editedDesc={editedDesc}
              setEditedDesc={setEditedDesc}
              setSelectedTask={setSelectedTask}
              setCurrentPage={setCurrentPage}
              showAddSubtask={showAddSubtask}
              setShowAddSubtask={setShowAddSubtask}
              newSubtask={newSubtask}
              setNewSubtask={setNewSubtask}
              inputRef={inputRef}
              updateSubtaskChecked={updateSubtaskChecked}
              deleteSubtask={deleteSubtask}
              selectedSubtask={selectedSubtask}
              setSelectedSubtask={setSelectedSubtask}
              editedSubtaskText={editedSubtaskText}
              setEditedSubtaskText={setEditedSubtaskText}
              editedSubtaskDesc={editedSubtaskDesc}
              setEditedSubtaskDesc={setEditedSubtaskDesc}
              setSubtaskFromTaskModal={setSubtaskFromTaskModal}
              saveSubtaskInline={saveSubtaskInline}
              showDropdown={showDropdown}
              setShowDropdown={setShowDropdown}
              handleDelete={handleDelete}
              setTasks={setTasks}
            />
          )} 

          {/* Subtask Modal */}
          {currentPage === 'editSubtask' && selectedSubtask !== null && (
            <EditSubtaskPage
              tasks={tasks}
              setTasks={setTasks}
              selectedSubtask={selectedSubtask}
              setSelectedSubtask={setSelectedSubtask}
              editedSubtaskText={editedSubtaskText}
              setEditedSubtaskText={setEditedSubtaskText}
              editedSubtaskDesc={editedSubtaskDesc}
              setEditedSubtaskDesc={setEditedSubtaskDesc}
              subtaskFromTaskModal={subtaskFromTaskModal}
              setSelectedTask={setSelectedTask}
              setCurrentPage={setCurrentPage}
              showSubtaskDropdown={showSubtaskDropdown}
              setShowSubtaskDropdown={setShowSubtaskDropdown}
            />
          )}
        </ScrollView>

        <View style={styles.middleIcons}>
          <TouchableOpacity onPress={() => setCurrentPage('home')}>
            <Ionicons
              name="checkmark-circle"
              size={60}
              color={
                ['home', 'editTask', 'editSubtask', 'addTask'].includes(
                  currentPage
                )
                  ? '#2772BC'
                  : 'grey'
              }
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentPage('people')}>
            <Ionicons
              name="people-circle"
              size={60}
              color={peoplePages.includes(currentPage) ? '#2772BC' : 'grey'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setCurrentPage('target');

              // Update all goal stats immediately
              setGoals(prevGoals =>
                prevGoals.map(goal => {
                  const weekDone = countThisWeek(goal.dates); // current week progress
                  const {
                    currentStreak,
                    longestStreak,
                    consistency,
                    weekStreak,
                    longestWeekStreak,
                    weekConsistency
                  } = calculateStreaks(goal.dates, goal.daysPerWeek);

                  return {
                    ...goal,
                    streakNumber: currentStreak,
                    Currentstreak: `${currentStreak}`,
                    longeststreak: `${longestStreak} days`,
                    consistency,
                    weekStreak,
                    longestWeekStreak,
                    weekConsistency,
                    workoutCompleted: weekDone > 0,
                  };
                })
              );
            }}
          >
            <MaterialCommunityIcons
              name="target"
              size={60}
              color={
                currentPage === 'target' || currentPage === 'addGoal'
                  ? '#2772BC'
                  : 'grey'
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}


