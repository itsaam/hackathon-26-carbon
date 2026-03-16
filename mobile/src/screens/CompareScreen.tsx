import React, { useEffect, useState } from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import api from '../services/api';

interface Site {
  id: number;
  name: string;
}

interface CompareRow {
  name: string;
  totalCo2Kg: number;
  co2PerM2: number;
  co2PerEmployee: number;
}

export default function CompareScreen() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<CompareRow[]>([]);

  useEffect(() => {
    (async () => {
      const res = await api.get<Site[]>('/sites');
      setSites(res.data);
    })();
  }, []);

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const compare = async () => {
    if (!selectedIds.length) return;
    const res = await api.get<CompareRow[]>('/sites/compare', {
      params: { ids: selectedIds.join(',') }
    });
    setRows(res.data as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Comparer des sites</Text>

      <View style={styles.list}>
        {sites.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.siteItem,
              selectedIds.includes(s.id) && styles.siteItemSelected
            ]}
            onPress={() => toggle(s.id)}
          >
            <Text style={styles.siteText}>{s.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title="Comparer" onPress={compare} />

      {rows.length > 0 && (
        <View style={styles.table}>
          {rows.map((r) => (
            <View key={r.name} style={styles.row}>
              <Text style={styles.cellName}>{r.name}</Text>
              <Text style={styles.cell}>
                {(r.totalCo2Kg / 1000).toFixed(1)} t
              </Text>
              <Text style={styles.cell}>{r.co2PerM2.toFixed(1)} /m²</Text>
              <Text style={styles.cell}>{r.co2PerEmployee.toFixed(1)} /empl.</Text>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 12
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  siteItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 8,
    marginBottom: 8
  },
  siteItemSelected: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e'
  },
  siteText: {
    color: '#e5e7eb',
    fontSize: 12
  },
  table: {
    marginTop: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#111827'
  },
  cellName: {
    flex: 1,
    color: '#e5e7eb'
  },
  cell: {
    width: 70,
    textAlign: 'right',
    color: '#9ca3af',
    fontSize: 12
  }
});
