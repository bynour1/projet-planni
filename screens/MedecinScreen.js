import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePlanning } from "../contexts/PlanningContext";

export default function MedecinScreen({ navigation }) {
  const { planning } = usePlanning();
  const jours = Object.keys(planning);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planning du Médecin</Text>
      <FlatList
        data={jours}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.dayContainer}>
            <Text style={styles.day}>{item}</Text>
            {(planning[item] || []).map((ev, idx) => (
              <Text key={idx} style={styles.event}>
                Médecin: {ev.medecin}, Technicien: {ev.technicien}, Adresse: {ev.address}
              </Text>
            ))}
          </View>
        )}
      />

      {/* Bouton Chat */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Chat')}
      >
        <Text style={styles.buttonText}>Chat 💬</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  dayContainer: { marginBottom: 15, padding: 10, backgroundColor: "#f5f5f5", borderRadius: 8 },
  day: { fontSize: 18, fontWeight: "bold" },
  event: { marginLeft: 10, fontSize: 16, color: "#333" },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
