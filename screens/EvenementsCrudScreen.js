import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EvenementsCrudScreen() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ titre: '', type: '', date: '', lieu: '' });
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAdd = () => {
    if (!form.titre || !form.type || !form.date || !form.lieu) return;
    setEvents(evts => [...evts, form]);
    setForm({ titre: '', type: '', date: '', lieu: '' });
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
    setForm({ titre: '', type: '', date: '', lieu: '' });
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
    <ScrollView style={{ flex: 1, backgroundColor: '#fffbe6', padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#856404', marginBottom: 10 }}>🎓 Événements CRUD</Text>
      <TextInput style={styles.input} placeholder="Titre" value={form.titre} onChangeText={v => setForm(f => ({ ...f, titre: v }))} />
      <TextInput style={styles.input} placeholder="Type (formation, congrès...)" value={form.type} onChangeText={v => setForm(f => ({ ...f, type: v }))} />
      <TextInput style={styles.input} placeholder="Date (ex: 12/12/2025)" value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} />
      <TextInput style={styles.input} placeholder="Lieu" value={form.lieu} onChangeText={v => setForm(f => ({ ...f, lieu: v }))} />
      {editingIndex === null ? (
        <TouchableOpacity style={styles.button} onPress={handleAdd}><Text style={styles.buttonText}>Ajouter</Text></TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.button, { backgroundColor: '#ffc107' }]} onPress={handleUpdate}><Text style={styles.buttonText}>Modifier</Text></TouchableOpacity>
      )}
      <View style={{ marginTop: 20 }}>
        {events.map((ev, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.cardTitle}>{ev.titre}</Text>
            <Text>Type : {ev.type}</Text>
            <Text>Date : {ev.date}</Text>
            <Text>Lieu : {ev.lieu}</Text>
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
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  button: { backgroundColor: '#007bff', borderRadius: 8, padding: 10, alignItems: 'center', marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#f1f8ff', borderRadius: 8, padding: 10, marginBottom: 8 },
  cardTitle: { fontWeight: 'bold', color: '#007bff', marginBottom: 4 },
  editBtn: { backgroundColor: '#ffc', borderRadius: 6, padding: 6 },
  deleteBtn: { backgroundColor: '#fee', borderRadius: 6, padding: 6 },
};