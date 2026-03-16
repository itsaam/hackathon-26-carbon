import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  label: string;
  value: string;
  unit?: string;
}

export default function KpiCard({ label, value, unit }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12
  },
  label: {
    fontSize: 12,
    color: '#9ca3af'
  },
  value: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#e5e7eb'
  },
  unit: {
    fontSize: 10,
    color: '#9ca3af'
  }
});
