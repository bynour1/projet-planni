import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EvenementsFormScreen() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ titre: '', type: '', date: '', lieu: '' });

  const handleAdd = () => {
    if (!form.titre || !form.type || !form.date || !form.lieu) return;
    setEvents(evts => [...evts, form]);
    setForm({ titre: '', type: '', date: '', lieu: '' });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fffbe6', padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#856404', marginBottom: 10 }}>🎓 Événements hors planning</Text>
      <Text style={{ color: '#555', marginBottom: 10 }}>Ajoutez ici les formations, congrès, soutenances, etc.</Text>
      <TextInput style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 }} placeholder="Titre" value={form.titre} onChangeText={v => setForm(f => ({ ...f, titre: v }))} />
      <TextInput style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 }} placeholder="Type (formation, congrès...)" value={form.type} onChangeText={v => setForm(f => ({ ...f, type: v }))} />
      <TextInput style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 }} placeholder="Date (ex: 12/12/2025)" value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} />
      <TextInput style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 }} placeholder="Lieu" value={form.lieu} onChangeText={v => setForm(f => ({ ...f, lieu: v }))} />
      <TouchableOpacity style={{ backgroundColor: '#007bff', borderRadius: 8, padding: 10, marginTop: 8 }} onPress={handleAdd}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ajouter</Text>
      </TouchableOpacity>
      {events.length > 0 && (
        <View style={{ marginTop: 16 }}>
          {events.map((ev, idx) => (
            <View key={idx} style={{ backgroundColor: '#f1f8ff', borderRadius: 8, padding: 10, marginBottom: 8 }}>
              <Text style={{ fontWeight: 'bold', color: '#007bff' }}>{ev.titre}</Text>
              <Text>Type : {ev.type}</Text>
              <Text>Date : {ev.date}</Text>
              <Text>Lieu : {ev.lieu}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
