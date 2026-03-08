import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useUser } from "../contexts/UserContext";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffbe6' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#856404', marginBottom: 6, paddingTop: 6, paddingLeft: 4 },
  subtitle: { color: '#555', marginBottom: 12, paddingLeft: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  dateInput: { justifyContent: 'center' },
  addButton: { backgroundColor: '#007bff', borderRadius: 8, padding: 10, marginTop: 4, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  eventCard: { backgroundColor: '#f1f8ff', borderRadius: 8, padding: 10, marginBottom: 8 },
  eventTitle: { fontWeight: 'bold', color: '#007bff', marginBottom: 4 },
  readOnlyMessage: { backgroundColor: '#fff3cd', color: '#856404', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 14 },
});

export default function EvenementsScreen() {
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin;

  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ titre: '', type: '', date: '', lieu: '' });
  const [selectedDate, setSelectedDate] = useState(null);

  const handleAdd = () => {
    if (!form.titre || !form.type || !form.date || !form.lieu) return;
    // normalize date to ISO (YYYY-MM-DD) if user entered DD/MM/YYYY
    const normalized = normalizeDate(form.date);
    const toSave = { ...form, date: normalized };
    setEvents(evts => [...evts, toSave]);
    setForm({ titre: '', type: '', date: '', lieu: '' });
  };

  const normalizeDate = (d) => {
    if (!d) return '';
    // if already ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    // match DD/MM/YYYY or D/M/YYYY
    const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      const dd = m[1].padStart(2, '0');
      const mm = m[2].padStart(2, '0');
      const yyyy = m[3];
      return `${yyyy}-${mm}-${dd}`;
    }
    return d;
  };

  const markedDates = useMemo(() => {
    const marks = {};
    events.forEach(ev => {
      if (!ev.date) return;
      marks[ev.date] = { marked: true, dotColor: '#856404' };
    });
    if (selectedDate) marks[selectedDate] = { ...(marks[selectedDate] || {}), selected: true, selectedColor: '#856404' };
    return marks;
  }, [events, selectedDate]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>🎓 Événements</Text>
      <Text style={styles.subtitle}>Ajoutez ici les formations, congrès, soutenances, etc.</Text>

      {/* Formulaire d'ajout - Admin seulement */}
      {canEdit && (
        <>
          <TextInput style={styles.input} placeholder="Titre" value={form.titre} onChangeText={v => setForm(f => ({ ...f, titre: v }))} />
          <TextInput style={styles.input} placeholder="Type (formation, congrès...)" value={form.type} onChangeText={v => setForm(f => ({ ...f, type: v }))} />
          <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} />
          <TextInput style={styles.input} placeholder="Lieu" value={form.lieu} onChangeText={v => setForm(f => ({ ...f, lieu: v }))} />

          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Message pour les non-admin */}
      {!canEdit && (
        <Text style={styles.readOnlyMessage}>Vous pouvez uniquement consulter les événements. Pour ajouter ou modifier, contactez l'administrateur.</Text>
      )}

      {events.length > 0 && (
        <View style={{ marginTop: 16 }}>
          {events
            .filter(ev => !selectedDate || ev.date === selectedDate)
            .map((ev, idx) => (
            <View key={idx} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{ev.titre}</Text>
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
