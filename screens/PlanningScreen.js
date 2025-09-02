// screens/PlanningScreen.js
import React, { useContext } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { PlanningContext } from "../contexts/PlanningContext";

export default function PlanningScreen() {
  const { plannings } = useContext(PlanningContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Planning</Text>

      {plannings.length === 0 ? (
        <Text>Aucun planning disponible</Text>
      ) : (
        <FlatList
          data={plannings}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>Jour : {item.day}</Text>
              <Text>Médecin : {item.medecin}</Text>
              <Text>Technicien : {item.technicien}</Text>
              <Text>Adresse : {item.adresse}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  card: { padding: 15, backgroundColor: "#eee", borderRadius: 10, marginBottom: 10 },
});
