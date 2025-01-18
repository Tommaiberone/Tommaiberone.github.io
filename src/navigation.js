// navigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './Screens/HomeScreen';
import InfiniteDilemmasScreen from './Screens/InfiniteDilemmasScreen';
import EvaluateDilemmaScreen from './EvaluateDilemmaScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* Home Screen */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Welcome' }}
        />
        
        {/* Existing Dilemma Screen */}
        <Stack.Screen
          name="Dilemma"
          component={InfiniteDilemmasScreen}
          options={{ title: 'Dilemma Generator' }}
        />
        
        {/* New Get Dilemma Screen */}
        <Stack.Screen
          name="GetDilemma"
          component={EvaluateDilemmaScreen}
          options={{ title: 'Get Dilemma' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
