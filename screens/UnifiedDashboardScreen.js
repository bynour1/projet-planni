import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { usePlanning } from '../contexts/PlanningContext';
import { useUser } from '../contexts/UserContext';

// Palette médicale professionnelle
const MEDICAL_BLUE = '#0066cc';
const GRAY_BG = '#f5f7fa';
const GRAY_TEXT = '#666666';
const WHITE = '#ffffff';

export default function UnifiedDashboardScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { planning } = usePlanning();
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  // Calculer les statistiques
  const [stats, setStats] = useState({
    totalEvents: 0,
    eventToday: 0,
    eventThisWeek: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      try {
        let total = 0;
        let today = 0;
        let thisWeek = 0;

        Object.entries(planning || {}).forEach(([day, events]) => {
          if (!events || events.length === 0) return;
          total += events.length;
          // Simple count for today/week (can be improved with date logic)
          if (events.length > 0) {
            thisWeek += events.length;
          }
        });

        setStats({
          totalEvents: total,
          eventToday: today,
          eventThisWeek: thisWeek,
        });
      } catch (error) {
        console.error('Error calculating stats:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, [planning]);

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userInfo');
            setUser(null, null);
            router.replace('/');
          } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            Alert.alert('Erreur', 'Impossible de se déconnecter');
          }
        },
      },
    ]);
  };

  const navigateTo = (route) => {
    router.push(route.startsWith('/') ? route : `/${route}`);
  };

  // Couleur selon le rôle
  const getRoleLabel = () => {
    if (isAdmin) return 'Administrateur';
    if (user?.role === 'medecin') return 'Médecin';
    if (user?.role === 'technicien') return 'Technicien';
    return 'Utilisateur';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MEDICAL_BLUE} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* En-tête minimaliste */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bienvenue,</Text>
          <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
          <View style={styles.roleContainer}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{getRoleLabel()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Statistiques */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalEvents}</Text>
          <Text style={styles.statLabel}>Événements</Text>
          <Text style={styles.statTime}>cette semaine</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.eventThisWeek}</Text>
          <Text style={styles.statLabel}>À faire</Text>
          <Text style={styles.statTime}>en cours</Text>
        </View>
      </View>

      {/* Section Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Accès Rapide</Text>

        {/* Grille 1 */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('/planning')}>
            <Text style={styles.gridIcon}>📅</Text>
            <Text style={styles.gridLabel}>Planning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('/chat')}>
            <Text style={styles.gridIcon}>💬</Text>
            <Text style={styles.gridLabel}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Grille 2 */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('/calendar')}>
            <Text style={styles.gridIcon}>📆</Text>
            <Text style={styles.gridLabel}>Calendrier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('/clinique-mobile')}>
            <Text style={styles.gridIcon}>🏥</Text>
            <Text style={styles.gridLabel}>Clinique</Text>
          </TouchableOpacity>
        </View>

        {/* Grille 3 */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('/events-routines')}>
            <Text style={styles.gridIcon}>📌</Text>
            <Text style={styles.gridLabel}>Événements</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigateTo('/settings')}>
            <Text style={styles.gridIcon}>⚙️</Text>
            <Text style={styles.gridLabel}>Paramètres</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Only */}
        {isAdmin && (
          <TouchableOpacity 
            style={styles.fullWidthButton}
            onPress={() => navigateTo('/user-management')}
          >
            <Text style={styles.fullWidthButtonText}>👥 Gérer les utilisateurs</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bouton Déconnexion */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: GRAY_BG,
  },
  header: {
    backgroundColor: MEDICAL_BLUE,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: WHITE,
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 11,
    color: WHITE,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: MEDICAL_BLUE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: MEDICAL_BLUE,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: GRAY_TEXT,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  gridIcon: {
    fontSize: 32,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  fullWidthButton: {
    backgroundColor: MEDICAL_BLUE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  fullWidthButtonText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: WHITE,
    alignItems: 'center',
  },
  logoutText: {
    color: GRAY_TEXT,
    fontSize: 13,
    fontWeight: '600',
  },
});
