import { Ionicons } from '@expo/vector-icons';
import { addDays, format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { usePlanning } from "../contexts/PlanningContext";
import { useUser } from "../contexts/UserContext";

// Événements hors planning déplacé vers EvenementsScreen

export default function PlanningScreen() {
  const { planning, addEvent, removeEvent, updateEvent } = usePlanning();
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin;

  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  const [editingDay, setEditingDay] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ medecin: "", technicien: "", adresse: "" });

  const handleAdd = (dayLabel) => {
    if (!form.medecin || !form.technicien || !form.adresse) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    addEvent(dayLabel, form);
    setForm({ medecin: "", technicien: "", adresse: "" });
    setEditingDay(null);
  };

  const handleUpdate = (dayLabel) => {
    if (!form.medecin || !form.technicien || !form.adresse) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    updateEvent(dayLabel, editingIndex, { ...form });
    setForm({ medecin: "", technicien: "", adresse: "" });
    setEditingDay(null);
    setEditingIndex(null);
  };

  const handleDelete = (dayLabel, index) => {
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer cet événement ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => removeEvent(dayLabel, index) }
      ]
    );
  };

  // Navigation handlers
  const goToPreviousWeek = () => setCurrentWeek(addDays(currentWeek, -7));
  const goToNextWeek = () => setCurrentWeek(addDays(currentWeek, 7));
  const goToCurrentWeek = () => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Sidebar provided globally in app/_layout.jsx; local burger removed */}
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>📋 Planning Hebdomadaire</Text>
          <Text style={styles.headerSubtitle}>
            Semaine du {format(currentWeek, "dd MMMM yyyy", { locale: fr })}
          </Text>
        </View>
        <ScrollView style={styles.content}>
          {days.map((day, idx) => {
            const dayLabel = format(day, "EEEE dd/MM", { locale: fr });
            const events = planning[dayLabel] || [];
            const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            return (
              <View key={idx} style={[styles.dayContainer, isToday && styles.todayContainer]}>
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayTitle, isToday && styles.todayTitle]}>
                    {format(day, "EEEE", { locale: fr })}
                  </Text>
                  <Text style={[styles.dayDate, isToday && styles.todayDate]}>
                    {format(day, "dd MMMM", { locale: fr })}
                  </Text>
                  {isToday && <Text style={styles.todayBadge}>Aujourd'hui</Text>}
                </View>
                {/* Affichage des événements */}
                {events.length === 0 ? (
                  <Text style={styles.noEvent}>Aucun événement</Text>
                ) : (
                  events.map((event, i) => (
                    <View key={i} style={styles.eventCard}>
                      <Text style={styles.eventMedecin}>🩺 {event.medecin}</Text>
                      <Text style={styles.eventTechnicien}>🔧 {event.technicien}</Text>
                      <Text style={styles.eventAdresse}>📍 {event.adresse}</Text>
                      {canEdit && (
                        <View style={styles.eventActions}>
                          <TouchableOpacity onPress={() => { setEditingDay(dayLabel); setEditingIndex(i); setForm(event); }}>
                            <Ionicons name="create-outline" size={20} color="#007bff" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(dayLabel, i)}>
                            <Ionicons name="trash-outline" size={20} color="#dc3545" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))
                )}
                {/* Formulaire d'ajout/modification - Admin seulement */}
                {canEdit && (editingDay === dayLabel) && (
                  <View style={styles.eventForm}>
                    <Text style={styles.formTitle}>{editingIndex !== null ? 'Modifier' : 'Ajouter'} un événement</Text>
                    <TextInput style={styles.input} placeholder="Médecin" value={form.medecin} onChangeText={v => setForm(f => ({ ...f, medecin: v }))} />
                    <TextInput style={styles.input} placeholder="Technicien" value={form.technicien} onChangeText={v => setForm(f => ({ ...f, technicien: v }))} />
                    <TextInput style={styles.input} placeholder="Adresse" value={form.adresse} onChangeText={v => setForm(f => ({ ...f, adresse: v }))} />
                    <View style={styles.formActions}>
                      <TouchableOpacity style={styles.formButton} onPress={() => {
                        if (editingIndex !== null) handleUpdate(dayLabel);
                        else handleAdd(dayLabel);
                      }}>
                        <Text style={styles.formButtonText}>{editingIndex !== null ? 'Modifier' : 'Ajouter'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.formButton, { backgroundColor: '#6c757d' }]} onPress={() => { setEditingDay(null); setEditingIndex(null); setForm({ medecin: '', technicien: '', adresse: '' }); }}>
                        <Text style={styles.formButtonText}>Annuler</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
        {/* Événements séparés — voir l'écran EvenementsScreen */}
      </View>
    </View>
  );
}

const styles = {
  container: { flex: 1, padding: 20 },
  headerContainer: { marginBottom: 18 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: '#555' },
  content: { flex: 1 },
  dayContainer: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 18, padding: 16, elevation: 2 },
  todayContainer: { borderColor: '#007bff', borderWidth: 2 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dayTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  todayTitle: { color: '#007bff' },
  dayDate: { fontSize: 15, color: '#555' },
  todayDate: { color: '#007bff', fontWeight: 'bold' },
  todayBadge: { backgroundColor: '#007bff', color: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, fontSize: 13, marginLeft: 8 },
  noEvent: { color: '#888', fontStyle: 'italic', marginTop: 8 },
  eventCard: { backgroundColor: '#f1f8ff', borderRadius: 8, padding: 10, marginBottom: 8, elevation: 1 },
  eventMedecin: { fontWeight: 'bold', color: '#007bff' },
  eventTechnicien: { color: '#28a745', fontWeight: 'bold' },
  eventAdresse: { color: '#333', marginBottom: 4 },
  eventActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  eventForm: { backgroundColor: '#fffbe6', borderRadius: 8, padding: 12, marginTop: 8 },
  formTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#856404' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  formActions: { flexDirection: 'row', gap: 10 },
  formButton: { backgroundColor: '#007bff', borderRadius: 8, padding: 10, marginRight: 8 },
  formButtonText: { color: '#fff', fontWeight: 'bold' },
};


