import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
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

// NOTE: quick test accounts exist on the backend (see scripts/create-test-users.js)

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Déterminer dynamiquement l'URL de l'API en dev (évite localhost sur appareil)
  const getApiBase = () => {
    // En mode web, utiliser le même hostname que le navigateur et port backend 8083
    // (permet d'utiliser localhost, 127.0.0.1 ou l'IP LAN automatiquement)
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return `${window.location.protocol}//${window.location.hostname}:8083`;
    }
    try {
      const manifest = Constants.manifest || Constants.expoConfig || {};
      // debuggerHost ou hostUri contient souvent "192.168.x.x:port"
      const host = (manifest.debuggerHost || manifest.hostUri || process.env.API_HOST || '').split(':')[0];
      if (host) return `http://${host}:8083`;
    } catch (e) {
      // ignore
    }
    return 'http://127.0.0.1:8083';
  };
  const API_BASE = getApiBase();
  console.log('[LoginScreen] API_BASE =', API_BASE, 'hostname =', typeof window !== 'undefined' ? window.location.hostname : 'N/A');

  // Thème clair fixe
  const theme = {
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#000000',
    textSecondary: '#666666',
    border: '#dddddd'
  };

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    try {
      console.log('[LoginScreen] Tentative de connexion avec', email);
      const resp = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        console.error('[LoginScreen] /login non-ok', resp.status, text);
        setError(`Erreur serveur: ${resp.status} ${resp.statusText}\n${text}`);
        Alert.alert('Erreur', `Serveur: ${resp.status} ${resp.statusText} \n${text}`);
        return;
      }
      const j = await resp.json();
      if (j && j.success && j.token) {
        const userObj = j.user;
        await AsyncStorage.setItem('userToken', j.token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(userObj));
        setUser(userObj, j.token);
        if (userObj.mustChangePassword) {
          Alert.alert(
            'Changement de mot de passe requis',
            'Vous devez changer votre mot de passe provisoire avant de continuer.',
            [{ 
              text: 'OK', 
              onPress: () => router.replace({ 
                pathname: '/change-password',
                params: { user: JSON.stringify(userObj) }
              })
            }]
          );
          return;
        }
        Alert.alert('Succès', `Bienvenue ${userObj.prenom} ${userObj.nom} !`);
        // Redirect tous les utilisateurs vers le dashboard unifié
        router.replace('/unified-dashboard');
      } else {
        setError(j.message || 'Email ou mot de passe incorrect');
        Alert.alert('Erreur', j.message || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      console.error('Login error', err);
      setError(`Impossible de contacter le serveur (${API_BASE})`);
      Alert.alert('Erreur', `Impossible de contacter le serveur (${API_BASE})`);
    }
  };

  return (
    <ScrollView style={styles(theme).container} contentContainerStyle={styles(theme).contentContainer}>
      <View style={styles(theme).header}>
        <Text style={styles(theme).logoPlaceholder}>🏥</Text>
        <Text style={styles(theme).title}>Planning Médical</Text>
        <Text style={styles(theme).subtitle}>Gestion professionnelle de planning</Text>
      </View>

      <View style={styles(theme).form}>
        {error ? (
          <View style={{ backgroundColor: '#ffdddd', padding: 10, borderRadius: 8, marginBottom: 10 }}>
            <Text style={{ color: '#b00020', fontWeight: 'bold', textAlign: 'center' }}>{error}</Text>
          </View>
        ) : null}
        <TextInput
          style={styles(theme).input}
          placeholder="Email ou téléphone"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="default"
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

        <TouchableOpacity 
          style={styles(theme).forgotPasswordLink}
          onPress={() => router.push('/forgot-password')}
        >
          <Text style={styles(theme).forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles(theme).infoSection}>
        <Text style={styles(theme).infoTitle}>ℹ️ Première connexion</Text>
        <Text style={styles(theme).infoText}>Utilisez les identifiants fournis par votre administrateur.</Text>
        <Text style={styles(theme).infoText}>Si vous n'avez pas encore de compte, contactez l'administrateur.</Text>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
    borderRadius: 8,
    resizeMode: 'contain'
  },
  logoPlaceholder: {
    fontSize: 80,
    marginBottom: 20,
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
  forgotPasswordLink: {
    marginTop: 15,
    alignItems: 'center',
    padding: 10,
  },
  forgotPasswordText: {
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
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
  infoSection: {
    backgroundColor: theme.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    marginTop: 20,
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

