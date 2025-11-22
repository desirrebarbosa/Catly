import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

// Placeholder Home Screen
const HomeScreen = () => {
  const { logOut, user } = useAuth();
  
  return (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>Welcome to Catly!</Text>
      <Text style={styles.screenText}>You're logged in as:</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={logOut}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

// Placeholder screens
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
        tabBarActiveTintColor: COLORS.pink,
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
          return <Text style={{ fontSize: 22 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Schedule" component={PlaceholderScreen} />
      <Tab.Screen name="Contacts" component={PlaceholderScreen} />
      <Tab.Screen name="Settings" component={PlaceholderScreen} />
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
    color: COLORS.pink,
    marginTop: 5,
    marginBottom: 30,
  },
  logoutBtn: {
    backgroundColor: COLORS.pink,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
