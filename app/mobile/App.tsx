
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CatProvider } from './src/context/CatContext';
import { HomeIcon as HomeIconSolid, CalendarDaysIcon as CalendarDaysIconSolid, UserGroupIcon as UserGroupIconSolid, UserCircleIcon as UserCircleIconSolid, CubeIcon as CubeIconSolid } from 'react-native-heroicons/solid';
import { View as RNView } from 'react-native';
import * as Notifications from 'expo-notifications';

const HomeIcon = HomeIconSolid as any;
const CalendarDaysIcon = CalendarDaysIconSolid as any;
const UserGroupIcon = UserGroupIconSolid as any;
const UserCircleIcon = UserCircleIconSolid as any;
const CubeIcon = CubeIconSolid as any;

// Configure Notifications to show alert even when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const View = RNView as any;

// Screens
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { Welcome2Screen } from './src/screens/Welcome2Screen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignupScreen } from './src/screens/SignupScreen';
import { SetupProfileScreen } from './src/screens/SetupProfileScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { CatListScreen } from './src/screens/CatListScreen';
import { AddCatScreen } from './src/screens/AddCatScreen';
import { CatDetailsScreen } from './src/screens/CatDetailsScreen';
import { EditCatScreen } from './src/screens/EditCatScreen';
import { HealthLogScreen } from './src/screens/HealthLogScreen';
import { AddHealthEventScreen } from './src/screens/AddHealthEventScreen';
import { FamilyTreeScreen } from './src/screens/FamilyTreeScreen';
import { ScheduleListScreen } from './src/screens/ScheduleListScreen';
import { ContactListScreen } from './src/screens/ContactListScreen';
import { AddContactScreen } from './src/screens/AddContactScreen';
import { AddScheduleScreen } from './src/screens/AddScheduleScreen';
import { AdoptionListScreen } from './src/screens/AdoptionListScreen';
import { AddAdoptionScreen } from './src/screens/AddAdoptionScreen';
import { LitterListScreen } from './src/screens/LitterListScreen';
import { AddLitterScreen } from './src/screens/AddLitterScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { InventoryListScreen } from './src/screens/InventoryListScreen';
import { AddInventoryScreen } from './src/screens/AddInventoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Cast navigators
const StackNavigator = Stack.Navigator as any;
const StackScreen = Stack.Screen as any;
const TabNavigator = Tab.Navigator as any;
const TabScreen = Tab.Screen as any;

const BottomTabs = () => {
  return (
    <TabNavigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: 80,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#F5A9C8',
        tabBarInactiveTintColor: '#D1D5DB',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontWeight: 'bold',
          fontSize: 10,
          marginBottom: 10,
        }
      }}
    >
      <TabScreen 
        name="Dashboard" 
        component={CatListScreen} 
        options={{
          tabBarLabel: 'My Cats',
          tabBarIcon: ({ color, size }: any) => <HomeIcon color={color} size={size} />
        }}
      />
      <TabScreen 
        name="ScheduleList" 
        component={ScheduleListScreen} 
        options={{
          tabBarLabel: 'Schedules',
          tabBarIcon: ({ color, size }: any) => <CalendarDaysIcon color={color} size={size} />
        }}
      />
      <TabScreen 
        name="InventoryList" 
        component={InventoryListScreen} 
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size }: any) => <CubeIcon color={color} size={size} />
        }}
      />
      <TabScreen 
        name="ContactList" 
        component={ContactListScreen} 
        options={{
          tabBarLabel: 'Contacts',
          tabBarIcon: ({ color, size }: any) => <UserGroupIcon color={color} size={size} />
        }}
      />
      <TabScreen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }: any) => <UserCircleIcon color={color} size={size} />
        }}
      />
    </TabNavigator>
  );
};

const AppNavigation = () => {
  const { user, isLoading, isNewUser } = useAuth();
  
  if (isLoading) return null;

  return (
    <StackNavigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <StackScreen name="Welcome" component={WelcomeScreen} />
          <StackScreen name="Welcome2" component={Welcome2Screen} />
          <StackScreen name="Login" component={LoginScreen} />
          <StackScreen name="Signup" component={SignupScreen} />
          <StackScreen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : isNewUser ? (
         <StackScreen name="SetupProfile" component={SetupProfileScreen} />
      ) : (
        <>
          <StackScreen name="MainTabs" component={BottomTabs} />
          
          <StackScreen name="AddCat" component={AddCatScreen} />
          <StackScreen name="CatDetails" component={CatDetailsScreen} />
          <StackScreen name="EditCat" component={EditCatScreen} />
          <StackScreen name="HealthLog" component={HealthLogScreen} />
          <StackScreen name="AddHealthEvent" component={AddHealthEventScreen} />
          <StackScreen name="FamilyTree" component={FamilyTreeScreen} />
          <StackScreen name="AddSchedule" component={AddScheduleScreen} />
          <StackScreen name="AddContact" component={AddContactScreen} />
          <StackScreen name="AdoptionList" component={AdoptionListScreen} />
          <StackScreen name="AddAdoption" component={AddAdoptionScreen} />
          <StackScreen name="LitterList" component={LitterListScreen} />
          <StackScreen name="AddLitter" component={AddLitterScreen} />
          <StackScreen name="AddInventory" component={AddInventoryScreen} />
          
          <StackScreen name="EditProfile" component={SetupProfileScreen} />
        </>
      )}
    </StackNavigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CatProvider>
        <NavigationContainer>
          <AppNavigation />
        </NavigationContainer>
      </CatProvider>
    </AuthProvider>
  );
}
