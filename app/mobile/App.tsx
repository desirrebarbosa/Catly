import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CatProvider } from './src/context/CatContext';

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

const Stack = createNativeStackNavigator();
const StackNavigator = Stack.Navigator as any;
const Screen = Stack.Screen as any;

const AppNavigation = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return null; // Or a splash screen

  return (
    <StackNavigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Auth Stack
        <>
          <Screen name="Welcome" component={WelcomeScreen} />
          <Screen name="Welcome2" component={Welcome2Screen} />
          <Screen name="Login" component={LoginScreen} />
          <Screen name="Signup" component={SignupScreen} />
          <Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Screen name="SetupProfile" component={SetupProfileScreen} />
        </>
      ) : (
        // App Stack
        <>
          <Screen name="Dashboard" component={CatListScreen} />
          <Screen name="AddCat" component={AddCatScreen} />
          <Screen name="CatDetails" component={CatDetailsScreen} />
          <Screen name="EditCat" component={EditCatScreen} />
          <Screen name="HealthLog" component={HealthLogScreen} />
          <Screen name="AddHealthEvent" component={AddHealthEventScreen} />
          <Screen name="FamilyTree" component={FamilyTreeScreen} />
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