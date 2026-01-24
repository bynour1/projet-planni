import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function PlanningCrudScreen() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ medecin: '', technicien: '', adresse: '', heureDebut: '', heureFin: '' });
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAdd = () => {
    if (!form.medecin || !form.technicien || !form.adresse || !form.heureDebut || !form.heureFin) return;
    setEvents(evts => [...evts, form]);
    setForm({ medecin: '', technicien: '', adresse: '', heureDebut: '', heureFin: '' });
  };

  const handleEdit = (idx) => {
    setEditingIndex(idx);
    setForm(events[idx]);
  };

  const handleUpdate = () => {
    if (editingIndex === null) return;
    const updated = [...events];
    updated[editingIndex] = form;
    setEvents(updated);
    setEditingIndex(null);
    setForm({ medecin: '', technicien: '', adresse: '', heureDebut: '', heureFin: '' });
  };

  const handleDelete = (idx) => {
    Alert.alert('Supprimer', 'Confirmer la suppression ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => {
        setEvents(evts => evts.filter((_, i) => i !== idx));
      }}
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 10 }}>📋 Planning CRUD</Text>
      <TextInput style={styles.input} placeholder="Médecin" value={form.medecin} onChangeText={v => setForm(f => ({ ...f, medecin: v }))} />
      <TextInput style={styles.input} placeholder="Technicien" value={form.technicien} onChangeText={v => setForm(f => ({ ...f, technicien: v }))} />
      <TextInput style={styles.input} placeholder="Adresse" value={form.adresse} onChangeText={v => setForm(f => ({ ...f, adresse: v }))} />
      <TextInput style={styles.input} placeholder="Heure début" value={form.heureDebut} onChangeText={v => setForm(f => ({ ...f, heureDebut: v }))} />
      <TextInput style={styles.input} placeholder="Heure fin" value={form.heureFin} onChangeText={v => setForm(f => ({ ...f, heureFin: v }))} />
      {editingIndex === null ? (
        <TouchableOpacity style={styles.button} onPress={handleAdd}><Text style={styles.buttonText}>Ajouter</Text></TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.button, { backgroundColor: '#ffc107' }]} onPress={handleUpdate}><Text style={styles.buttonText}>Modifier</Text></TouchableOpacity>
      )}
      <View style={{ marginTop: 20 }}>
        {events.map((ev, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.cardTitle}>🩺 {ev.medecin} | 🔧 {ev.technicien}</Text>
            <Text>Adresse : {ev.adresse}</Text>
            <Text>Heure : {ev.heureDebut} - {ev.heureFin}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(idx)}><Text>✏️</Text></TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(idx)}><Text>🗑️</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = {
  input: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  button: { backgroundColor: '#007bff', borderRadius: 8, padding: 10, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#f1f8ff', borderRadius: 8, padding: 10, marginBottom: 8 },
  cardTitle: { fontWeight: 'bold', color: '#007bff', marginBottom: 4 },
  editBtn: { backgroundColor: '#ffc', borderRadius: 6, padding: 6 },
  deleteBtn: { backgroundColor: '#fee', borderRadius: 6, padding: 6 },
};