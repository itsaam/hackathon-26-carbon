import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import api from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SiteList'>;

interface Site {
  id: number;
  name: string;
  surfaceM2: number;
  employeeCount: number;
}

function SiteItem({ site, onPress }: { site: Site; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Text style={styles.itemTitle}>{site.name}</Text>
      <Text style={styles.itemText}>
        {site.surfaceM2} m² · {site.employeeCount} employés
      </Text>
    </TouchableOpacity>
  );
}

export default function SiteListScreen({ navigation }: Props) {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSites = async () => {
    setLoading(true);
    try {
      const response = await api.get<Site[]>('/sites');
      setSites(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadSites);
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator color="#22c55e" />
      ) : (
        <FlatList
          data={sites}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <SiteItem site={item} onPress={() => navigation.navigate('SiteDetail', { id: item.id })} />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SiteForm')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617'
  },
  listContent: {
    padding: 16
  },
  item: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10
  },
  itemTitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600'
  },
  itemText: {
    color: '#9ca3af',
    marginTop: 4
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fabText: {
    fontSize: 28,
    color: '#020617'
  }
});
