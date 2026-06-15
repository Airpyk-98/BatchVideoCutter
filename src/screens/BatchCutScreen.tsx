import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { useVideoStore } from '../store';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import RNFS from 'react-native-fs';

const BatchCutScreen = () => {
  const { videos } = useVideoStore();
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<any[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const startBatch = async () => {
    setProcessing(true);
    setLogs([]);
    setSkipped([]);
    addLog("Starting batch cut...");

    const channelId = await notifee.createChannel({
      id: 'batch_cut',
      name: 'Batch Video Processing',
      importance: AndroidImportance.HIGH,
    });

    const outputDir = `${RNFS.PicturesDirectoryPath}/BatchCuts`;
    await RNFS.mkdir(outputDir);

    let totalCuts = 0;
    videos.forEach(v => totalCuts += v.cuts.length);
    let completedCuts = 0;

    await notifee.displayNotification({
      id: 'batch_progress',
      title: 'Batch Cutting Videos',
      body: `Processing 0 of ${totalCuts} cuts`,
      android: {
        channelId,
        asForegroundService: true,
        progress: {
          max: totalCuts,
          current: 0,
        },
      },
    });

    for (const video of videos) {
      if (video.cuts.length === 0) continue;
      
      for (const cut of video.cuts) {
        addLog(`Processing cut: ${cut.name} for video: ${video.name}`);
        const outputPath = `${outputDir}/${cut.name}.mp4`;
        
        // Command: -ss start -to end -b:v 1M -r 3
        const command = `-i "${video.uri}" -ss ${cut.startTime} -to ${cut.endTime} -b:v 1M -r 3 -c:a copy "${outputPath}"`;
        
        const session = await FFmpegKit.execute(command);
        const returnCode = await session.getReturnCode();

        if (ReturnCode.isSuccess(returnCode)) {
          addLog(`Success: ${cut.name}`);
        } else {
          addLog(`Failed: ${cut.name}`);
          setSkipped(prev => [...prev, { video: video.name, cut: cut.name }]);
        }

        completedCuts++;
        await notifee.displayNotification({
          id: 'batch_progress',
          title: 'Batch Cutting Videos',
          body: `Processing ${completedCuts} of ${totalCuts} cuts`,
          android: {
            channelId,
            asForegroundService: true,
            progress: {
              max: totalCuts,
              current: completedCuts,
            },
          },
        });
      }
    }

    addLog("Batch processing complete!");
    setProcessing(false);

    await notifee.stopForegroundService();
    await notifee.displayNotification({
      id: 'batch_complete',
      title: 'Batch Complete',
      body: `Processed ${completedCuts} cuts. ${skipped.length > 0 ? `Skipped ${skipped.length}` : 'All successful!'}`,
      android: {
        channelId,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Button title="Start Background Processing" onPress={startBatch} disabled={processing} />
      
      <View style={styles.logContainer}>
        <Text style={styles.heading}>Logs:</Text>
        {logs.map((log, i) => <Text key={i} style={styles.logText}>{log}</Text>)}
      </View>

      {!processing && skipped.length > 0 && (
        <View style={styles.skippedContainer}>
          <Text style={styles.errorHeading}>Skipped/Failed Cuts:</Text>
          {skipped.map((s, i) => (
            <Text key={i} style={styles.errorText}>• Video: {s.video} | Cut: {s.cut}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  logContainer: { marginTop: 20, padding: 10, backgroundColor: '#eee', borderRadius: 8 },
  heading: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  logText: { fontSize: 12, marginBottom: 4 },
  skippedContainer: { marginTop: 20, padding: 10, backgroundColor: '#ffebee', borderRadius: 8 },
  errorHeading: { fontSize: 16, fontWeight: 'bold', color: 'red', marginBottom: 8 },
  errorText: { fontSize: 14, color: '#d32f2f', marginBottom: 4 },
});

export default BatchCutScreen;
