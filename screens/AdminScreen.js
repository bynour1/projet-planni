import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const AdminScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page d&apos;Administration</Text>

      <View style={styles.buttonContainer}>
        {/* Bouton gestion utilisateurs */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("UserManagement")}
        >
          <Text style={styles.buttonText}>Gérer les utilisateurs</Text>
        </TouchableOpacity>

        {/* Bouton gestion planning */}
       <TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate("Planning")}
>
  <Text style={styles.buttonText}>Gérer les plannings</Text>
</TouchableOpacity>


        {/* Bouton chat */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Chat")}
        >
          <Text style={styles.buttonText}>Chat 💬</Text>
        </TouchableOpacity>

        {/* Bouton déconnexion */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "red" }]}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
  },
  buttonContainer: {
    width: "80%",
    gap: 20,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default AdminScreen;
