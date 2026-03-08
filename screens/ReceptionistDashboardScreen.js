import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isSameMonth,
    isToday,
    startOfMonth,
    startOfWeek
} from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { usePlanning } from '../contexts/PlanningContext';
import { useUser } from '../contexts/UserContext';

const { width } = Dimensions.get("window");
const dayWidth = (width - 40) / 7;

export default function ReceptionistDashboardScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { planning } = usePlanning();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [todayStats, setTodayStats] = useState({
    totalToday: 0,
    totalMonth: 0,
  });

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

  // Get calendar days for the current month
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const startDate = startOfWeek(start, { weekStartsOn: 1 });
    const endDate = endOfWeek(end, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dayLabel = format(date, "EEEE dd/MM", { locale: fr });
    return planning[dayLabel] || [];
  };

  // Handle date selection to show events for that day
  const handleDatePress = (date) => {
    setSelectedDate(date);
  };

  // Calculate today's and monthly stats
  React.useEffect(() => {
    const today = format(new Date(), "EEEE dd/MM", { locale: fr });
    const todayEvents = getEventsForDate(new Date());
    
    let monthTotal = 0;
    Object.values(planning || {}).forEach(events => {
      if (events && Array.isArray(events)) {
        monthTotal += events.length;
      }
    });

    setTodayStats({
      totalToday: todayEvents.length,
      totalMonth: monthTotal,
    });
  }, [planning]);

  // Navigate months
  const goToPreviousMonth = () => setCurrentMonth(addMonths(currentMonth, -1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Day names
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => Alert.alert('Menu', 'Navigation disponible')}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>📞 Planning Réception</Text>
            <Text style={styles.headerSubtitle}>Vue du planning</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <View style={[styles.quickStatCard, { borderLeftColor: '#e74c3c' }]}>
            <Text style={styles.quickStatIcon}>📅</Text>
            <View>
              <Text style={styles.quickStatLabel}>Aujourd'hui</Text>
              <Text style={styles.quickStatValue}>{todayStats.totalToday} rdv</Text>
            </View>
          </View>
          <View style={[styles.quickStatCard, { borderLeftColor: '#27ae60' }]}>
            <Text style={styles.quickStatIcon}>📊</Text>
            <View>
              <Text style={styles.quickStatLabel}>Ce mois</Text>
              <Text style={styles.quickStatValue}>{todayStats.totalMonth} rdvs</Text>
            </View>
          </View>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNavigator}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>◀</Text>
          </TouchableOpacity>
          <View style={styles.monthDisplay}>
            <TouchableOpacity onPress={goToToday}>
              <Text style={styles.monthTitle}>{format(currentMonth, "MMMM yyyy", { locale: fr })}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Day names header */}
          <View style={styles.weekRow}>
            {dayNames.map((day) => (
              <View key={day} style={styles.dayNameCell}>
                <Text style={styles.dayNameText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar days */}
          <View style={styles.daysGrid}>
            {calendarDays.map((date, index) => {
              const events = getEventsForDate(date);
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isTodayDate = isToday(date);
              const isSelected = selectedDate && format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    !isCurrentMonth && styles.otherMonthDay,
                    isTodayDate && styles.todayDay,
                    isSelected && styles.selectedDay,
                  ]}
                  onPress={() => handleDatePress(date)}
                >
                  <Text style={[
                    styles.dayNumber,
                    !isCurrentMonth && styles.otherMonthText,
                    isTodayDate && styles.todayText
                  ]}>
                    {format(date, "d")}
                  </Text>
                  {events.length > 0 && (
                    <View style={styles.eventIndicator}>
                      <Text style={styles.eventCount}>{events.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Date Events */}
        {selectedDate && (
          <View style={styles.eventsSection}>
            <Text style={styles.selectedDateTitle}>
              {format(selectedDate, "EEEE dd MMMM yyyy", { locale: fr })}
            </Text>
            
            {selectedDateEvents.length > 0 ? (
              selectedDateEvents.map((event, index) => (
                <View key={index} style={styles.eventCard}>
                  <View style={styles.eventTop}>
                    <Text style={styles.eventTime}>{event.heure || '--:--'}</Text>
                    <Text style={styles.eventTitle}>{event.titre || 'Rendez-vous'}</Text>
                  </View>
                  <View style={styles.eventDetails}>
                    {event.medecin && (
                      <Text style={styles.eventMedecin}>👨‍⚕️ {event.medecin}</Text>
                    )}
                    {event.technicien && (
                      <Text style={styles.eventTechnicien}>👨‍🔧 {event.technicien}</Text>
                    )}
                    {event.adresse && (
                      <Text style={styles.eventAddress}>📍 {event.adresse}</Text>
                    )}
                  </View>
                  {event.commentaire && (
                    <View style={styles.eventComment}>
                      <Text style={styles.commentLabel}>Remarque:</Text>
                      <Text style={styles.commentText}>{event.commentaire}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noEventsText}>Aucun rendez-vous prévu ce jour</Text>
            )}
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statValue}>{Object.values(planning || {}).flat().length}</Text>
            <Text style={styles.statLabel}>Rendez-vous total</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.actionsSectionTitle}>🚀 Accès Rapide</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
              onPress={() => router.push('/calendar')}
            >
              <Text style={styles.actionButtonIcon}>📅</Text>
              <Text style={styles.actionButtonText}>Calendrier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#27ae60' }]}
              onPress={() => router.push('/user-management')}
            >
              <Text style={styles.actionButtonIcon}>👥</Text>
              <Text style={styles.actionButtonText}>Utilisateurs</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#f39c12' }]}
              onPress={() => router.push('/chat')}
            >
              <Text style={styles.actionButtonIcon}>💬</Text>
              <Text style={styles.actionButtonText}>Messages</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#8e44ad' }]}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.actionButtonIcon}>⚙️</Text>
              <Text style={styles.actionButtonText}>Paramètres</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#e74c3c',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 8,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  logoutIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  quickStatIcon: {
    fontSize: 24,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  quickStatValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 2,
  },
  monthNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  navButton: {
    padding: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  monthDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  dayNameCell: {
    width: dayWidth,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: dayWidth,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    position: 'relative',
  },
  otherMonthDay: {
    backgroundColor: '#fafafa',
  },
  todayDay: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 2,
  },
  selectedDay: {
    backgroundColor: '#e74c3c',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  otherMonthText: {
    color: '#ccc',
  },
  todayText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 18,
    minHeight: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textTransform: 'capitalize',
  },
  eventCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  eventDetails: {
    marginVertical: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  eventMedecin: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  eventTechnicien: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  eventAddress: {
    fontSize: 12,
    color: '#555',
  },
  eventComment: {
    marginTop: 8,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
  },
  commentLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  noEventsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  statsSection: {
    paddingHorizontal: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  actionsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  actionsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
