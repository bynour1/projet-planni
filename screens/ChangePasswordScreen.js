import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_BASE } from '../constants/api';
import boxShadow from '../utils/boxShadow';

export default function ChangePasswordScreen({ navigation, route }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Erreur', 'Veuillez remplir tous les champs');
    }

    if (newPassword.length < 6) {
      return Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères');
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
    }

    if (oldPassword === newPassword) {
      return Alert.alert('Erreur', 'Le nouveau mot de passe doit être différent de l\'ancien');
    }

    try {
      setLoading(true);
      
      // Récupérer le token depuis AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Erreur', 'Session expirée. Veuillez vous reconnecter.');
        navigation.replace('Login');
        return;
      }

const response = await fetch(`${API_BASE}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Succès',
          'Votre mot de passe a été changé avec succès !',
          [
            {
              text: 'OK',
              onPress: () => {
                // Rediriger vers l'écran approprié selon le rôle
                const user = route.params?.user;
                if (user) {
                  if (user.role === 'admin') {
                    navigation.replace('Admin');
                  } else if (user.role === 'medecin') {
                    navigation.replace('Medecin');
                  } else if (user.role === 'technicien') {
                    navigation.replace('Technicien');
                  } else {
                    navigation.replace('Welcome');
                  }
                } else {
                  navigation.replace('Welcome');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de changer le mot de passe');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🔐 Changement de mot de passe obligatoire</Text>
        <Text style={styles.subtitle}>
          Votre administrateur a créé un mot de passe provisoire pour votre compte.
          Veuillez le changer maintenant pour sécuriser votre accès.
        </Text>

        <Text style={styles.label}>Mot de passe actuel (provisoire)</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre mot de passe provisoire"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showOldPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setShowOldPassword(!showOldPassword)}
          >
            <Text style={styles.eyeText}>{showOldPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nouveau mot de passe</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre nouveau mot de passe"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Text style={styles.eyeText}>{showNewPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Le mot de passe doit contenir au moins 6 caractères</Text>

        <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirmez votre nouveau mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={true}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>✅ Changer le mot de passe</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.info}>
          ℹ️ Vous devez changer votre mot de passe avant de pouvoir utiliser l&apos;application.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    boxShadow: boxShadow('#000', 2, 4, 0.1),
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    marginTop: 10,
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  eyeText: {
    fontSize: 20,
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    backgroundColor: '#e7f3ff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});
