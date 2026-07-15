import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ActivityIndicator, 
  TouchableOpacity, Alert, SafeAreaView 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { getPreviewUrl } from '../services/api';

export default function PreviewScreen({ route, navigation }) {
  const { projectId } = route.params;
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreviewUrl = async () => {
      try {
        const data = await getPreviewUrl(projectId);
        setPreviewUrl(data.preview_url);
      } catch (err) {
        Alert.alert(
          'Error', 
          'Gagal memuat URL pratinjau. Pastikan server lokal backend berjalan di port 8080.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreviewUrl();
  }, [projectId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>◀ CLOSE PREVIEW</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Project #{projectId} Preview</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Menghubungkan ke Local Web Server...</Text>
        </View>
      ) : (
        previewUrl && (
          <WebView
            source={{ uri: previewUrl }}
            style={styles.webview}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color="#3b82f6" />
              </View>
            )}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0a0e',
  },
  header: {
    height: 56,
    backgroundColor: '#14131a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#24232a',
  },
  backBtn: {
    backgroundColor: '#0b0a0e',
    borderWidth: 1,
    borderColor: '#24232a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 16,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#8b8a91',
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 16,
    textAlign: 'center',
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
