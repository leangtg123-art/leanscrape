import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, Switch, ActivityIndicator, Alert, SafeAreaView 
} from 'react-native';
import { startCloneJob } from '../services/api';

export default function NewCloneScreen({ navigation }) {
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState('2');
  const [includeAssets, setIncludeAssets] = useState(true);
  const [forceTool, setForceTool] = useState('auto');
  const [loading, setLoading] = useState(false);

  const handleStartClone = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Silakan masukkan URL website target.');
      return;
    }
    
    setLoading(true);
    try {
      const result = await startCloneJob(url, {
        depth: parseInt(depth) || 2,
        include_assets: includeAssets,
        force_tool: forceTool
      });
      
      navigation.replace('Progress', { projectId: result.project_id });
    } catch (err) {
      Alert.alert('Kloning Gagal', err.message || 'Koneksi API gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>LAUNCH NEW CLONE JOB</Text>
        <Text style={styles.subtitle}>Enter the URL to clone assets & extract structured variables.</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>TARGET URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            placeholderTextColor="#5b5a61"
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>MAX CRAWL DEPTH</Text>
          <TextInput
            style={styles.input}
            placeholder="2"
            placeholderTextColor="#5b5a61"
            value={depth}
            onChangeText={setDepth}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.switchGroup}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.switchLabel}>Clone & Package Assets</Text>
            <Text style={styles.switchDesc}>Download all images, styles, and js files locally.</Text>
          </View>
          <Switch
            value={includeAssets}
            onValueChange={setIncludeAssets}
            trackColor={{ false: '#24232a', true: '#3b82f6' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>ENGINE ENGINE MODE</Text>
          <View style={styles.modeContainer}>
            {['auto', 'decant', 'site-cloner'].map(mode => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeButton,
                  forceTool === mode ? styles.modeButtonActive : null
                ]}
                onPress={() => setForceTool(mode)}
              >
                <Text style={[
                  styles.modeText,
                  forceTool === mode ? styles.modeTextActive : null
                ]}>{mode.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.submitBtn}
          onPress={handleStartClone}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>CLONE NOW ↗</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0a0e',
  },
  scrollContainer: {
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: '#8b8a91',
    fontSize: 12,
    marginTop: 6,
    marginBottom: 28,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#a3a2a9',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#14131a',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#24232a',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14131a',
    borderRadius: 6,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#24232a',
  },
  switchLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  switchDesc: {
    color: '#8b8a91',
    fontSize: 10,
    marginTop: 2,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#14131a',
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#24232a',
    alignItems: 'center',
  },
  modeButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  modeText: {
    color: '#5b5a61',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  modeTextActive: {
    color: '#3b82f6',
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  }
});
