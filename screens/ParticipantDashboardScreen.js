import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

export default function ParticipantDashboardScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { planning } = usePlanning();

  const [stats, setStats] = useState({
    myEventsThisWeek: 0,
    myEventsThisMonth: 0,
    upcomingEvents: [],
  });
  const [loading, setLoading] = useState(true);

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

  const calculateStats = useCallback(() => {
    setLoading(true);

    let myEventsThisWeek = 0;
    let myEventsThisMonth = 0;
    const upcomingEvents = [];

    Object.entries(planning || {}).forEach(([day, events]) => {
      if (!events || events.length === 0) return;

      events.forEach((event) => {
        const isMyEvent = event.medecin === user?.nom || event.technicien === user?.nom;
        if (isMyEvent) {
          myEventsThisWeek += 1;
          myEventsThisMonth += 1;
          upcomingEvents.push({ ...event, day });
        }
      });
    });

    // Sort upcoming events by date
    upcomingEvents.sort((a, b) => new Date(a.day) - new Date(b.day));

    setStats({
      myEventsThisWeek,
      myEventsThisMonth,
      upcomingEvents: upcomingEvents.slice(0, 5), // Show next 5
    });

    setLoading(false);
  }, [planning, user]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  const StatCard = ({ title, value, color, icon }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Chargement de votre tableau de bord...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.menuButton} onPress={() => {}}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>📊 Mon Dashboard</Text>
              <Text style={styles.headerSubtitle}>Vue d&apos;ensemble de vos activités</Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard title="Mes Événements Cette Semaine" value={stats.myEventsThisWeek} color="#007bff" icon="📅" />
          <StatCard title="Mes Événements Ce Mois" value={stats.myEventsThisMonth} color="#28a745" icon="📆" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Prochains Événements</Text>
          {stats.upcomingEvents.length > 0 ? (
            stats.upcomingEvents.map((event, index) => (
              <View key={index} style={styles.eventCard}>
                <Text style={styles.eventTitle}>{event.titre || 'Événement'}</Text>
                <Text style={styles.eventDetails}>
                  {event.day} - {event.heure || 'Heure non spécifiée'}
                </Text>
                <Text style={styles.eventRole}>
                  {event.medecin === user?.nom ? 'Médecin' : 'Technicien'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noEventsText}>Aucun événement à venir</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Actions Rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#007bff' }]}
              onPress={() => router.push('/mon-planning')}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>Mon Planning</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#28a745' }]}
              onPress={() => router.push('/calendar')}
            >
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionText}>Calendrier</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ffc107' }]} onPress={() => router.push('/chat')}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#dc3545' }]} onPress={() => router.push('/settings')}>
              <Text style={styles.actionIcon}>⚙️</Text>
              <Text style={styles.actionText}>Paramètres</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sidebar provided globally in app/_layout.jsx */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#007bff",
    padding: 20,
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#e3f2fd",
    marginTop: 2,
  },
  logoutButton: {
    padding: 10,
  },
  logoutIcon: {
    fontSize: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginRight: 10,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  section: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  eventCard: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  eventDetails: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  eventRole: {
    fontSize: 12,
    color: "#007bff",
    marginTop: 2,
  },
  noEventsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});
