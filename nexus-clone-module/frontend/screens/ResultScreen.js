import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ActivityIndicator, 
  TouchableOpacity, ScrollView, Alert, Linking, SafeAreaView 
} from 'react-native';
import { getJobResult, getDownloadUrl } from '../services/api';

export default function ResultScreen({ route, navigation }) {
  const { projectId } = route.params;
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getJobResult(projectId);
        setResult(data);
      } catch (err) {
        Alert.alert('Error', 'Gagal memuat hasil kloning.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResult();
  }, [projectId]);

  const handleDownload = () => {
    const downloadUrl = getDownloadUrl(projectId);
    Linking.openURL(downloadUrl).catch(() => {
      Alert.alert('Error', 'Gagal membuka tautan unduhan.');
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>CLONE METRICS REPORT</Text>
        <Text style={styles.subtitle}>Analysis summary computed by NCE AI Orchestrator Layer.</Text>

        <View style={styles.metricGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>VISUAL SIMILARITY</Text>
            <Text style={[
              styles.metricValue, 
              { color: result.similarity_score >= 0.9 ? '#10b981' : '#f59e0b' }
            ]}>
              {(result.similarity_score * 100).toFixed(0)}%
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>FILE SIZE</Text>
            <Text style={styles.metricValue}>{result.file_size_mb} MB</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>TOTAL PAGES</Text>
            <Text style={styles.metricValue}>{result.total_pages}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>BROKEN ASSETS</Text>
            <Text style={[
              styles.metricValue,
              { color: result.broken_assets_count > 0 ? '#ef4444' : '#fff' }
            ]}>
              {result.broken_assets_count}
            </Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>ENGINE METADATA</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cloning Tool</Text>
            <Text style={styles.detailVal}>{result.tool_used.toUpperCase()}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Site Structure</Text>
            <Text style={styles.detailVal}>{result.site_type.toUpperCase()}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Job ID</Text>
            <Text style={styles.detailVal}>#{result.project_id}</Text>
          </View>
        </View>

        <View style={styles.btnGroup}>
          <TouchableOpacity 
            style={[styles.btn, styles.btnPrimary]}
            onPress={() => navigation.navigate('Preview', { projectId })}
          >
            <Text style={styles.btnPrimaryText}>OFFLINE PREVIEW ↗</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, styles.btnSecondary]}
            onPress={handleDownload}
          >
            <Text style={styles.btnSecondaryText}>DOWNLOAD ZIP ARCHIVE</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.btnText}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.btnTextLink}>BACK TO DASHBOARD</Text>
          </TouchableOpacity>
        </View>
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
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#14131a',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#24232a',
  },
  metricLabel: {
    color: '#8b8a91',
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  metricValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  detailsCard: {
    backgroundColor: '#14131a',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#24232a',
    marginBottom: 32,
  },
  cardTitle: {
    color: '#a3a2a9',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#24232a',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    color: '#5b5a61',
    fontSize: 12,
  },
  detailVal: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  btnGroup: {
    gap: 12,
  },
  btn: {
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#3b82f6',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  btnSecondary: {
    backgroundColor: '#14131a',
    borderWidth: 1,
    borderColor: '#24232a',
  },
  btnSecondaryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  btnText: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  btnTextLink: {
    color: '#5b5a61',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
