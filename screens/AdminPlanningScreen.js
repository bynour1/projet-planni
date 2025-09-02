// screens/AdminPlanningScreen.js
import React, { useContext, useState } from "react";
import { Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { PlanningContext } from "../contexts/PlanningContext";

export default function AdminPlanningScreen() {
  const { plannings, addPlanning, removePlanning } = useContext(PlanningContext);
  const [jour, setJour] = useState("");
  const [medecin, setMedecin] = useState("");
  const [technicien, setTechnicien] = useState("");
  const [adresse, setAdresse] = useState("");

  const handleAdd = () => {
    if (!jour || !medecin || !technicien || !adresse) return;
    addPlanning({ jour, medecin, technicien, adresse });
    setJour("");
    setMedecin("");
    setTechnicien("");
    setAdresse("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Gestion des Plannings</Text>

      {/* Formulaire */}
      <TextInput placeholder="Jour" style={styles.input} value={jour} onChangeText={setJour} />
      <TextInput placeholder="Médecin" style={styles.input} value={medecin} onChangeText={setMedecin} />
      <TextInput placeholder="Technicien" style={styles.input} value={technicien} onChangeText={setTechnicien} />
      <TextInput placeholder="Adresse" style={styles.input} value={adresse} onChangeText={setAdresse} />

      <Button title="Ajouter un planning" onPress={handleAdd} />

      {/* Liste des plannings */}
      <FlatList
        data={plannings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <Text style={styles.day}>Jour : {item.jour}</Text>
            <Text>Médecin : {item.medecin}</Text>
            <Text>Technicien : {item.technicien}</Text>
            <Text>Adresse : {item.adresse}</Text>
            <Button title="Supprimer" color="red" onPress={() => removePlanning(index)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  item: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  day: { fontWeight: "bold", fontSize: 16 },
});
