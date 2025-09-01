import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function UserManagementScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAddUser = () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    // Ici tu peux envoyer email/password à ton backend ou les stocker temporairement
    console.log("Nouvel utilisateur :", { email, password });
    Alert.alert("Succès", `Utilisateur ${email} ajouté !`);

    // Reset des champs
    setEmail("");
    setPassword("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gérer les utilisateurs</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleAddUser}>
        <Text style={styles.buttonText}>Ajouter utilisateur</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
  input: {
    width: "80%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18 },
});
