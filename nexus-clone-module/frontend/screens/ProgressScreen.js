import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ActivityIndicator, 
  TouchableOpacity, SafeAreaView 
} from 'react-native';
import { getJobStatus } from '../services/api';

export default function ProgressScreen({ route, navigation }) {
  const { projectId } = route.params;
  const [status, setStatus] = useState('pending');
  const [percent, setPercent] = useState(0);
  const [stage, setStage] = useState('queued');

  useEffect(() => {
    let timer;
    const checkStatus = async () => {
      try {
        const result = await getJobStatus(projectId);
        setStatus(result.status);
        setPercent(result.progress_percent);
        setStage(result.current_stage);
        
        if (result.status === 'completed') {
          navigation.replace('Result', { projectId });
        } else if (result.status === 'failed') {
          // Keep showing screen with failed status
        } else {
          // Poll again in 1 second
          timer = setTimeout(checkStatus, 1000);
        }
      } catch (err) {
        console.error(err);
        timer = setTimeout(checkStatus, 1500);
      }
    };
    
    checkStatus();
    
    return () => clearTimeout(timer);
  }, [projectId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerBox}>
        {status === 'failed' ? (
          <View style={styles.stateContainer}>
            <Text style={[styles.title, { color: '#ef4444' }]}>CLONING JOB FAILED</Text>
            <Text style={styles.stageText}>Stage: {stage.toUpperCase()}</Text>
            <Text style={styles.descText}>The decant engine encountered a fatal execution error. Check backend logs.</Text>
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.backBtnText}>BACK TO DASHBOARD</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.title}>CLONING IN PROGRESS</Text>
            
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${percent}%` }]} />
            </View>
            
            <Text style={styles.percentText}>{percent}%</Text>
            <Text style={styles.stageText}>CURRENT STAGE: {stage.toUpperCase()}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0a0e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    width: '100%',
    padding: 32,
  },
  stateContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#1e1d24',
    borderRadius: 3,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  percentText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 16,
  },
  stageText: {
    color: '#8b8a91',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 10,
  },
  descText: {
    color: '#5b5a61',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  backBtn: {
    marginTop: 32,
    backgroundColor: '#14131a',
    borderWidth: 1,
    borderColor: '#24232a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  }
});
