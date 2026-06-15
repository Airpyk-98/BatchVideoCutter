import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import Video from 'react-native-video';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useVideoStore } from '../store';
import { useRoute, useNavigation } from '@react-navigation/native';

const EditorScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { videoUri } = route.params;
  const { videos, addCut } = useVideoStore();
  
  const videoObj = videos.find(v => v.uri === videoUri);
  const videoRef = useRef<any>(null);

  const [duration, setDuration] = useState(1);
  const [markers, setMarkers] = useState([0, 1]);
  const [videoWidth, setVideoWidth] = useState(300);

  useEffect(() => {
    if (!videoObj) {
      navigation.goBack();
    }
  }, [videoObj]);

  if (!videoObj) return null;

  const handleLoad = (data: any) => {
    const dur = Math.max(1, data.duration);
    setDuration(dur);
    setMarkers([0, dur]);
  };

  const handleValuesChange = (values: number[]) => {
    setMarkers(values);
    // Seek to the start marker so user can preview it.
    videoRef.current?.seek(values[0]);
  };

  const handleValuesChangeFinish = (values: number[]) => {
    setMarkers(values);
    videoRef.current?.seek(values[0]);
  };

  const handleCreateCut = () => {
    Alert.prompt(
      "Name your Cut",
      "Enter a name or skip to auto-generate",
      [
        {
          text: "Skip",
          onPress: () => saveCut(null),
          style: "cancel"
        },
        {
          text: "Save",
          onPress: (name) => saveCut(name || null)
        }
      ],
      "plain-text",
      ""
    );
  };

  const saveCut = (enteredName: string | null) => {
    const cutCount = videoObj.cuts.length + 1;
    let finalName = enteredName;
    if (!finalName || finalName.trim() === '') {
       // get base name without extension for cleaner default name
       const baseName = videoObj.name.replace(/\.[^/.]+$/, "");
       finalName = `${baseName}_cut${cutCount}`;
    }

    addCut(videoUri, {
      id: Date.now().toString(),
      startTime: markers[0],
      endTime: markers[1],
      name: finalName
    });

    promptNextAction();
  };

  const promptNextAction = () => {
    Alert.alert(
      "Cut Saved!",
      "What would you like to do next?",
      [
        {
          text: "Set another cut in this video",
          onPress: () => {
             setMarkers([0, duration]);
          }
        },
        {
          text: "Select new video",
          onPress: () => {
             navigation.navigate('VideoList');
          }
        },
        {
          text: "Export all created cuts",
          onPress: () => {
             navigation.navigate('BatchCut');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Video 
        ref={videoRef}
        source={{ uri: videoUri }}
        style={styles.videoPlayer}
        controls={false} // hide default controls so timeline feels native
        resizeMode="contain"
        onLoad={handleLoad}
      />
      
      <View 
        style={styles.sliderContainer}
        onLayout={(e) => setVideoWidth(Math.max(200, e.nativeEvent.layout.width - 40))}
      >
        <Text style={styles.timeText}>
          Start: {markers[0].toFixed(1)}s   |   End: {markers[1].toFixed(1)}s
        </Text>
        <MultiSlider
          values={[markers[0], markers[1]]}
          sliderLength={videoWidth}
          onValuesChange={handleValuesChange}
          onValuesChangeFinish={handleValuesChangeFinish}
          min={0}
          max={duration}
          step={0.1}
          allowOverlap={false}
          snapped={false}
          markerStyle={styles.marker}
          selectedStyle={styles.selectedTrack}
        />
        
        <View style={styles.buttonWrapper}>
          <Button title="Create Cut" onPress={handleCreateCut} color="#007AFF" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoPlayer: { width: '100%', height: 350, backgroundColor: 'black' },
  sliderContainer: { padding: 20, backgroundColor: '#fff', flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -10, alignItems: 'center' },
  timeText: { textAlign: 'center', marginBottom: 20, fontSize: 16, fontWeight: 'bold' },
  buttonWrapper: { marginTop: 30, width: '100%' },
  marker: { backgroundColor: '#007AFF', height: 20, width: 20, borderRadius: 10 },
  selectedTrack: { backgroundColor: '#007AFF' }
});

export default EditorScreen;
