import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_BASE } from '../constants/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: demande code, 2: vérification code + nouveau mdp
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async () => {
    if (!contact) {
      return Alert.alert('Erreur', 'Veuillez entrer votre email ou téléphone');
    }

    try {
      setLoading(true);
const response = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contact.trim() })
      });

      const data = await response.json();

      if (data.success) {
        // Passer directement à l'étape 2
        setStep(2);
        setLoading(false);
        
        // Afficher le code après le changement d'écran
        setTimeout(() => {
          Alert.alert(
            '✅ Code envoyé !',
            data.code 
              ? `Votre code de réinitialisation :\n\n${data.code}\n\nEntrez ce code ci-dessous pour continuer.`
              : 'Un code de réinitialisation a été envoyé. Vérifiez votre email ou Telegram.',
            [{ text: 'OK' }]
          );
        }, 100);
      } else {
        setLoading(false);
        Alert.alert('Erreur', data.message || 'Erreur lors de l\'envoi du code');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error requesting reset code:', error);
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      return Alert.alert('Erreur', 'Veuillez remplir tous les champs');
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
    }

    if (newPassword.length < 6) {
      return Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
    }

    try {
      setLoading(true);
const response = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: contact.trim(),
          code: code.trim(),
          newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          'Succès',
          'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      } else {
        Alert.alert('Erreur', data.message || 'Erreur lors de la réinitialisation');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>Mot de passe oublié</Text>
        
        {/* Indicateur d'étapes */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
            <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>1</Text>
          </View>
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
            <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberActive]}>2</Text>
          </View>
        </View>
        
        <Text style={styles.subtitle}>
          {step === 1 
            ? '📧 Étape 1 : Entrez votre email ou téléphone'
            : '🔑 Étape 2 : Entrez le code et votre nouveau mot de passe'
          }
        </Text>
      </View>

      <View style={styles.form}>
        {step === 1 ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email ou téléphone"
              value={contact}
              onChangeText={setContact}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRequestCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Envoyer le code</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Code de vérification (6 chiffres)"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe (min 6 caractères)"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <Text style={styles.errorText}>❌ Les mots de passe ne correspondent pas</Text>
            )}

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Réinitialiser le mot de passe</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={() => {
                setStep(1);
                setCode('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              disabled={loading}
            >
              <Text style={styles.linkText}>← Renvoyer un code</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.linkText}>← Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#667eea',
  },
  stepNumber: {
    color: '#999',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    width: 60,
    height: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  stepLineActive: {
    backgroundColor: '#667eea',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    padding: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 10,
    marginTop: -5,
  },
});
