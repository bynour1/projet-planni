import { addDays, format, startOfWeek } from "date-fns";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { usePlanning } from "../contexts/PlanningContext";

export default function PlanningScreen() {
  const { planning, addEvent, removeEvent, updateEvent } = usePlanning();

  const startWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 5 }, (_, i) => addDays(startWeek, i));

  const [editingDay, setEditingDay] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState({ medecin: "", technicien: "", adresse: "" });

  const handleAdd = (dayLabel) => {
    if (!form.medecin || !form.technicien || !form.adresse) return;
    addEvent(dayLabel, form.medecin, form.technicien, form.adresse);
    setForm({ medecin: "", technicien: "", adresse: "" });
    setEditingDay(null);
  };

  const handleUpdate = (dayLabel) => {
    if (!form.medecin || !form.technicien || !form.adresse) return;
    updateEvent(dayLabel, editingIndex, { ...form });
    setForm({ medecin: "", technicien: "", adresse: "" });
    setEditingDay(null);
    setEditingIndex(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerCell}>Jour / Date</Text>
        <Text style={styles.headerCell}>Médecin</Text>
        <Text style={styles.headerCell}>Technicien</Text>
        <Text style={styles.headerCell}>Adresse</Text>
        <Text style={styles.headerCell}>Actions</Text>
      </View>

      {days.map((day, idx) => {
        const dayLabel = format(day, "EEEE dd/MM");
        const events = planning[dayLabel] || [];

        return (
          <View key={idx} style={styles.dayContainer}>
            {events.length === 0 && editingDay !== dayLabel && (
              <Text style={styles.noEvent}>Aucun événement</Text>
            )}

            {events.map((ev, i) => (
              <View key={i} style={styles.row}>
                {editingDay === dayLabel && editingIndex === i ? (
                  <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
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
                    />
                    <TouchableOpacity style={styles.button} onPress={() => handleUpdate(dayLabel)}>
                      <Text style={styles.buttonText}>💾 Sauvegarder</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.row}>
                    <Text style={styles.cell}>{dayLabel}</Text>
                    <Text style={styles.cell}>{ev.medecin}</Text>
                    <Text style={styles.cell}>{ev.technicien}</Text>
                    <Text style={styles.cell}>{ev.adresse}</Text>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.smallButton}
                        onPress={() => {
                          setEditingDay(dayLabel);
                          setEditingIndex(i);
                          setForm(ev);
                        }}
                      >
                        <Text style={styles.buttonText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.smallButton}
                        onPress={() => removeEvent(dayLabel, i)}
                      >
                        <Text style={styles.buttonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}

            {editingDay === dayLabel && editingIndex === null && (
              <View style={styles.row}>
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
                />
                <TouchableOpacity style={styles.button} onPress={() => handleAdd(dayLabel)}>
                  <Text style={styles.buttonText}>💾 Enregistrer</Text>
                </TouchableOpacity>
              </View>
            )}

            {editingDay !== dayLabel && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setEditingDay(dayLabel)}
              >
                <Text style={styles.buttonText}>+ Ajouter</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  header: { flexDirection: "row", borderBottomWidth: 1, paddingBottom: 5, marginBottom: 5 },
  headerCell: { flex: 1, fontWeight: "bold", textAlign: "center" },
  dayContainer: { marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  cell: { flex: 1, textAlign: "center" },
  actions: { flexDirection: "row" },
  smallButton: { backgroundColor: "#007bff", padding: 5, borderRadius: 5, marginHorizontal: 2 },
  button: { backgroundColor: "#007bff", padding: 8, borderRadius: 5, marginLeft: 5 },
  addButton: { backgroundColor: "#28a745", padding: 8, borderRadius: 5, alignItems: "center", marginTop: 5 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 5, borderRadius: 5, marginHorizontal: 2, flex: 1 },
  noEvent: { textAlign: "center", fontStyle: "italic", color: "#999", marginBottom: 5 },
});
