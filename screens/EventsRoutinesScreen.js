import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Calendar } from 'react-native-calendars';
import { useRoutines } from "../contexts/RoutineContext";
import { useTheme } from "../contexts/ThemeContext";
import boxShadow from "../utils/boxShadow";

export default function EventsRoutinesScreen() {
  const { theme } = useTheme();
  const { routines, addRoutine, deleteRoutine } = useRoutines();
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'routines'

  // Events state
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ titre: '', type: '', date: '', lieu: '' });
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Routines state
  const [modalVisible, setModalVisible] = useState(false);
  const [routineForm, setRoutineForm] = useState({
    title: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    category: "work",
    color: "#007bff",
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const categories = [
    { id: "work", label: "Travail", icon: "💼", color: "#007bff" },
    { id: "personal", label: "Personnel", icon: "🏠", color: "#28a745" },
    { id: "health", label: "Santé", icon: "❤️", color: "#dc3545" },
    { id: "study", label: "Étude", icon: "📚", color: "#ffc107" },
    { id: "sport", label: "Sport", icon: "⚽", color: "#17a2b8" },
    { id: "other", label: "Autre", icon: "📌", color: "#6c757d" },
  ];

  // Events functions
  const handleAddEvent = () => {
    if (!form.titre || !form.type || !form.date || !form.lieu) return;
    const normalized = normalizeDate(form.date);
    const toSave = { ...form, date: normalized };
    setEvents(evts => [...evts, toSave]);
    setForm({ titre: '', type: '', date: '', lieu: '' });
  };

  const normalizeDate = (d) => {
    if (!d) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
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

  // Routines functions
  const handleAddRoutine = async () => {
    if (!routineForm.title.trim()) {
      alert("Veuillez entrer un titre");
      return;
    }

    await addRoutine({
      ...routineForm,
      startDate: routineForm.startDate.toISOString(),
      endDate: routineForm.endDate.toISOString(),
      startTime: format(routineForm.startTime, "HH:mm"),
      endTime: format(routineForm.endTime, "HH:mm"),
    });

    setModalVisible(false);
    setRoutineForm({
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      category: "work",
      color: "#007bff",
    });
  };

  const handleDeleteRoutine = (id) => {
    deleteRoutine(id);
  };

  const onChangeDate = (event, selectedDate, type) => {
    if (Platform.OS === "android") {
      if (type === "start") setShowStartDatePicker(false);
      if (type === "end") setShowEndDatePicker(false);
    }

    if (selectedDate) {
      if (type === "start") {
        setRoutineForm({ ...routineForm, startDate: selectedDate });
      } else {
        setRoutineForm({ ...routineForm, endDate: selectedDate });
      }
    }
  };

  const onChangeTime = (event, selectedTime, type) => {
    if (Platform.OS === "android") {
      if (type === "start") setShowStartTimePicker(false);
      if (type === "end") setShowEndTimePicker(false);
    }

    if (selectedTime) {
      if (type === "start") {
        setRoutineForm({ ...routineForm, startTime: selectedTime });
      } else {
        setRoutineForm({ ...routineForm, endTime: selectedTime });
      }
    }
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>📅 Événements & Routines</Text>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.tabActive]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>Événements</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'routines' && styles.tabActive]}
          onPress={() => setActiveTab('routines')}
        >
          <Text style={[styles.tabText, activeTab === 'routines' && styles.tabTextActive]}>Routines</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'events' ? (
        <>
          <Text style={styles.subtitle}>Ajoutez ici les formations, congrès, soutenances, etc.</Text>

          <TextInput style={styles.input} placeholder="Titre" value={form.titre} onChangeText={v => setForm(f => ({ ...f, titre: v }))} />
          <TextInput style={styles.input} placeholder="Type (formation, congrès...)" value={form.type} onChangeText={v => setForm(f => ({ ...f, type: v }))} />
          <TouchableOpacity style={[styles.input, styles.dateInput]} onPress={() => setCalendarVisible(!calendarVisible)}>
            <Text style={{ color: form.date ? '#000' : '#888' }}>{form.date ? form.date : 'Date (ex: 12/12/2025 or select via calendrier)'}</Text>
          </TouchableOpacity>

          {calendarVisible && (
            <View style={styles.calendarWrapper}>
              <Calendar
                onDayPress={day => {
                  setSelectedDate(day.dateString);
                  setForm(f => ({ ...f, date: day.dateString }));
                  setCalendarVisible(false);
                }}
                markedDates={markedDates}
              />
            </View>
          )}
          <TextInput style={styles.input} placeholder="Lieu" value={form.lieu} onChangeText={v => setForm(f => ({ ...f, lieu: v }))} />

          <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
            <Text style={styles.addButtonText}>Ajouter Événement</Text>
          </TouchableOpacity>

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
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Créez des routines récurrentes</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Nouvelle Routine</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            {routines.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>Aucune routine créée</Text>
                <Text style={styles.emptySubtext}>
                  Appuyez sur le bouton ci-dessus pour créer votre première routine
                </Text>
              </View>
            ) : (
              routines.map((routine) => {
                const category = categories.find((c) => c.id === routine.category);
                return (
                  <View
                    key={routine.id}
                    style={[
                      styles.routineCard,
                      { borderLeftColor: category?.color || theme.primary },
                    ]}
                  >
                    <View style={styles.routineHeader}>
                      <Text style={styles.routineIcon}>{category?.icon}</Text>
                      <View style={styles.routineInfo}>
                        <Text style={styles.routineTitle}>{routine.title}</Text>
                        {routine.description && (
                          <Text style={styles.routineDescription}>
                            {routine.description}
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteRoutine(routine.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.routineDetails}>
                      <Text style={styles.routineDetail}>
                        📅 {format(new Date(routine.startDate), "dd MMM", { locale: fr })} -{" "}
                        {format(new Date(routine.endDate), "dd MMM yyyy", { locale: fr })}
                      </Text>
                      <Text style={styles.routineDetail}>
                        ⏰ {routine.startTime} - {routine.endTime}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* Modal d'ajout */}
          {modalVisible && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Nouvelle Routine</Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.label}>Titre *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Réunion hebdomadaire"
                    placeholderTextColor={theme.textTertiary}
                    value={routineForm.title}
                    onChangeText={(text) => setRoutineForm({ ...routineForm, title: text })}
                  />

                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Détails de la routine..."
                    placeholderTextColor={theme.textTertiary}
                    value={routineForm.description}
                    onChangeText={(text) => setRoutineForm({ ...routineForm, description: text })}
                    multiline
                    numberOfLines={3}
                  />

                  <Text style={styles.label}>Catégorie</Text>
                  <View style={styles.categoryGrid}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryButton,
                          routineForm.category === cat.id && {
                            backgroundColor: cat.color,
                          },
                        ]}
                        onPress={() =>
                          setRoutineForm({ ...routineForm, category: cat.id, color: cat.color })
                        }
                      >
                        <Text
                          style={[
                            styles.categoryIcon,
                            routineForm.category === cat.id && styles.categoryIconActive,
                          ]}
                        >
                          {cat.icon}
                        </Text>
                        <Text
                          style={[
                            styles.categoryLabel,
                            routineForm.category === cat.id && styles.categoryLabelActive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Date de début</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      📅 {format(routineForm.startDate, "dd MMMM yyyy", { locale: fr })}
                    </Text>
                  </TouchableOpacity>

                  {showStartDatePicker && (
                    <DateTimePicker
                      value={routineForm.startDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(e, date) => onChangeDate(e, date, "start")}
                    />
                  )}

                  <Text style={styles.label}>Date de fin</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      📅 {format(routineForm.endDate, "dd MMMM yyyy", { locale: fr })}
                    </Text>
                  </TouchableOpacity>

                  {showEndDatePicker && (
                    <DateTimePicker
                      value={routineForm.endDate}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(e, date) => onChangeDate(e, date, "end")}
                      minimumDate={routineForm.startDate}
                    />
                  )}

                  <Text style={styles.label}>Heure de début</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartTimePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      ⏰ {format(routineForm.startTime, "HH:mm")}
                    </Text>
                  </TouchableOpacity>

                  {showStartTimePicker && (
                    <DateTimePicker
                      value={routineForm.startTime}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(e, time) => onChangeTime(e, time, "start")}
                    />
                  )}

                  <Text style={styles.label}>Heure de fin</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndTimePicker(true)}
                  >
                    <Text style={styles.dateButtonText}>
                      ⏰ {format(routineForm.endTime, "HH:mm")}
                    </Text>
                  </TouchableOpacity>

                  {showEndTimePicker && (
                    <DateTimePicker
                      value={routineForm.endTime}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(e, time) => onChangeTime(e, time, "end")}
                    />
                  )}
                </ScrollView>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleAddRoutine}
                  >
                    <Text style={styles.modalButtonText}>Créer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fffbe6' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#856404', marginBottom: 6, paddingTop: 6, paddingLeft: 4 },
    subtitle: { color: '#555', marginBottom: 12, paddingLeft: 4 },
    tabContainer: { flexDirection: 'row', marginBottom: 20 },
    tab: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#f0f0f0', marginHorizontal: 5, borderRadius: 8 },
    tabActive: { backgroundColor: '#007bff' },
    tabText: { color: '#333' },
    tabTextActive: { color: '#fff' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 8 },
    dateInput: { justifyContent: 'center' },
    calendarWrapper: { marginBottom: 10 },
    addButton: { backgroundColor: '#007bff', borderRadius: 8, padding: 10, marginTop: 4, alignItems: 'center' },
    addButtonText: { color: '#fff', fontWeight: 'bold' },
    eventCard: { backgroundColor: '#f1f8ff', borderRadius: 8, padding: 10, marginBottom: 8 },
    eventTitle: { fontWeight: 'bold', color: '#007bff', marginBottom: 4 },
    content: { flex: 1, padding: 15 },
    emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
    emptyIcon: { fontSize: 64, marginBottom: 15 },
    emptyText: { fontSize: 18, fontWeight: "bold", color: theme.text, marginBottom: 8 },
    emptySubtext: { fontSize: 14, color: theme.textSecondary, textAlign: "center", paddingHorizontal: 40 },
    routineCard: { backgroundColor: theme.card, borderRadius: 12, padding: 15, marginBottom: 12, borderLeftWidth: 4, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, boxShadow: boxShadow(theme.shadow, 2, 4, 0.1) },
    routineHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
    routineIcon: { fontSize: 24, marginRight: 12 },
    routineInfo: { flex: 1 },
    routineTitle: { fontSize: 18, fontWeight: "bold", color: theme.text, marginBottom: 4 },
    routineDescription: { fontSize: 14, color: theme.textSecondary },
    deleteButton: { padding: 5 },
    deleteButtonText: { fontSize: 20 },
    routineDetails: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.border },
    routineDetail: { fontSize: 13, color: theme.textSecondary, marginBottom: 4 },
    modalOverlay: { flex: 1, backgroundColor: theme.overlay, justifyContent: "center", alignItems: "center" },
    modalContent: { width: "90%", maxHeight: "85%", backgroundColor: theme.card, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, boxShadow: boxShadow('#000', 2, 4, 0.25) },
    modalTitle: { fontSize: 22, fontWeight: "bold", color: theme.text, marginBottom: 20, textAlign: "center" },
    label: { fontSize: 14, fontWeight: "600", color: theme.text, marginBottom: 8, marginTop: 12 },
    textArea: { height: 80, textAlignVertical: "top" },
    categoryGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
    categoryButton: { width: "30%", margin: "1.5%", padding: 12, borderRadius: 10, alignItems: "center", backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
    categoryIcon: { fontSize: 24, marginBottom: 4 },
    categoryIconActive: { fontSize: 28 },
    categoryLabel: { fontSize: 11, color: theme.textSecondary, fontWeight: "600" },
    categoryLabelActive: { color: "#fff", fontWeight: "bold" },
    dateButton: { backgroundColor: theme.surface, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: theme.border, alignItems: "center" },
    dateButtonText: { fontSize: 16, color: theme.text, fontWeight: "600" },
    modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    modalButton: { flex: 1, padding: 15, borderRadius: 10, marginHorizontal: 5, alignItems: "center" },
    cancelButton: { backgroundColor: theme.secondary },
    saveButton: { backgroundColor: theme.success },
    modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  });
