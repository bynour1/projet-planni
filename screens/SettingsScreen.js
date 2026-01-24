import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Header from "../components/Header";
import { API_BASE } from "../constants/api";
import { useTheme } from "../contexts/ThemeContext";
import { useUser } from "../contexts/UserContext";
import boxShadow from "../utils/boxShadow";

export default function SettingsScreen() {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { user } = useUser();
  
  // États pour changer le mot de passe
  const [userContactPassword, setUserContactPassword] = useState('');
  const [adminConfirmCode, setAdminConfirmCode] = useState('');
  const [userNewPassword, setUserNewPassword] = useState('');
  const [userConfirmPassword, setUserConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Fonction pour créer/changer le mot de passe
  const handleCreateUserPassword = async () => {
    if (!userContactPassword.trim()) {
      return Alert.alert("Erreur", "Veuillez entrer votre email");
    }
    
    if (!adminConfirmCode.trim()) {
      return Alert.alert("Erreur", "Veuillez entrer le code de confirmation");
    }
    
    if (userNewPassword.length < 6) {
      return Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
    }
    
    if (userNewPassword !== userConfirmPassword) {
      return Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contact: userContactPassword.trim().toLowerCase(),
          code: adminConfirmCode.trim(),
          newPassword: userNewPassword
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert(
          '✅ Succès', 
          'Votre mot de passe a été créé avec succès ! Vous pouvez maintenant vous connecter.',
          [
            {
              text: 'OK',
              onPress: () => {
                setUserContactPassword('');
                setAdminConfirmCode('');
                setUserNewPassword('');
                setUserConfirmPassword('');
              }
            }
          ]
        );
      } else {
        Alert.alert('Erreur', data.message || 'Code invalide ou expiré');
      }
    } catch (error) {
      console.error('Erreur lors de la création du mot de passe:', error);
      Alert.alert('Erreur', 'Impossible de créer le mot de passe. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour renvoyer le code
  const handleResendCode = async () => {
    if (!userContactPassword.trim()) {
      return Alert.alert("Erreur", "Veuillez entrer votre email");
    }

    setLoading(true);
    
    try {
  const response = await fetch(`${API_BASE}/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: userContactPassword.trim().toLowerCase() }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert('✅ Succès', 'Un nouveau code a été envoyé à votre email');
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de renvoyer le code');
      }
    } catch (error) {
      console.error('Erreur lors du renvoi du code:', error);
      Alert.alert('Erreur', 'Impossible de renvoyer le code. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const themeOptions = [
    { id: "light", label: "Clair", icon: "☀️", description: "Mode jour" },
    { id: "dark", label: "Sombre", icon: "🌙", description: "Mode nuit" },
    { id: "auto", label: "Automatique", icon: "🔄", description: "Suit le système" },
  ];

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Header />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Paramètres</Text>
        <Text style={styles.headerSubtitle}>Personnalisez votre application</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Section Informations utilisateur */}
        {user && (
          <View style={[styles.section, { backgroundColor: '#e3f2fd', borderLeftWidth: 4, borderLeftColor: '#2196F3' }]}>
            <Text style={styles.sectionTitle}>👤 Informations du compte</Text>
            <Text style={styles.infoText}>📧 Email: {user.email}</Text>
            <Text style={styles.infoText}>👨‍⚕️ Nom: {user.prenom} {user.nom}</Text>
            <Text style={styles.infoText}>🎭 Rôle: {user.role}</Text>
          </View>
        )}

        {/* Section Créer/Changer le mot de passe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Créer ou changer votre mot de passe</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>
              ℹ️ Si vous venez de recevoir un code de confirmation par email, 
              ou si vous souhaitez changer votre mot de passe, utilisez ce formulaire.
            </Text>
          </View>

          <Text style={styles.label}>📧 Votre email</Text>
          <TextInput
            style={styles.input}
            placeholder="exemple@email.com"
            value={userContactPassword}
            onChangeText={setUserContactPassword}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <Text style={styles.label}>🔢 Code de confirmation (6 chiffres)</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputWithButton]}
              placeholder="123456"
              value={adminConfirmCode}
              onChangeText={setAdminConfirmCode}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={handleResendCode}
              disabled={loading || !userContactPassword.trim()}
            >
              <Text style={styles.resendButtonText}>📨 Renvoyer</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>🔒 Nouveau mot de passe (minimum 6 caractères)</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={userNewPassword}
            onChangeText={setUserNewPassword}
            secureTextEntry
            editable={!loading}
          />

          <Text style={styles.label}>🔒 Confirmer le mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={userConfirmPassword}
            onChangeText={setUserConfirmPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.passwordButton, loading && styles.buttonDisabled]}
            onPress={handleCreateUserPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.passwordButtonText}>✅ Créer/Changer mon mot de passe</Text>
            )}
          </TouchableOpacity>

          <View style={styles.helpBox}>
            <Text style={styles.helpTitle}>❓ Besoin d'aide ?</Text>
            <Text style={styles.helpText}>
              • Si vous n'avez pas reçu de code, contactez votre administrateur{'\n'}
              • Le code est valide pendant 10 minutes{'\n'}
              • Votre mot de passe doit contenir au moins 6 caractères
            </Text>
          </View>
        </View>

        {/* Section Apparence */}
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
      boxShadow: boxShadow(theme.shadow, 2, 4, 0.1),
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
      boxShadow: boxShadow(theme.shadow, 1, 2, 0.1),
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
    // Nouveaux styles pour la section mot de passe
    infoText: {
      fontSize: 14,
      color: '#555',
      marginBottom: 5,
      paddingVertical: 3,
    },
    infoBox: {
      backgroundColor: '#fff3cd',
      borderRadius: 8,
      padding: 12,
      marginBottom: 15,
      borderLeftWidth: 3,
      borderLeftColor: '#ffc107',
    },
    infoBoxText: {
      fontSize: 13,
      color: '#856404',
      lineHeight: 18,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
      marginTop: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme.card,
      color: theme.text,
      marginBottom: 15,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    inputWithButton: {
      flex: 1,
      marginRight: 10,
      marginBottom: 0,
    },
    resendButton: {
      backgroundColor: '#2196F3',
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 8,
    },
    resendButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    passwordButton: {
      backgroundColor: '#4CAF50',
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
    },
    passwordButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    helpBox: {
      backgroundColor: theme.card,
      borderRadius: 10,
      padding: 15,
      marginTop: 15,
      borderWidth: 1,
      borderColor: theme.border,
    },
    helpTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 10,
    },
    helpText: {
      fontSize: 13,
      color: theme.textSecondary,
      lineHeight: 20,
    },
  });
