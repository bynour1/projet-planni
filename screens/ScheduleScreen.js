import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useRoutines } from "../contexts/RoutineContext";
import { useTheme } from "../contexts/ThemeContext";

export default function ScheduleScreen() {
  const { theme } = useTheme();
  const { schedules, addSchedule, deleteSchedule } = useRoutines();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: new Date(),
    time: new Date(),
    duration: "30",
    location: "",
    category: "work",
    color: "#007bff",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const categories = [
    { id: "work", label: "Travail", icon: "💼", color: "#007bff" },
    { id: "meeting", label: "Réunion", icon: "👥", color: "#28a745" },
    { id: "appointment", label: "RDV", icon: "📅", color: "#dc3545" },
    { id: "task", label: "Tâche", icon: "✓", color: "#ffc107" },
    { id: "event", label: "Événement", icon: "🎉", color: "#17a2b8" },
    { id: "other", label: "Autre", icon: "📌", color: "#6c757d" },
  ];

  const durations = ["15", "30", "45", "60", "90", "120"];

  const handleAddSchedule = async () => {
    if (!form.title.trim()) {
      alert("Veuillez entrer un titre");
      return;
    }

    await addSchedule({
      ...form,
      date: form.date.toISOString(),
      time: format(form.time, "HH:mm"),
    });

    setModalVisible(false);
    setForm({
      title: "",
      description: "",
      date: new Date(),
      time: new Date(),
      duration: "30",
      location: "",
      category: "work",
      color: "#007bff",
    });
  };

  const handleDeleteSchedule = (id) => {
    deleteSchedule(id);
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setForm({ ...form, date: selectedDate });
    }
  };

  const onChangeTime = (event, selectedTime) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      setForm({ ...form, time: selectedTime });
    }
  };

  const sortedSchedules = [...schedules].sort((a, b) => {
    const dateA = new Date(a.date + "T" + a.time);
    const dateB = new Date(b.date + "T" + b.time);
    return dateB - dateA;
  });

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📆 Horaires</Text>
        <Text style={styles.headerSubtitle}>
          Planifiez vos événements quotidiens
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Nouvel Horaire</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        {sortedSchedules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>Aucun horaire planifié</Text>
            <Text style={styles.emptySubtext}>
              Créez votre premier événement pour commencer
            </Text>
          </View>
        ) : (
          sortedSchedules.map((schedule) => {
            const category = categories.find((c) => c.id === schedule.category);
            const scheduleDate = new Date(schedule.date);
            const isToday =
              format(scheduleDate, "yyyy-MM-dd") ===
              format(new Date(), "yyyy-MM-dd");
            const isPast = scheduleDate < new Date() && !isToday;

            return (
              <View
                key={schedule.id}
                style={[
                  styles.scheduleCard,
                  { borderLeftColor: category?.color || theme.primary },
                  isPast && styles.pastCard,
                ]}
              >
                <View style={styles.scheduleHeader}>
                  <Text style={styles.scheduleIcon}>{category?.icon}</Text>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleTitle}>{schedule.title}</Text>
                    {schedule.description && (
                      <Text style={styles.scheduleDescription}>
                        {schedule.description}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteSchedule(schedule.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.scheduleDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>📅</Text>
                    <Text style={styles.detailText}>
                      {format(scheduleDate, "EEEE dd MMMM yyyy", { locale: fr })}
                      {isToday && (
                        <Text style={styles.todayBadge}> • Aujourd&apos;hui</Text>
                      )}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailIcon}>⏰</Text>
                    <Text style={styles.detailText}>
                      {schedule.time} ({schedule.duration} min)
                    </Text>
                  </View>
                  {schedule.location && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📍</Text>
                      <Text style={styles.detailText}>{schedule.location}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal d'ajout */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvel Horaire</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Titre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Rendez-vous client"
                placeholderTextColor={theme.textTertiary}
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Détails..."
                placeholderTextColor={theme.textTertiary}
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
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
                      form.category === cat.id && {
                        backgroundColor: cat.color,
                      },
                    ]}
                    onPress={() =>
                      setForm({ ...form, category: cat.id, color: cat.color })
                    }
                  >
                    <Text
                      style={[
                        styles.categoryIcon,
                        form.category === cat.id && styles.categoryIconActive,
                      ]}
                    >
                      {cat.icon}
                    </Text>
                    <Text
                      style={[
                        styles.categoryLabel,
                        form.category === cat.id && styles.categoryLabelActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  📅 {format(form.date, "dd MMMM yyyy", { locale: fr })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={form.date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                  minimumDate={new Date()}
                />
              )}

              <Text style={styles.label}>Heure</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  ⏰ {format(form.time, "HH:mm")}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={form.time}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeTime}
                />
              )}

              <Text style={styles.label}>Durée (minutes)</Text>
              <View style={styles.durationGrid}>
                {durations.map((dur) => (
                  <TouchableOpacity
                    key={dur}
                    style={[
                      styles.durationButton,
                      form.duration === dur && styles.durationButtonActive,
                    ]}
                    onPress={() => setForm({ ...form, duration: dur })}
                  >
                    <Text
                      style={[
                        styles.durationText,
                        form.duration === dur && styles.durationTextActive,
                      ]}
                    >
                      {dur}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Lieu (optionnel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Bureau, Zoom, etc."
                placeholderTextColor={theme.textTertiary}
                value={form.location}
                onChangeText={(text) => setForm({ ...form, location: text })}
              />
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
                onPress={handleAddSchedule}
              >
                <Text style={styles.modalButtonText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.primary,
      padding: 20,
      paddingTop: 40,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#fff",
    },
    headerSubtitle: {
      fontSize: 14,
      color: "#e3f2fd",
      marginTop: 5,
    },
    addButton: {
      backgroundColor: theme.success,
      margin: 15,
      padding: 15,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    addButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    content: {
      flex: 1,
      padding: 15,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 15,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
      paddingHorizontal: 40,
    },
    scheduleCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 15,
      marginBottom: 12,
      borderLeftWidth: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    pastCard: {
      opacity: 0.6,
    },
    scheduleHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    scheduleIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    scheduleInfo: {
      flex: 1,
    },
    scheduleTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    scheduleDescription: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    deleteButton: {
      padding: 5,
    },
    deleteButtonText: {
      fontSize: 20,
    },
    scheduleDetails: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    detailIcon: {
      fontSize: 16,
      marginRight: 8,
      width: 20,
    },
    detailText: {
      fontSize: 13,
      color: theme.textSecondary,
      flex: 1,
    },
    todayBadge: {
      color: theme.success,
      fontWeight: "bold",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      maxHeight: "85%",
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 20,
      textAlign: "center",
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
      marginTop: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme.surface,
      color: theme.text,
    },
    textArea: {
      height: 80,
      textAlignVertical: "top",
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 10,
    },
    categoryButton: {
      width: "30%",
      margin: "1.5%",
      padding: 12,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    categoryIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    categoryIconActive: {
      fontSize: 28,
    },
    categoryLabel: {
      fontSize: 11,
      color: theme.textSecondary,
      fontWeight: "600",
    },
    categoryLabelActive: {
      color: "#fff",
      fontWeight: "bold",
    },
    dateButton: {
      backgroundColor: theme.surface,
      padding: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    dateButtonText: {
      fontSize: 16,
      color: theme.text,
      fontWeight: "600",
    },
    durationGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 10,
    },
    durationButton: {
      width: "30%",
      margin: "1.5%",
      padding: 12,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    durationButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    durationText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "600",
    },
    durationTextActive: {
      color: "#fff",
      fontWeight: "bold",
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      padding: 15,
      borderRadius: 10,
      marginHorizontal: 5,
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: theme.secondary,
    },
    saveButton: {
      backgroundColor: theme.success,
    },
    modalButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });
