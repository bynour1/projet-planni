import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../components/Header";
import { usePlanning } from "../contexts/PlanningContext";

export default function TechnicienScreen() {
  const router = useRouter();
  const { planning } = usePlanning();
  const jours = Object.keys(planning);

  return (
    <View style={styles.container}>
      <Header title="Mon Planning - Technicien" />
      <FlatList
        data={jours}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.dayContainer}>
            <Text style={styles.day}>{item}</Text>
            {(planning[item] || []).map((ev, idx) => (
              <View key={idx} style={styles.eventCard}>
                <Text style={styles.eventTime}>🕐 {ev.heureDebut || 'N/A'} - {ev.heureFin || 'N/A'}</Text>
                <Text style={styles.event}>👨‍⚕️ Médecin: {ev.medecin}</Text>
                <Text style={styles.event}>👷 Technicien: {ev.technicien}</Text>
                <Text style={styles.event}>📍 Adresse: {ev.adresse || ev.address}</Text>
              </View>
            ))}
          </View>
        )}
      />

      {/* Bouton Chat */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/chat')}
      >
        <Text style={styles.buttonText}>Chat 💬</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  dayContainer: { marginBottom: 15, padding: 10, backgroundColor: "#f5f5f5", borderRadius: 8, marginHorizontal: 20 },
  day: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  eventCard: { padding: 10, backgroundColor: "#fff", borderRadius: 5, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: "#6610f2" },
  eventTime: { fontWeight: "bold", fontSize: 14, color: "#6610f2", marginBottom: 5 },
  event: { marginLeft: 10, fontSize: 14, color: "#333", marginBottom: 2 },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
