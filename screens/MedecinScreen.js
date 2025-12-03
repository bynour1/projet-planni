import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Sidebar from "../components/Sidebar";
import { usePlanning } from "../contexts/PlanningContext";

export default function MedecinScreen() {
  const router = useRouter();
  const { planning } = usePlanning();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const jours = Object.keys(planning);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setSidebarVisible(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Planning du Médecin</Text>
        </View>
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
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  headerContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  menuButton: { padding: 10, marginRight: 15 },
  menuIcon: { fontSize: 24, color: "#007AFF" },
  title: { fontSize: 22, fontWeight: "bold", flex: 1 },
  dayContainer: { marginBottom: 15, padding: 10, backgroundColor: "#f5f5f5", borderRadius: 8 },
  day: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  eventCard: { padding: 10, backgroundColor: "#fff", borderRadius: 5, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: "#007AFF" },
  eventTime: { fontWeight: "bold", fontSize: 14, color: "#007AFF", marginBottom: 5 },
  event: { marginLeft: 10, fontSize: 14, color: "#333", marginBottom: 2 },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
