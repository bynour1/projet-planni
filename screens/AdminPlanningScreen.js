import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePlanning } from "../contexts/PlanningContext";

const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

export default function AdminPlanningScreen() {
  const { planning, addEvent, removeEvent, updateEvent } = usePlanning();

  const [jour, setJour] = useState("");
  const [medecin, setMedecin] = useState("");
  const [technicien, setTechnicien] = useState("");
  const [adresse, setAdresse] = useState("");

  // champs temporaires pour modification
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingJour, setEditingJour] = useState("");
  const [editingMed, setEditingMed] = useState("");
  const [editingTech, setEditingTech] = useState("");
  const [editingAdr, setEditingAdr] = useState("");

  const handleAdd = () => {
    if (!jour || !medecin || !technicien || !adresse) return;
    addEvent(jour, medecin, technicien, adresse);
    setMedecin("");
    setTechnicien("");
    setAdresse("");
  };

  const handleSaveEdit = () => {
    updateEvent(editingJour, editingIndex, {
      medecin: editingMed,
      technicien: editingTech,
      adresse: editingAdr,
    });
    setEditingIndex(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Gestion du Planning Hebdomadaire</Text>

      {/* Formulaire d'ajout */}
      <Text style={styles.label}>Jour :</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Lundi"
        value={jour}
        onChangeText={setJour}
      />
      <TextInput
        style={styles.input}
        placeholder="Médecin"
        value={medecin}
        onChangeText={setMedecin}
      />
      <TextInput
        style={styles.input}
        placeholder="Technicien"
        value={technicien}
        onChangeText={setTechnicien}
      />
      <TextInput
        style={styles.input}
        placeholder="Adresse"
        value={adresse}
        onChangeText={setAdresse}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addText}>+ Ajouter</Text>
      </TouchableOpacity>

      {/* Affichage du planning */}
      <FlatList
        data={joursSemaine}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{item}</Text>
            {(planning[item] || []).map((ev, idx) => (
              <View key={idx} style={styles.eventContainer}>
                {editingIndex === idx && editingJour === item ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={editingMed}
                      onChangeText={setEditingMed}
                    />
                    <TextInput
                      style={styles.input}
                      value={editingTech}
                      onChangeText={setEditingTech}
                    />
                    <TextInput
                      style={styles.input}
                      value={editingAdr}
                      onChangeText={setEditingAdr}
                    />
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={handleSaveEdit}
                    >
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

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeEvent(item, idx)}
                  >
                    <Text style={styles.deleteText}>Supprimer</Text>
                  </TouchableOpacity>

                  {editingIndex === idx && editingJour === item ? null : (
                    <TouchableOpacity
                      style={styles.modifyButton}
                      onPress={() => {
                        setEditingIndex(idx);
                        setEditingJour(item);
                        setEditingMed(ev.medecin);
                        setEditingTech(ev.technicien);
                        setEditingAdr(ev.adresse);
                      }}
                    >
                      <Text style={styles.modifyText}>Modifier</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  label: { marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 },
      android: { elevation: 3 },
      web: { boxShadow: "0px 2px 4px rgba(0,0,0,0.3)" },
    }),
  },
  addText: { color: "#fff", fontWeight: "bold" },
  dayContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  dayTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  eventContainer: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 5,
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 5 },
  deleteButton: { backgroundColor: "red", padding: 5, borderRadius: 5, flex: 1, marginRight: 5, alignItems: "center" },
  modifyButton: { backgroundColor: "orange", padding: 5, borderRadius: 5, flex: 1, marginLeft: 5, alignItems: "center" },
  deleteText: { color: "#fff", fontWeight: "bold" },
  modifyText: { color: "#fff", fontWeight: "bold" },
});
