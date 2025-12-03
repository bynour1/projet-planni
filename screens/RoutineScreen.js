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

export default function RoutineScreen() {
  const { theme } = useTheme();
  const { routines, addRoutine, deleteRoutine } = useRoutines();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
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

  const handleAddRoutine = async () => {
    if (!form.title.trim()) {
      alert("Veuillez entrer un titre");
      return;
    }

    await addRoutine({
      ...form,
      startDate: form.startDate.toISOString(),
      endDate: form.endDate.toISOString(),
      startTime: format(form.startTime, "HH:mm"),
      endTime: format(form.endTime, "HH:mm"),
    });

    setModalVisible(false);
    setForm({
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
        setForm({ ...form, startDate: selectedDate });
      } else {
        setForm({ ...form, endDate: selectedDate });
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
        setForm({ ...form, startTime: selectedTime });
      } else {
        setForm({ ...form, endTime: selectedTime });
      }
    }
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⏰ Routines</Text>
        <Text style={styles.headerSubtitle}>
          Créez des routines récurrentes
        </Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Nouvelle Routine</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
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
            <Text style={styles.modalTitle}>Nouvelle Routine</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Titre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Réunion hebdomadaire"
                placeholderTextColor={theme.textTertiary}
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Détails de la routine..."
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

              <Text style={styles.label}>Date de début</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  📅 {format(form.startDate, "dd MMMM yyyy", { locale: fr })}
                </Text>
              </TouchableOpacity>

              {showStartDatePicker && (
                <DateTimePicker
                  value={form.startDate}
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
                  📅 {format(form.endDate, "dd MMMM yyyy", { locale: fr })}
                </Text>
              </TouchableOpacity>

              {showEndDatePicker && (
                <DateTimePicker
                  value={form.endDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(e, date) => onChangeDate(e, date, "end")}
                  minimumDate={form.startDate}
                />
              )}

              <Text style={styles.label}>Heure de début</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  ⏰ {format(form.startTime, "HH:mm")}
                </Text>
              </TouchableOpacity>

              {showStartTimePicker && (
                <DateTimePicker
                  value={form.startTime}
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
                  ⏰ {format(form.endTime, "HH:mm")}
                </Text>
              </TouchableOpacity>

              {showEndTimePicker && (
                <DateTimePicker
                  value={form.endTime}
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
    routineCard: {
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
    routineHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    routineIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    routineInfo: {
      flex: 1,
    },
    routineTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    routineDescription: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    deleteButton: {
      padding: 5,
    },
    deleteButtonText: {
      fontSize: 20,
    },
    routineDetails: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    routineDetail: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 4,
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
