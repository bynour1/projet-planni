import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { usePlanning } from '../contexts/PlanningContext';
import { useUser } from '../contexts/UserContext';

function getMarkedDates(planning) {
  const marked = {};
  if (!planning) return marked;
  Object.keys(planning).forEach(label => {
    const match = label.match(/(\d{2})\/(\d{2})/);
    if (match) {
      const day = match[1];
      const month = match[2];
      const year = new Date().getFullYear();
      const key = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      marked[key] = { marked: true, dotColor: '#007bff' };
    }
  });
  return marked;
}

export default function MonPlanningScreen() {
  const { planning } = usePlanning();
  const { user } = useUser();
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('mois'); // 'mois' or 'semaine'
  const [medicalEvents, setMedicalEvents] = useState([
    { titre: 'Congrès de cardiologie', date: '2025-12-10', description: 'Conférence annuelle sur la cardiologie', lieu: 'Paris', type: 'Congrès' },
    { titre: 'Formation IRM', date: '2025-12-15', description: 'Formation avancée sur l’IRM', lieu: 'Lyon', type: 'Formation' }
  ]);
  const [newEvent, setNewEvent] = useState({ titre: '', date: '', description: '', lieu: '', type: '' });
  const [showEventForm, setShowEventForm] = useState(false);

  const markedDates = useMemo(() => getMarkedDates(planning), [planning]);

  let eventsForSelected = [];
  if (selected && planning) {
    const [y, m, d] = selected.split('-');
    const searchLabel = `${d}/${m}`;
    const label = Object.keys(planning).find(l => l.includes(searchLabel));
    if (label) eventsForSelected = planning[label] || [];
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Mon Planning</Text>
        </View>

        <View style={styles.switchRow}>
          <TouchableOpacity onPress={() => setView('mois')} style={[styles.switchBtn, view === 'mois' && styles.switchBtnActive]}>
            <Text style={[styles.switchText, view === 'mois' && styles.switchTextActive]}>Calendrier mensuel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setView('semaine')} style={[styles.switchBtn, view === 'semaine' && styles.switchBtnActive]}>
            <Text style={[styles.switchText, view === 'semaine' && styles.switchTextActive]}>Planning semaine</Text>
          </TouchableOpacity>
        </View>

        {view === 'mois' ? (
          <>
            <Calendar
              markedDates={{
                ...markedDates,
                ...(selected ? { [selected]: { selected: true, selectedColor: '#007bff' } } : {})
              }}
              onDayPress={day => setSelected(day.dateString)}
              theme={{ todayTextColor: '#28a745', arrowColor: '#007bff' }}
            />

            {selected && (
              <View style={styles.eventList}>
                <Text style={styles.eventTitle}>Événements du {selected} :</Text>
                {eventsForSelected.length > 0 ? eventsForSelected.map((ev, i) => (
                  <View key={i} style={styles.eventCard}>
                    <Text style={styles.eventType}>{ev.titre || ev.medecin || 'Événement'}</Text>
                    <Text style={styles.eventInfo}>🕒 {ev.heureDebut || ''} - {ev.heureFin || ''}</Text>
                    <Text style={styles.eventInfo}>👨‍⚕️ {ev.medecin || ''}  👷 {ev.technicien || ''}</Text>
                    <Text style={styles.eventInfo}>📍 {ev.adresse || ''}</Text>
                  </View>
                )) : <Text style={styles.noEvent}>Aucun événement</Text>}
              </View>
            )}

            <View style={styles.eventList}>
              <Text style={styles.eventTitle}>Événements médicaux (congrès, formation...)</Text>
              {medicalEvents.filter(ev => !selected || ev.date === selected).length > 0 ? medicalEvents.filter(ev => !selected || ev.date === selected).map((ev, i) => (
                <View key={i} style={styles.eventCardMedical}>
                  <Text style={styles.eventType}>{ev.titre} <Text style={{ fontSize: 12, color: '#28a745' }}>({ev.type})</Text></Text>
                  <Text style={styles.eventInfo}>{ev.description}</Text>
                  <Text style={styles.eventInfo}>📍 {ev.lieu}</Text>
                </View>
              )) : <Text style={styles.noEvent}>Aucun événement médical</Text>}

              {user?.role === 'admin' && (
                <>
                  <TouchableOpacity style={styles.addMedicalBtn} onPress={() => setShowEventForm(true)}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Ajouter un événement médical</Text>
                  </TouchableOpacity>
                  {showEventForm && (
                    <View style={styles.eventForm}>
                      <TextInput style={styles.input} placeholder="Titre" value={newEvent.titre} onChangeText={text => setNewEvent(ev => ({ ...ev, titre: text }))} />
                      <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={newEvent.date} onChangeText={text => setNewEvent(ev => ({ ...ev, date: text }))} />
                      <TextInput style={styles.input} placeholder="Type (Congrès, Formation...)" value={newEvent.type} onChangeText={text => setNewEvent(ev => ({ ...ev, type: text }))} />
                      <TextInput style={styles.input} placeholder="Lieu" value={newEvent.lieu} onChangeText={text => setNewEvent(ev => ({ ...ev, lieu: text }))} />
                      <TextInput style={styles.input} placeholder="Description" value={newEvent.description} onChangeText={text => setNewEvent(ev => ({ ...ev, description: text }))} />
                      <TouchableOpacity style={styles.saveMedicalBtn} onPress={() => {
                        if (newEvent.titre && newEvent.date) {
                          setMedicalEvents(evts => [...evts, newEvent]);
                          setNewEvent({ titre: '', date: '', description: '', lieu: '', type: '' });
                          setShowEventForm(false);
                        }
                      }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Enregistrer</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.cancelMedicalBtn} onPress={() => setShowEventForm(false)}>
                        <Text style={{ color: '#007bff', fontWeight: 'bold' }}>Annuler</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          </>
        ) : (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.eventTitle}>Planning de la semaine</Text>
            {Array.from({ length: 7 }, (_, i) => {
              const curr = new Date();
              const day = curr.getDay();
              const monday = new Date(curr);
              monday.setDate(curr.getDate() - ((day + 6) % 7));
              monday.setHours(0,0,0,0);
              const d = new Date(monday);
              d.setDate(monday.getDate() + i);
              const dd = String(d.getDate()).padStart(2, '0');
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit' });
              const events = planning && planning[`${dd}/${mm}`] ? planning[`${dd}/${mm}`] : [];
              return (
                <View key={i} style={{ marginBottom: 10 }}>
                  <Text style={{ fontWeight: 'bold', color: '#007bff', marginBottom: 2 }}>{dayLabel}</Text>
                  {events.length > 0 ? events.map((ev, j) => (
                    <View key={j} style={styles.eventCard}>
                      <Text style={styles.eventType}>{ev.titre}</Text>
                      <Text style={styles.eventInfo}>🕒 {ev.heureDebut || ''} - {ev.heureFin || ''}</Text>
                      <Text style={styles.eventInfo}>👨‍⚕️ {ev.medecin || ''}  👷 {ev.technicien || ''}</Text>
                      <Text style={styles.eventInfo}>📍 {ev.adresse || ''}</Text>
                    </View>
                  )) : <Text style={styles.noEvent}>Aucun événement</Text>}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingTop: 6, paddingLeft: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  switchBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f1f1f1', marginHorizontal: 6 },
  switchBtnActive: { backgroundColor: '#007bff' },
  switchText: { color: '#333' },
  switchTextActive: { color: '#fff' },
  eventList: { padding: 10 },
  eventTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  eventCard: { backgroundColor: '#f1f8ff', borderRadius: 8, padding: 10, marginBottom: 8 },
  eventCardMedical: { backgroundColor: '#fffbe6', borderRadius: 8, padding: 10, marginBottom: 8 },
  eventType: { fontWeight: 'bold', color: '#007bff' },
  eventInfo: { color: '#333', marginTop: 4 },
  noEvent: { color: '#888', fontStyle: 'italic' },
  addMedicalBtn: { backgroundColor: '#007bff', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  eventForm: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginBottom: 8 },
  saveMedicalBtn: { backgroundColor: '#28a745', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  cancelMedicalBtn: { padding: 10, alignItems: 'center', marginTop: 8 },
});

