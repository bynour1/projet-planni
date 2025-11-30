import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const API_URL = 'http://localhost:5000';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: email.trim().toLowerCase(),
        password
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Sauvegarder le token et les infos utilisateur
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(user));

        Alert.alert('Succès', 'Connexion réussie !');

        // Rediriger selon le rôle
        switch (user.role) {
          case 'admin':
            navigation.replace('Admin');
            break;
          case 'medecin':
            navigation.replace('Medecin');
            break;
          case 'technicien':
            navigation.replace('Technicien');
            break;
          default:
            navigation.replace('Welcome');
        }
      } else {
        Alert.alert('Erreur', response.data.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Erreur login:', error);
      const message = error.response?.data?.message || 'Erreur de connexion au serveur';
      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <Text style={styles.subtitle}>Planning Professionnel</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Se connecter</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => Alert.alert('Info', 'Contactez votre administrateur pour créer un compte')}
      >
        <Text style={styles.linkText}>Pas encore de compte ?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  linkButton: {
    marginTop: 20
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14
  }
});
