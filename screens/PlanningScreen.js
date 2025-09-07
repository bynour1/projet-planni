import React, { useContext } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { PlanningContext } from "../contexts/PlanningContext";

export default function PlanningScreen({ userRole }) {
  const { planning, addEvent, removeEvent, updateEvent } = useContext(PlanningContext);

  // pour l'admin seulement
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editingJour, setEditingJour] = React.useState("");
  const [editingMed, setEditingMed] = React.useState("");
  const [editingTech, setEditingTech] = React.useState("");
  const [editingAdr, setEditingAdr] = React.useState("");

  const [jour, setJour] = React.useState("");
  const [medecin, setMedecin] = React.useState("");
  const [technicien, setTechnicien] = React.useState("");
  const [adresse, setAdresse] = React.useState("");

  const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

  const handleAdd = () => {
    if (!jour || !medecin || !technicien || !adresse) return;
    addEvent(jour, medecin, technicien, adresse);
    setMedecin(""); setTechnicien(""); setAdresse("");
  };

  const handleSaveEdit = () => {
    updateEvent(editingJour, editingIndex, {
      medecin: editingMed,
      technicien: editingTech,
      adresse: editingAdr
    });
    setEditingIndex(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Planning Hebdomadaire</Text>

      {userRole === "admin" && (
        <>
          {/* Formulaire Ajouter */}
          <TextInput placeholder="Jour" value={jour} onChangeText={setJour} style={styles.input} />
          <TextInput placeholder="Médecin" value={medecin} onChangeText={setMedecin} style={styles.input} />
          <TextInput placeholder="Technicien" value={technicien} onChangeText={setTechnicien} style={styles.input} />
          <TextInput placeholder="Adresse" value={adresse} onChangeText={setAdresse} style={styles.input} />
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addText}>+ Ajouter</Text>
          </TouchableOpacity>
        </>
      )}

      {joursSemaine.map((day) => (
        <View key={day} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{day}</Text>
          {(planning[day] || []).map((ev, idx) => (
            <View key={idx} style={styles.eventContainer}>
              {userRole === "admin" && editingIndex === idx && editingJour === day ? (
                <>
                  <TextInput value={editingMed} onChangeText={setEditingMed} style={styles.input} />
                  <TextInput value={editingTech} onChangeText={setEditingTech} style={styles.input} />
                  <TextInput value={editingAdr} onChangeText={setEditingAdr} style={styles.input} />
                  <TouchableOpacity style={styles.addButton} onPress={handleSaveEdit}>
                    <Text style={styles.addText}>💾 Enregistrer</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text>Médecin : {ev.medecin}</Text>
                  <Text>Technicien : {ev.technicien}</Text>
                  <Text>Adresse : {ev.adresse}</Text>
                </>
              )}

              {userRole === "admin" && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => removeEvent(day, idx)}>
                    <Text style={styles.deleteText}>Supprimer</Text>
                  </TouchableOpacity>
                  {editingIndex === idx && editingJour === day ? null : (
                    <TouchableOpacity style={styles.modifyButton} onPress={() => {
                      setEditingIndex(idx);
                      setEditingJour(day);
                      setEditingMed(ev.medecin);
                      setEditingTech(ev.technicien);
                      setEditingAdr(ev.adresse);
                    }}>
                      <Text style={styles.modifyText}>Modifier</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5, marginBottom: 10 },
  addButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, marginBottom: 10, alignItems: "center" },
  addText: { color: "#fff", fontWeight: "bold" },
  dayContainer: { marginBottom: 15 },
  dayTitle: { fontWeight: "bold", fontSize: 16 },
  eventContainer: { padding: 8, backgroundColor: "#f5f5f5", borderRadius: 5, marginBottom: 5 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  deleteButton: { backgroundColor: "red", padding: 5, borderRadius: 5, flex: 1, marginRight: 5, alignItems: "center" },
  modifyButton: { backgroundColor: "orange", padding: 5, borderRadius: 5, flex: 1, marginLeft: 5, alignItems: "center" },
  deleteText: { color: "#fff", fontWeight: "bold" },
  modifyText: { color: "#fff", fontWeight: "bold" },
});
