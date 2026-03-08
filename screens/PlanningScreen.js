import { addDays, format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { API_BASE } from '../constants/api';
import { usePlanning } from "../contexts/PlanningContext";
import { useUser } from "../contexts/UserContext";

// Événements hors planning déplacé vers EvenementsScreen

export default function PlanningScreen() {
  const { planning, addEvent, removeEvent, updateEvent } = usePlanning();
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin;

  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [clinicalVisits, setClinicalVisits] = useState({});
  const [loading, setLoading] = useState(false);
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  const [editingDay, setEditingDay] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ medecin: "", technicien: "", adresse: "", type: "planning" }); // type: 'planning' or 'clinical'

  // Fetch clinical visits for the week
  useEffect(() => {
    fetchClinicalVisits();
  }, [currentWeek]);

  const fetchClinicalVisits = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/clino-mobile`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Group visits by date
        const visitsByDate = {};
        data.forEach(visit => {
          const visitDate = format(new Date(visit.date), "EEEE dd/MM", { locale: fr });
          if (!visitsByDate[visitDate]) {
            visitsByDate[visitDate] = [];
          }
          visitsByDate[visitDate].push({ ...visit, type: 'clinical' });
        });
        setClinicalVisits(visitsByDate);
      }
    } catch (error) {
      console.warn('Failed to fetch clinical visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (dayLabel) => {
    if (!form.medecin || !form.technicien || !form.adresse) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    addEvent(dayLabel, form);
    setForm({ medecin: "", technicien: "", adresse: "", type: "planning" });
    setEditingDay(null);
  };

  const handleUpdate = (dayLabel) => {
    if (!form.medecin || !form.technicien || !form.adresse) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    updateEvent(dayLabel, editingIndex, { ...form });
    setForm({ medecin: "", technicien: "", adresse: "", type: "planning" });
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
            const visits = clinicalVisits[dayLabel] || [];
            const allActivities = [...events.map(e => ({...e, type: 'planning'})), ...visits];
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
                {/* Affichage des événements et visites cliniques */}
                {allActivities.length === 0 ? (
                  <Text style={styles.noEvent}>Aucun événement</Text>
                ) : (
                  allActivities.map((activity, i) => (
                    <View key={i} style={[styles.eventCard, activity.type === 'clinical' && styles.clinicalCard]}>
                      {activity.type === 'clinical' ? (
                        <>
                          <Text style={styles.clinicalLabel}>🏥 Visite Clinique</Text>
                          <Text style={styles.eventMedecin}>🩺 {activity.medecin}</Text>
                          <Text style={styles.eventAdresse}>📍 {activity.adresse}</Text>
                          {activity.heure && <Text style={styles.eventTime}>⏰ {activity.heure}</Text>}
                          {activity.commentaire && <Text style={styles.eventComment}>💬 {activity.commentaire}</Text>}
                        </>
                      ) : (
                        <>
                          <View style={styles.eventHeader}>
                            <View style={styles.eventInfo}>
                              <Text style={styles.eventMedecin}>🩺 {activity.medecin}</Text>
                              <Text style={styles.eventTechnicien}>🔧 {activity.technicien}</Text>
                              <Text style={styles.eventAdresse}>📍 {activity.adresse}</Text>
                            </View>
                            {canEdit && (
                              <View style={styles.eventActionsRow}>
                                <TouchableOpacity onPress={() => { setEditingDay(dayLabel); setEditingIndex(i); setForm({...activity}); }}>
                                  <Ionicons name="create-outline" size={18} color="#0066cc" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(dayLabel, i)}>
                                  <Ionicons name="trash-outline" size={18} color="#dc3545" />
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </>
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
                      <TouchableOpacity style={[styles.formButton, { backgroundColor: '#6c757d' }]} onPress={() => { setEditingDay(null); setEditingIndex(null); setForm({ medecin: '', technicien: '', adresse: '', type: 'planning' }); }}>
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
  todayContainer: { borderColor: '#0066cc', borderWidth: 2 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  dayTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  todayTitle: { color: '#0066cc' },
  dayDate: { fontSize: 15, color: '#555' },
  todayDate: { color: '#0066cc', fontWeight: 'bold' },
  todayBadge: { backgroundColor: '#0066cc', color: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, fontSize: 13, marginLeft: 8 },
  noEvent: { color: '#888', fontStyle: 'italic', marginTop: 8 },
  eventCard: { backgroundColor: '#f1f8ff', borderRadius: 8, padding: 10, marginBottom: 8, elevation: 1 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' },
  eventInfo: { flex: 1 },
  eventActionsRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginLeft: 10 },
  clinicalCard: { backgroundColor: '#e6f0ff', borderLeftWidth: 4, borderLeftColor: '#0066cc' },
  clinicalLabel: { fontSize: 13, fontWeight: 'bold', color: '#0066cc', marginBottom: 6, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#d0e1ff' },
  eventMedecin: { fontWeight: 'bold', color: '#0066cc' },
  eventTechnicien: { color: '#28a745', fontWeight: 'bold' },
  eventAdresse: { color: '#333', marginBottom: 4 },
  eventTime: { color: '#666', fontSize: 13, marginBottom: 2 },
  eventComment: { color: '#666', fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  eventActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  eventForm: { backgroundColor: '#fffbe6', borderRadius: 8, padding: 12, marginTop: 8 },
  formTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: '#856404' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
  formActions: { flexDirection: 'row', gap: 10 },
  formButton: { backgroundColor: '#0066cc', borderRadius: 8, padding: 10, marginRight: 8 },
  formButtonText: { color: '#fff', fontWeight: 'bold' },
};


