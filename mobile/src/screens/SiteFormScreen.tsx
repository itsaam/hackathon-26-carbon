import React, { useEffect, useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import api from '../services/api';
import { RootStackParamList } from '../navigation/AppNavigator';
import MaterialInput from '../components/MaterialInput';

type Props = NativeStackScreenProps<RootStackParamList, 'SiteForm'>;

interface Material {
  id: number;
  name: string;
}

interface MaterialSelection {
  materialId: number | null;
  quantity: string;
}

export default function SiteFormScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [surfaceM2, setSurfaceM2] = useState('');
  const [parkingUnderground, setParkingUnderground] = useState('0');
  const [parkingBasement, setParkingBasement] = useState('0');
  const [parkingOutdoor, setParkingOutdoor] = useState('0');
  const [energyMwh, setEnergyMwh] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [workstationCount, setWorkstationCount] = useState('');
  const [materials, setMaterials] = useState<MaterialSelection[]>([{ materialId: null, quantity: '' }]);
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);

  useEffect(() => {
    (async () => {
      const res = await api.get<Material[]>('/materials');
      setAllMaterials(res.data);
    })();
  }, []);

  const handleSubmit = async () => {
    const payload = {
      name,
      surfaceM2: Number(surfaceM2),
      parkingUnderground: Number(parkingUnderground),
      parkingBasement: Number(parkingBasement),
      parkingOutdoor: Number(parkingOutdoor),
      energyConsumptionKwh: Number(energyMwh) * 1000,
      employeeCount: Number(employeeCount),
      workstationCount: workstationCount ? Number(workstationCount) : 0
    };

    const siteRes = await api.post('/sites', payload);
    const siteId = siteRes.data.id;
    await api.post(`/sites/${siteId}/calculate`);
    navigation.replace('SiteDetail', { id: siteId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nouveau site</Text>

        <TextInput
          style={styles.input}
          placeholder="Nom du site"
          placeholderTextColor="#6b7280"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Surface (m²)"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={surfaceM2}
          onChangeText={setSurfaceM2}
        />
        <TextInput
          style={styles.input}
          placeholder="Parking sous-dalle"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={parkingUnderground}
          onChangeText={setParkingUnderground}
        />
        <TextInput
          style={styles.input}
          placeholder="Parking sous-sol"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={parkingBasement}
          onChangeText={setParkingBasement}
        />
        <TextInput
          style={styles.input}
          placeholder="Parkings aériens"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={parkingOutdoor}
          onChangeText={setParkingOutdoor}
        />
        <TextInput
          style={styles.input}
          placeholder="Consommation énergie (MWh/an)"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={energyMwh}
          onChangeText={setEnergyMwh}
        />
        <TextInput
          style={styles.input}
          placeholder="Nombre d'employés"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={employeeCount}
          onChangeText={setEmployeeCount}
        />
        <TextInput
          style={styles.input}
          placeholder="Postes de travail"
          placeholderTextColor="#6b7280"
          keyboardType="numeric"
          value={workstationCount}
          onChangeText={setWorkstationCount}
        />

        <Text style={styles.sectionTitle}>Matériaux</Text>
        {materials.map((m, index) => (
          <MaterialInput
            key={index}
            materials={allMaterials}
            value={m}
            onChange={(value) => {
              const copy = [...materials];
              copy[index] = value;
              setMaterials(copy);
            }}
          />
        ))}

        <Button title="Enregistrer et calculer l'empreinte" onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617'
  },
  content: {
    padding: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 16
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#e5e7eb',
    marginBottom: 10
  },
  sectionTitle: {
    color: '#e5e7eb',
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8
  }
});
