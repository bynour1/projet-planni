import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Base d'utilisateurs déjà créés par admin
let usersList = [
  { email: "admin@hopital.com", password: "", isConfirmed: false },
  { email: "medecin1@hopital.com", password: "", isConfirmed: false },
  { email: "technicien1@hopital.com", password: "", isConfirmed: false },
];

export default function UserManagementScreen() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1 = email, 2 = code, 3 = mot de passe
  const [code, setCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [password, setPassword] = useState("");

  // Étape 1 : Vérifier l'email
  const handleNextStep = () => {
    if (!email) return Alert.alert("Erreur", "Veuillez entrer un email !");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return Alert.alert("Erreur", "Email invalide !");

    const existingUser = usersList.find((u) => u.email === email);
    if (!existingUser) return Alert.alert("Erreur", "Email inconnu ! Contactez l'admin.");

    if (existingUser.isConfirmed) {
      Alert.alert("Info", "Ce compte est déjà actif. Connectez-vous avec votre mot de passe.");
      return;
    }

    // Générer un code aléatoire à 6 chiffres
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    Alert.alert("Email reconnu", `Un code de confirmation a été envoyé à ${email}.\n(Code simulé: ${newCode})`);
    setStep(2); // passer à la saisie du code
  };

  // Étape 2 : Vérifier le code de confirmation
  const handleConfirmCode = () => {
    if (code !== generatedCode) return Alert.alert("Erreur", "Code incorrect !");
    Alert.alert("Succès", "Code confirmé ! Vous pouvez maintenant créer votre mot de passe.");
    setStep(3);
  };

  // Étape 3 : Ajouter mot de passe
  const handleAddPassword = () => {
    if (password.length < 8) return Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères !");
    const user = usersList.find((u) => u.email === email);
    user.password = password;
    user.isConfirmed = true;
    Alert.alert("Succès", "Votre compte est prêt !");

    // Reset
    setEmail(""); setPassword(""); setCode(""); setGeneratedCode(""); setStep(1);
    console.log("Utilisateurs mis à jour :", usersList);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gérer les utilisateurs</Text>

      {step === 1 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleNextStep}>
            <Text style={styles.buttonText}>Confirmer Email</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Code de confirmation"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleConfirmCode}>
            <Text style={styles.buttonText}>Valider Code</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Mot de passe (min 8 caractères)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleAddPassword}>
            <Text style={styles.buttonText}>Créer Mot de Passe</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
  input: { width: "80%", padding: 15, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginBottom: 20, backgroundColor: "#fff" },
  button: { backgroundColor: "#007bff", paddingVertical: 15, paddingHorizontal: 20, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 18 },
});
