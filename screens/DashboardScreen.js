import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { usePlanning } from "../contexts/PlanningContext";
import { useUser } from "../contexts/UserContext";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { planning } = usePlanning();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalMedecins: 0,
    totalTechniciens: 0,
    eventsThisWeek: 0,
    eventsThisMonth: 0,
    medecinStats: [],
    technicienStats: [],
    weekdayDistribution: {},
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userInfo');
            setUser(null, null);
            router.replace('/');
          }
        }
      ]
    );
  };

  const calculateStats = useCallback(() => {
    setLoading(true);
    const medecinCount = {};
    const technicienCount = {};
    const weekdayDist = {
      Lundi: 0,
      Mardi: 0,
      Mercredi: 0,
      Jeudi: 0,
      Vendredi: 0,
      Samedi: 0,
      Dimanche: 0,
    };

    let total = 0;
    let thisWeek = 0;
    let thisMonth = 0;

    Object.entries(planning).forEach(([day, events]) => {
      if (!events || events.length === 0) return;

      total += events.length;

      // Extract day name
      const dayName = day.split(" ")[0];
      if (weekdayDist[dayName] !== undefined) {
        weekdayDist[dayName] += events.length;
      }

      events.forEach((event) => {
        // Count by medecin
        if (event.medecin) {
          medecinCount[event.medecin] = (medecinCount[event.medecin] || 0) + 1;
        }

        // Count by technicien
        if (event.technicien) {
          technicienCount[event.technicien] = (technicienCount[event.technicien] || 0) + 1;
        }
      });

      // Count this week and this month (simplified)
      thisWeek += events.length; // You can improve this with date parsing
      thisMonth += events.length;
    });

    const medecinStats = Object.entries(medecinCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const technicienStats = Object.entries(technicienCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalEvents: total,
      totalMedecins: Object.keys(medecinCount).length,
      totalTechniciens: Object.keys(technicienCount).length,
      eventsThisWeek: thisWeek,
      eventsThisMonth: thisMonth,
      medecinStats,
      technicienStats,
      weekdayDistribution: weekdayDist,
    });
    setLoading(false);
  }, [planning]);

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

  const BarChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map((d) => d.count), 1);
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        {data.map((item, index) => (
          <View key={index} style={styles.barRow}>
            <Text style={styles.barLabel}>{item.name}</Text>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  { width: `${(item.count / maxValue) * 100}%` },
                ]}
              />
              <Text style={styles.barValue}>{item.count}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setSidebarVisible(!sidebarVisible)}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>📊 Dashboard</Text>
              <Text style={styles.headerSubtitle}>Vue d&apos;ensemble du planning</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

      {/* Statistics Cards */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Événements"
          value={stats.totalEvents}
          color="#007bff"
          icon="📅"
        />
        <StatCard
          title="Médecins"
          value={stats.totalMedecins}
          color="#28a745"
          icon="👨‍⚕️"
        />
        <StatCard
          title="Techniciens"
          value={stats.totalTechniciens}
          color="#ffc107"
          icon="👷"
        />
        <StatCard
          title="Cette Semaine"
          value={stats.eventsThisWeek}
          color="#17a2b8"
          icon="📆"
        />
      </View>

      {/* Distribution by Weekday */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Distribution par Jour</Text>
        <View style={styles.weekdayContainer}>
          {Object.entries(stats.weekdayDistribution).map(([day, count]) => (
            <View key={day} style={styles.weekdayCard}>
              <Text style={styles.weekdayName}>{day.substring(0, 3)}</Text>
              <View
                style={[
                  styles.weekdayBar,
                  { height: Math.max((count / stats.totalEvents) * 100, 5) },
                ]}
              />
              <Text style={styles.weekdayCount}>{count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top Medecins */}
      {stats.medecinStats.length > 0 && (
        <BarChart data={stats.medecinStats} title="🏆 Top Médecins" />
      )}

      {/* Top Techniciens */}
      {stats.technicienStats.length > 0 && (
        <BarChart data={stats.technicienStats} title="🏆 Top Techniciens" />
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Actions Rapides</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#007bff" }]}>
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Nouvel Événement</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#28a745" }]}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionText}>Voir Planning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#ffc107" }]}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Rapports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "#dc3545" }]}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Paramètres</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>

    {/* Sidebar */}
    {sidebarVisible && user && (
      <View style={styles.sidebarOverlay}>
        <TouchableOpacity
          style={styles.sidebarBackdrop}
          onPress={() => setSidebarVisible(false)}
        />
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Menu</Text>
            <TouchableOpacity onPress={() => setSidebarVisible(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sidebarContent}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.prenom} {user.nom}</Text>
              <Text style={styles.userRole}>
                {user.role === 'admin' ? 'Administrateur' : user.role === 'medecin' ? 'Médecin' : 'Technicien'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => {
                setSidebarVisible(false);
                router.push('/dashboard');
              }}
            >
              <Text style={styles.sidebarItemIcon}>📊</Text>
              <Text style={styles.sidebarItemText}>Dashboard</Text>
            </TouchableOpacity>

            {user.role === 'admin' && (
              <>
                <TouchableOpacity
                  style={styles.sidebarItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push('/user-management');
                  }}
                >
                  <Text style={styles.sidebarItemIcon}>👥</Text>
                  <Text style={styles.sidebarItemText}>Gestion des utilisateurs</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sidebarItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push('/admin-planning');
                  }}
                >
                  <Text style={styles.sidebarItemIcon}>📅</Text>
                  <Text style={styles.sidebarItemText}>Gestion des plannings</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => {
                setSidebarVisible(false);
                const path = user.role === 'medecin' ? '/medecin' : user.role === 'technicien' ? '/technicien' : '/admin-planning';
                router.push(path);
              }}
            >
              <Text style={styles.sidebarItemIcon}>📋</Text>
              <Text style={styles.sidebarItemText}>Mon Planning</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => {
                setSidebarVisible(false);
                router.push('/chat');
              }}
            >
              <Text style={styles.sidebarItemIcon}>💬</Text>
              <Text style={styles.sidebarItemText}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sidebarItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <Text style={styles.sidebarItemIcon}>🚪</Text>
              <Text style={[styles.sidebarItemText, styles.logoutText]}>Déconnexion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )}
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
  weekdayContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 150,
    paddingBottom: 10,
  },
  weekdayCard: {
    alignItems: "center",
    flex: 1,
  },
  weekdayName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 5,
  },
  weekdayBar: {
    width: 30,
    backgroundColor: "#007bff",
    borderRadius: 5,
    minHeight: 5,
  },
  weekdayCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  chartContainer: {
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
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  barLabel: {
    width: 100,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  barWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  bar: {
    height: 30,
    backgroundColor: "#007bff",
    borderRadius: 5,
    minWidth: 20,
  },
  barValue: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
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
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#007bff',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
  },
  sidebarContent: {
    flex: 1,
    padding: 20,
  },
  userInfo: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  sidebarItemIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  sidebarItemText: {
    fontSize: 16,
    color: '#333',
  },
  logoutItem: {
    marginTop: 'auto',
    backgroundColor: '#fee',
  },
  logoutText: {
    color: '#d32f2f',
  },
});
