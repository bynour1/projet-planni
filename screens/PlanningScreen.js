// screens/PlanningScreen.js
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlanningScreen() {
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const [events, setEvents] = useState({});

  const addEvent = (jour) => {
    const nouvelEvenement = `Événement ajouté pour ${jour}`;
    setEvents((prev) => ({
      ...prev,
      [jour]: [...(prev[jour] || []), nouvelEvenement],
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planning Hebdomadaire</Text>

      <FlatList
        data={jours}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.dayContainer}>
            <Text style={styles.day}>{item}</Text>
            
            {(events[item] || []).map((ev, index) => (
              <Text key={index} style={styles.event}>{ev}</Text>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addEvent(item)}
            >
              <Text style={styles.addText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  dayContainer: { marginBottom: 15, padding: 10, backgroundColor: "#f5f5f5", borderRadius: 8 },
  day: { fontSize: 18, fontWeight: "bold" },
  event: { marginLeft: 10, fontSize: 16, color: "#333" },
  addButton: { marginTop: 5, backgroundColor: "#007AFF", padding: 8, borderRadius: 5 },
  addText: { color: "#fff", textAlign: "center" },
});
