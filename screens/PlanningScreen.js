import { addDays, format, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { usePlanning } from "../contexts/PlanningContext";

export default function PlanningScreen() {
  const { planning, addEvent, removeEvent, updateEvent } = usePlanning();

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

  const goToPreviousWeek = () => setCurrentWeek(addDays(currentWeek, -7));
  const goToNextWeek = () => setCurrentWeek(addDays(currentWeek, 7));
  const goToCurrentWeek = () => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>📋 Planning Hebdomadaire</Text>
        <Text style={styles.headerSubtitle}>
          Semaine du {format(currentWeek, "dd MMMM yyyy", { locale: fr })}
        </Text>
      </View>

      <View style={styles.navigation}>
        <TouchableOpacity style={styles.navButton} onPress={goToPreviousWeek}>
          <Text style={styles.navButtonText}>⬅️ Précédente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.todayButton} onPress={goToCurrentWeek}>
          <Text style={styles.todayButtonText}>Cette semaine</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={goToNextWeek}>
          <Text style={styles.navButtonText}>Suivante ➡️</Text>
        </TouchableOpacity>
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

            {events.length === 0 && editingDay !== dayLabel && (
              <View style={styles.noEventContainer}>
                <Text style={styles.noEventIcon}>📭</Text>
                <Text style={styles.noEvent}>Aucun événement</Text>
              </View>
            )}

            {events.map((ev, i) => (
              <View key={i}>
                {editingDay === dayLabel && editingIndex === i ? (
                  <View style={styles.editForm}>
                    <TextInput
                      style={styles.input}
                      placeholder="Médecin"
                      value={form.medecin}
                      onChangeText={(text) => setForm({ ...form, medecin: text })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Technicien"
                      value={form.technicien}
                      onChangeText={(text) => setForm({ ...form, technicien: text })}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Adresse"
                      value={form.adresse}
                      onChangeText={(text) => setForm({ ...form, adresse: text })}
                      multiline
                    />
                    <View style={styles.formButtons}>
                      <TouchableOpacity 
                        style={[styles.formButton, styles.cancelButton]} 
                        onPress={() => {
                          setEditingDay(null);
                          setEditingIndex(null);
                          setForm({ medecin: "", technicien: "", adresse: "" });
                        }}
                      >
                        <Text style={styles.formButtonText}>❌ Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.formButton, styles.saveButton]} 
                        onPress={() => handleUpdate(dayLabel)}
                      >
                        <Text style={styles.formButtonText}>💾 Sauvegarder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.eventCard}>
                    <View style={styles.eventContent}>
                      <View style={styles.eventRow}>
                        <Text style={styles.eventLabel}>👨‍⚕️ Médecin:</Text>
                        <Text style={styles.eventValue}>{ev.medecin}</Text>
                      </View>
                      <View style={styles.eventRow}>
                        <Text style={styles.eventLabel}>👷 Technicien:</Text>
                        <Text style={styles.eventValue}>{ev.technicien}</Text>
                      </View>
                      <View style={styles.eventRow}>
                        <Text style={styles.eventLabel}>📍 Adresse:</Text>
                        <Text style={styles.eventValue}>{ev.adresse}</Text>
                      </View>
                    </View>
                    <View style={styles.eventActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.editActionButton]}
                        onPress={() => {
                          setEditingDay(dayLabel);
                          setEditingIndex(i);
                          setForm(ev);
                        }}
                      >
                        <Text style={styles.actionButtonText}>✏️ Modifier</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteActionButton]}
                        onPress={() => handleDelete(dayLabel, i)}
                      >
                        <Text style={styles.actionButtonText}>🗑️ Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}

            {editingDay === dayLabel && editingIndex === null && (
              <View style={styles.editForm}>
                <Text style={styles.formTitle}>➕ Nouvel événement</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Médecin"
                  value={form.medecin}
                  onChangeText={(text) => setForm({ ...form, medecin: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Technicien"
                  value={form.technicien}
                  onChangeText={(text) => setForm({ ...form, technicien: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Adresse"
                  value={form.adresse}
                  onChangeText={(text) => setForm({ ...form, adresse: text })}
                  multiline
                />
                <View style={styles.formButtons}>
                  <TouchableOpacity 
                    style={[styles.formButton, styles.cancelButton]} 
                    onPress={() => {
                      setEditingDay(null);
                      setForm({ medecin: "", technicien: "", adresse: "" });
                    }}
                  >
                    <Text style={styles.formButtonText}>❌ Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.formButton, styles.saveButton]} 
                    onPress={() => handleAdd(dayLabel)}
                  >
                    <Text style={styles.formButtonText}>💾 Enregistrer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {editingDay !== dayLabel && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setEditingDay(dayLabel)}
              >
                <Text style={styles.addButtonText}>+ Ajouter un événement</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    backgroundColor: "#007bff",
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
    textTransform: "capitalize",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "600",
  },
  todayButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  todayButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  dayContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: "#007bff",
    backgroundColor: "#e3f2fd",
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textTransform: "capitalize",
    flex: 1,
  },
  todayTitle: {
    color: "#007bff",
  },
  dayDate: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  todayDate: {
    color: "#007bff",
    fontWeight: "600",
  },
  todayBadge: {
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 10,
  },
  noEventContainer: {
    alignItems: "center",
    padding: 30,
  },
  noEventIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  noEvent: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#999",
    fontSize: 16,
  },
  eventCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  eventContent: {
    marginBottom: 10,
  },
  eventRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  eventLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    width: 110,
  },
  eventValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  eventActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  editActionButton: {
    backgroundColor: "#007bff",
  },
  deleteActionButton: {
    backgroundColor: "#dc3545",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  editForm: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#007bff",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: "#f8f9fa",
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  formButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  saveButton: {
    backgroundColor: "#28a745",
  },
  formButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
