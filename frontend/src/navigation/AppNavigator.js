import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

// Home Screen (Simplified)
const HomeScreen = () => {
  const { user } = useAuth();
  
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Welcome to Catly!</Text>
      <Text style={styles.screenText}>You are logged in as:</Text>
      <Text style={styles.email}>{user?.email}</Text>
    </View>
  );
};

// 👇 NEW: Settings Screen with Logout Button
const SettingsScreen = () => {
  const { logOut } = useAuth();

  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Settings</Text>
      
      <View style={styles.settingsContainer}>
        <Text style={styles.sectionHeader}>Account</Text>
        
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logOut}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Placeholder for other tabs
const PlaceholderScreen = ({ route }) => (
  <View style={styles.screen}>
    <Text style={styles.screenTitle}>{route.name}</Text>
    <Text style={styles.screenText}>Coming soon...</Text>
  </View>
);

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarIcon: ({ focused }) => {
          let icon;
          switch (route.name) {
            case 'Home':
              icon = '🏠';
              break;
            case 'Schedule':
              icon = '📅';
              break;
            case 'Contacts':
              icon = '👥';
              break;
            case 'Settings':
              icon = '⚙️';
              break;
            default:
              icon = '📱';
          }
          // Simple opacity change for active/inactive state
          return <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Schedule" component={PlaceholderScreen} />
      <Tab.Screen name="Contacts" component={PlaceholderScreen} />
      
      {/* 👇 Connect the SettingsScreen here */}
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 10,
  },
  screenText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  email: {
    fontSize: 16,
    color: COLORS.primary, // Uses your pink color
    marginTop: 5,
    marginBottom: 30,
    fontWeight: '500',
  },
  // Settings Styles
  settingsContainer: {
    width: '100%',
    marginTop: 40,
    alignItems: 'center',
  },
  sectionHeader: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 15,
    marginLeft: '10%',
  },
  logoutBtn: {
    backgroundColor: COLORS.primary, // Pink background
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});