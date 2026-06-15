import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useVideoStore } from '../store';
import { useNavigation } from '@react-navigation/native';

const VideoListScreen = () => {
  const { videos } = useVideoStore();
  const navigation = useNavigation<any>();

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => navigation.navigate('Editor', { videoUri: item.uri })}
    >
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>{item.cuts.length} cuts defined</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Select a video to start with:</Text>
      <FlatList
        data={videos}
        keyExtractor={item => item.uri}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No videos available.</Text>}
      />
      {videos.some(v => v.cuts.length > 0) && (
        <View style={styles.footer}>
          <Button title="Export all created cuts" onPress={() => navigation.navigate('BatchCut')} color="green" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  instruction: { fontSize: 16, marginBottom: 12, fontWeight: 'bold' },
  item: { padding: 16, backgroundColor: '#e3f2fd', marginVertical: 8, borderRadius: 8 },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666' },
  emptyText: { textAlign: 'center', marginTop: 20 },
  footer: { marginTop: 20 }
});

export default VideoListScreen;
