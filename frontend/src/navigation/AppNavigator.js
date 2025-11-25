import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import CatListScreen from '../screens/CatListScreen';
import AddCatScreen from '../screens/AddCatScreen';
import EditCatScreen from '../screens/EditCatScreen';
import CatDetailsScreen from '../screens/CatDetailsScreen';
import HealthLogScreen from '../screens/HealthLogScreen';
import AddHealthEventScreen from '../screens/AddHealthEventScreen';
import FamilyTreeScreen from '../screens/FamilyTreeScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={CatListScreen} />
      <Stack.Screen name="AddCat" component={AddCatScreen} />
      <Stack.Screen name="EditCat" component={EditCatScreen} />
      <Stack.Screen name="CatDetails" component={CatDetailsScreen} />
      <Stack.Screen name="HealthLog" component={HealthLogScreen} />
      <Stack.Screen name="AddHealthEvent" component={AddHealthEventScreen} />
      <Stack.Screen name="FamilyTree" component={FamilyTreeScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;