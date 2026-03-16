import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { StyleSheet, TextInput, View } from 'react-native';

interface Material {
  id: number;
  name: string;
}

interface MaterialSelection {
  materialId: number | null;
  quantity: string;
}

interface Props {
  materials: Material[];
  value: MaterialSelection;
  onChange: (value: MaterialSelection) => void;
}

export default function MaterialInput({ materials, value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.materialCol}>
        <Picker
          selectedValue={value.materialId}
          onValueChange={(itemValue) =>
            onChange({ ...value, materialId: itemValue as number | null })
          }
          style={styles.picker}
        >
          <Picker.Item label="Matériau" value={null} />
          {materials.map((m) => (
            <Picker.Item key={m.id} label={m.name} value={m.id} />
          ))}
        </Picker>
      </View>
      <TextInput
        style={styles.quantity}
        placeholder="Tonnes"
        placeholderTextColor="#6b7280"
        keyboardType="numeric"
        value={value.quantity}
        onChangeText={(text) => onChange({ ...value, quantity: text })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 8
  },
  materialCol: {
    flex: 1,
    marginRight: 8
  },
  picker: {
    backgroundColor: '#0f172a',
    color: '#e5e7eb',
    borderRadius: 10
  },
  quantity: {
    width: 90,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#e5e7eb'
  }
});
