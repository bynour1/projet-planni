import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function SettingsScreen() {
  const { theme, themeMode, toggleTheme } = useTheme();

  const themeOptions = [
    { id: "light", label: "Clair", icon: "☀️", description: "Mode jour" },
    { id: "dark", label: "Sombre", icon: "🌙", description: "Mode nuit" },
    { id: "auto", label: "Automatique", icon: "🔄", description: "Suit le système" },
  ];

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Paramètres</Text>
        <Text style={styles.headerSubtitle}>Personnalisez votre application</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Apparence</Text>

          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.themeOption,
                themeMode === option.id && styles.themeOptionActive,
              ]}
              onPress={() => toggleTheme(option.id)}
            >
              <Text style={styles.themeIcon}>{option.icon}</Text>
              <View style={styles.themeInfo}>
                <Text style={styles.themeLabel}>{option.label}</Text>
                <Text style={styles.themeDescription}>{option.description}</Text>
              </View>
              {themeMode === option.id && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Informations</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>2.0.0</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Thème actuel</Text>
            <Text style={styles.infoValue}>
              {theme.isDark ? "Sombre" : "Clair"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ À propos</Text>
          <Text style={styles.aboutText}>
            Planning Management est une application de gestion de planning,
            routines et horaires avec support du mode sombre/clair.
          </Text>
          <Text style={styles.aboutText}>
            Fonctionnalités : Dashboard, Calendrier, Planning, Routines,
            Horaires, Chat et plus encore.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.primary,
      padding: 20,
      paddingTop: 40,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#fff",
    },
    headerSubtitle: {
      fontSize: 14,
      color: "#e3f2fd",
      marginTop: 5,
    },
    content: {
      flex: 1,
      padding: 15,
    },
    section: {
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 15,
    },
    themeOption: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 15,
      marginBottom: 10,
      borderWidth: 2,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    themeOptionActive: {
      borderColor: theme.primary,
      backgroundColor: theme.highlight,
    },
    themeIcon: {
      fontSize: 32,
      marginRight: 15,
    },
    themeInfo: {
      flex: 1,
    },
    themeLabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 2,
    },
    themeDescription: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    checkmark: {
      fontSize: 24,
      color: theme.primary,
      fontWeight: "bold",
    },
    infoCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
    },
    aboutText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 22,
      marginBottom: 12,
    },
  });
