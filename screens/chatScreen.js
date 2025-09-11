import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useChat } from "../contexts/ChatContext";
import { useUser } from "../contexts/UserContext";

export default function ChatScreen() {
  const { messages, sendMessage } = useChat();
  const { user } = useUser();
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(user.name, text);
    setText("");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.message}>
            <Text style={styles.user}>{item.user}:</Text>
            <Text>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrire un message..."
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity style={styles.button} onPress={handleSend}>
          <Text style={styles.buttonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  message: { padding: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  user: { fontWeight: "bold" },
  inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5 },
  button: { backgroundColor: "#007bff", padding: 10, marginLeft: 5, borderRadius: 5 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
