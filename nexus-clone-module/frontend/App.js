import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from './screens/HomeScreen';
import NewCloneScreen from './screens/NewCloneScreen';
import ProgressScreen from './screens/ProgressScreen';
import ResultScreen from './screens/ResultScreen';
import PreviewScreen from './screens/PreviewScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#14131a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'monospace',
            fontSize: 14,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#0b0a0e',
          }
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="NewClone" 
          component={NewCloneScreen} 
          options={{ title: 'NEW CLONE OPERATION' }} 
        />
        <Stack.Screen 
          name="Progress" 
          component={ProgressScreen} 
          options={{ title: 'CLONE STATUS', headerLeft: () => null }} 
        />
        <Stack.Screen 
          name="Result" 
          component={ResultScreen} 
          options={{ title: 'CLONE METRICS' }} 
        />
        <Stack.Screen 
          name="Preview" 
          component={PreviewScreen} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
