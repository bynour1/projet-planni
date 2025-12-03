import { addDays, format, startOfWeek } from "date-fns";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { usePlanning } from "../contexts/PlanningContext";

export default function AdminPlanningScreen() {
  const { planning, addEvent } = usePlanning();

  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [addingDay, setAddingDay] = useState(null);
  const [form, setForm] = useState({ medecin: "", technicien: "", adresse: "", heureDebut: "", heureFin: "" });

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const handleAdd = (dayLabel) => {
    if (!form.medecin || !form.technicien || !form.adresse || !form.heureDebut || !form.heureFin) return;
    addEvent(dayLabel, form.medecin, form.technicien, form.adresse, form.heureDebut, form.heureFin);
    setForm({ medecin: "", technicien: "", adresse: "", heureDebut: "", heureFin: "" });
    setAddingDay(null);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentWeek(addDays(currentWeek, -7))}>
          <Text style={styles.navText}>⬅️ Précédente</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Semaine du {format(currentWeek, "dd/MM/yyyy")}</Text>
        <TouchableOpacity onPress={() => setCurrentWeek(addDays(currentWeek, 7))}>
          <Text style={styles.navText}>Suivante ➡️</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={daysOfWeek}
        keyExtractor={(d) => d.toISOString()}
        renderItem={({ item }) => {
          const dayLabel = format(item, "EEEE dd/MM");
          return (
            <View style={styles.dayContainer}>
              <Text style={styles.dayTitle}>{dayLabel}</Text>

              {(planning[dayLabel] || []).map((ev, idx) => (
                <View key={idx} style={styles.eventContainer}>
                  <Text style={styles.eventTime}>🕐 {ev.heureDebut || 'N/A'} - {ev.heureFin || 'N/A'}</Text>
                  <Text>👨‍⚕️ Médecin : {ev.medecin}</Text>
                  <Text>👷 Technicien : {ev.technicien}</Text>
                  <Text>📍 Adresse : {ev.adresse}</Text>
                </View>
              ))}

              {addingDay === dayLabel ? (
                <View style={{ marginTop: 10 }}>
                  <View style={styles.timeRow}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 5 }]}
                      placeholder="Heure début (ex: 09:00)"
                      value={form.heureDebut}
                      onChangeText={(text) => setForm({ ...form, heureDebut: text })}
                    />
                    <TextInput
                      style={[styles.input, { flex: 1, marginLeft: 5 }]}
                      placeholder="Heure fin (ex: 17:00)"
                      value={form.heureFin}
                      onChangeText={(text) => setForm({ ...form, heureFin: text })}
                    />
                  </View>
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
                  <TouchableOpacity style={styles.addButton} onPress={() => handleAdd(dayLabel)}>
                    <Text style={styles.addText}>💾 Enregistrer</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addButton} onPress={() => setAddingDay(dayLabel)}>
                  <Text style={styles.addText}>+ Ajouter</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  navText: { fontSize: 16, color: "#007bff" },
  title: { fontSize: 18, fontWeight: "bold" },
  dayContainer: { marginBottom: 15, padding: 10, backgroundColor: "#f5f5f5", borderRadius: 8 },
  dayTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  eventContainer: { padding: 10, backgroundColor: "#fff", borderRadius: 5, marginBottom: 5, borderLeftWidth: 3, borderLeftColor: "#007bff" },
  eventTime: { fontWeight: "bold", fontSize: 14, color: "#007bff", marginBottom: 5 },
  timeRow: { flexDirection: "row", justifyContent: "space-between" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5, marginBottom: 5 },
  addButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 8, alignItems: "center", marginTop: 5 },
  addText: { color: "#fff", fontWeight: "bold" },
});
