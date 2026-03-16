import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import api from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import KpiCard from '../components/KpiCard';

type Props = NativeStackScreenProps<RootStackParamList, 'SiteDetail'>;

interface Site {
  id: number;
  name: string;
  surfaceM2: number;
  parkingUnderground: number;
  parkingBasement: number;
  parkingOutdoor: number;
  energyConsumptionKwh: number;
  employeeCount: number;
  workstationCount?: number;
}

interface CarbonResult {
  totalCo2Kg: number;
  co2PerM2: number;
  co2PerEmployee: number;
}

export default function SiteDetailScreen({ route }: Props) {
  const { id } = route.params;
  const [site, setSite] = useState<Site | null>(null);
  const [result, setResult] = useState<CarbonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [siteRes, latestRes] = await Promise.all([
        api.get<Site>(`/sites/${id}`),
        api.get<CarbonResult>(`/sites/${id}/results/latest`)
      ]);
      setSite(siteRes.data);
      setResult(latestRes.data);
    } finally {
      setLoading(false);
    }
  };

  const recalculate = async () => {
    setCalculating(true);
    try {
      const res = await api.post<CarbonResult>(`/sites/${id}/calculate`);
      setResult(res.data);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading || !site) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator color="#22c55e" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{site.name}</Text>
          <Text style={styles.subtitle}>
            {site.surfaceM2} m² · {site.employeeCount} employés
          </Text>
        </View>
        <Button title={calculating ? 'Recalcul…' : 'Recalculer'} onPress={recalculate} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Données du site</Text>
        <Text style={styles.text}>
          Parkings : {site.parkingUnderground} sous-dalle, {site.parkingBasement} sous-sol,{' '}
          {site.parkingOutdoor} aériens
        </Text>
        <Text style={styles.text}>Postes de travail : {site.workstationCount ?? '—'}</Text>
      </View>

      {result && (
        <View style={styles.kpiRow}>
          <KpiCard
            label="CO₂ total"
            value={`${(result.totalCo2Kg / 1000).toFixed(1)}`}
            unit="tCO₂e"
          />
          <KpiCard
            label="CO₂ / m²"
            value={result.co2PerM2.toFixed(1)}
            unit="kgCO₂e/m²"
          />
          <KpiCard
            label="CO₂ / employé"
            value={result.co2PerEmployee.toFixed(1)}
            unit="kgCO₂e/empl."
          />
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
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e5e7eb'
  },
  subtitle: {
    color: '#9ca3af',
    marginTop: 4
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontWeight: '600',
    marginBottom: 8
  },
  text: {
    color: '#9ca3af'
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8
  }
});
