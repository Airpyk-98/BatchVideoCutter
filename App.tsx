import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import VideoListScreen from './src/screens/VideoListScreen';
import EditorScreen from './src/screens/EditorScreen';
import BatchCutScreen from './src/screens/BatchCutScreen';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Select Videos' }} />
        <Stack.Screen name="VideoList" component={VideoListScreen} options={{ title: 'Select a Video' }} />
        <Stack.Screen name="Editor" component={EditorScreen} options={{ title: 'Edit Cuts' }} />
        <Stack.Screen name="BatchCut" component={BatchCutScreen} options={{ title: 'Export Cuts' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
