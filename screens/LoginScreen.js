import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useUser } from '../contexts/UserContext';

// Utilisateurs statiques pour les tests
const STATIC_USERS = [
  {
    id: 1,
    email: 'admin@planning.com',
    password: 'admin123',
    role: 'admin',
    nom: 'Admin',
    prenom: 'Système',
    phone: '+33 6 12 34 56 78'
  },
  {
    id: 2,
    email: 'medecin@planning.com',
    password: 'medecin123',
    role: 'medecin',
    nom: 'Dupont',
    prenom: 'Marie',
    phone: '+33 6 23 45 67 89'
  },
  {
    id: 3,
    email: 'technicien@planning.com',
    password: 'technicien123',
    role: 'technicien',
    nom: 'Martin',
    prenom: 'Pierre',
    phone: '+33 6 34 56 78 90'
  }
];

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Thème clair fixe
  const theme = {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#000000',
    textSecondary: '#666666',
    border: '#dddddd',
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Rechercher l'utilisateur dans la liste statique
    const user = STATIC_USERS.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (user) {
      // Créer un objet utilisateur sans le mot de passe
      const { password: _, ...userWithoutPassword } = user;
      
      // Sauvegarder les infos utilisateur
      await AsyncStorage.setItem('userInfo', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);

      Alert.alert('Succès', `Bienvenue ${user.prenom} ${user.nom} !`);

      // Rediriger selon le rôle
      switch (user.role) {
        case 'admin':
          router.replace('/admin');
          break;
        case 'medecin':
          router.replace('/medecin');
          break;
        case 'technicien':
          router.replace('/technicien');
          break;
        default:
          router.replace('/welcome');
      }
    } else {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
    }
  };

  const quickLogin = async (userEmail) => {
    const user = STATIC_USERS.find(u => u.email === userEmail);
    if (user) {
      setEmail(user.email);
      setPassword(user.password);
    }
  };

  return (
    <ScrollView style={styles(theme).container} contentContainerStyle={styles(theme).contentContainer}>
      <View style={styles(theme).header}>
        <Text style={styles(theme).icon}>🏥</Text>
        <Text style={styles(theme).title}>Planning Médical</Text>
        <Text style={styles(theme).subtitle}>Gestion professionnelle de planning</Text>
      </View>

      <View style={styles(theme).form}>
        <TextInput
          style={styles(theme).input}
          placeholder="Email"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles(theme).input}
          placeholder="Mot de passe"
          placeholderTextColor={theme.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={styles(theme).button}
          onPress={handleLogin}
        >
          <Text style={styles(theme).buttonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles(theme).quickLoginSection}>
        <Text style={styles(theme).quickLoginTitle}>🚀 Connexion rapide (Test)</Text>
        
        <TouchableOpacity 
          style={[styles(theme).quickLoginButton, { backgroundColor: '#dc3545' }]}
          onPress={() => quickLogin('admin@planning.com')}
        >
          <Text style={styles(theme).quickLoginIcon}>👤</Text>
          <View style={styles(theme).quickLoginContent}>
            <Text style={styles(theme).quickLoginRole}>Admin</Text>
            <Text style={styles(theme).quickLoginEmail}>admin@planning.com</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles(theme).quickLoginButton, { backgroundColor: '#007bff' }]}
          onPress={() => quickLogin('medecin@planning.com')}
        >
          <Text style={styles(theme).quickLoginIcon}>👨‍⚕️</Text>
          <View style={styles(theme).quickLoginContent}>
            <Text style={styles(theme).quickLoginRole}>Médecin</Text>
            <Text style={styles(theme).quickLoginEmail}>medecin@planning.com</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles(theme).quickLoginButton, { backgroundColor: '#28a745' }]}
          onPress={() => quickLogin('technicien@planning.com')}
        >
          <Text style={styles(theme).quickLoginIcon}>🔧</Text>
          <View style={styles(theme).quickLoginContent}>
            <Text style={styles(theme).quickLoginRole}>Technicien</Text>
            <Text style={styles(theme).quickLoginEmail}>technicien@planning.com</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles(theme).infoSection}>
        <Text style={styles(theme).infoTitle}>📋 Comptes de test disponibles :</Text>
        <Text style={styles(theme).infoText}>• Admin : admin@planning.com / admin123</Text>
        <Text style={styles(theme).infoText}>• Médecin : medecin@planning.com / medecin123</Text>
        <Text style={styles(theme).infoText}>• Technicien : technicien@planning.com / technicien123</Text>
      </View>
    </ScrollView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  icon: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: theme.card,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 16,
    color: theme.text,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickLoginSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  quickLoginTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  quickLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  quickLoginIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  quickLoginContent: {
    flex: 1,
  },
  quickLoginRole: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 3,
  },
  quickLoginEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  infoSection: {
    backgroundColor: theme.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 5,
    lineHeight: 20,
  },
});
