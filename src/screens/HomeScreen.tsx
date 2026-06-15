import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { useVideoStore } from '../store';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const { addVideos } = useVideoStore();
  const navigation = useNavigation<any>();

  const pickVideos = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.video],
        allowMultiSelection: true,
      });
      const newVideos = results.map(res => ({
        uri: res.uri,
        name: res.name || 'Unknown Video',
        type: res.type || 'video/mp4',
        size: res.size || 0,
        cuts: [],
      }));
      addVideos(newVideos);
      navigation.navigate('VideoList');
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Welcome! Select the videos you want to cut.</Text>
      <View style={styles.buttonContainer}>
        <Button title="Pick Videos" onPress={pickVideos} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  instructions: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  buttonContainer: { width: '100%', maxWidth: 300 }
});

export default HomeScreen;
