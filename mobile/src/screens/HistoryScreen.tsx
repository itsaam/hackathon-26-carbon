import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import api from '../services/api';

interface HistoryRow {
  calculatedAt: string;
  totalCo2Kg: number;
  co2PerM2: number;
  co2PerEmployee: number;
}

interface Props {
  route: { params: { id: number } };
}

export default function HistoryScreen({ route }: Props) {
  const { id } = route.params;
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<HistoryRow[]>(`/sites/${id}/results`);
        setRows(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color="#22c55e" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {rows.map((r) => (
        <View key={r.calculatedAt} style={styles.row}>
          <Text style={styles.date}>{new Date(r.calculatedAt).toLocaleDateString()}</Text>
          <Text style={styles.value}>
            {(r.totalCo2Kg / 1000).toFixed(1)} t – {r.co2PerM2.toFixed(1)} /m² –{' '}
            {r.co2PerEmployee.toFixed(1)} /empl.
          </Text>
        </View>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 16
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  row: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#111827'
  },
  date: {
    color: '#e5e7eb',
    marginBottom: 2
  },
  value: {
    color: '#9ca3af',
    fontSize: 12
  }
});

