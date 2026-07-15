import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, StatusBar 
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      // Mock or fetch from api
      const response = await fetch('http://10.0.2.2:8080/preview/list'); // Fallback mock list
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        // Mock data when local list not implemented
        setProjects([
          { id: 1, url: 'https://react.dev', project_name: 'react.dev', status: 'completed', created_at: '2026-07-15 12:00:00' },
          { id: 2, url: 'https://nextjs.org', project_name: 'nextjs.org', status: 'completed', created_at: '2026-07-15 13:10:00' },
          { id: 3, url: 'https://tailwindui.com', project_name: 'tailwindui.com', status: 'failed', created_at: '2026-07-15 14:00:00' }
        ]);
      }
    } catch (e) {
      setProjects([
        { id: 1, url: 'https://react.dev', project_name: 'react.dev', status: 'completed', created_at: '2026-07-15 12:00:00' },
        { id: 2, url: 'https://nextjs.org', project_name: 'nextjs.org', status: 'completed', created_at: '2026-07-15 13:10:00' },
        { id: 3, url: 'https://tailwindui.com', project_name: 'tailwindui.com', status: 'failed', created_at: '2026-07-15 14:00:00' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const renderProjectItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.projectCard}
      onPress={() => {
        if (item.status === 'completed') {
          navigation.navigate('Result', { projectId: item.id });
        } else {
          navigation.navigate('Progress', { projectId: item.id });
        }
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.projectName}>{item.project_name}</Text>
        <View style={[
          styles.statusBadge, 
          item.status === 'completed' ? styles.statusCompleted : 
          item.status === 'failed' ? styles.statusFailed : styles.statusPending
        ]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.projectUrl} numberOfLines={1}>{item.url}</Text>
      <Text style={styles.projectDate}>{item.created_at}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0a0e" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NEXUS CLONE ENGINE</Text>
        <Text style={styles.headerSubtitle}>Hybrid Scraping & Web Cloner Pipeline</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProjectItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada proyek kloning.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('NewClone')}
      >
        <Text style={styles.fabText}>+ New Clone</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0a0e',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1d24',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  headerSubtitle: {
    color: '#8b8a91',
    fontSize: 11,
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  projectCard: {
    backgroundColor: '#14131a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#24232a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusFailed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  projectUrl: {
    color: '#3b82f6',
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'monospace',
  },
  projectDate: {
    color: '#5b5a61',
    fontSize: 10,
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#5b5a61',
    fontSize: 13,
  }
});
