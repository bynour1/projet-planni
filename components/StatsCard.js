import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  color = "#007bff", 
  icon = "📊",
  onPress 
}) {
  const Card = onPress ? TouchableOpacity : View;

  return (
    <Card 
      style={[styles.container, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {onPress && <Text style={styles.arrow}>›</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 32,
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  title: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: "#ccc",
    marginLeft: 10,
  },
});
