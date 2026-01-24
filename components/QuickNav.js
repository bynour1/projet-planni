import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function QuickNav() {
  const router = useRouter();


  //统一使用 router.push() pour la cohérence avec expo-router
  const NavButton = ({ icon, label, route, color }) => (
    <TouchableOpacity
      style={[styles.navButton, { backgroundColor: color }]}
      onPress={() => router.push(route.startsWith('/') ? route : `/${route}`)}
    >
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <NavButton icon="📊" label="Dashboard" route="/dashboard" color="#007bff" />
      <NavButton icon="🚑" label="Clinique" route="/clinique-mobile" color="#e74c3c" />
      <NavButton icon="📅" label="Calendrier" route="/calendar" color="#28a745" />
      <NavButton icon="📋" label="Planning" route="/planning" color="#ffc107" />
      <NavButton icon="💬" label="Chat" route="/chat" color="#17a2b8" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    minWidth: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
});
