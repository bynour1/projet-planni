import { Ionicons } from '@expo/vector-icons';
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
import { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { usePlanning } from "../contexts/PlanningContext";
import { useUser } from "../contexts/UserContext";

const { width } = Dimensions.get("window");
const dayWidth = (width - 40) / 7;

export default function CalendarScreen() {
  const { planning, addEvent, removeEvent, addComment } = usePlanning();
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';
  const canEdit = isAdmin;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventIndex, setSelectedEventIndex] = useState(null);
  const [form, setForm] = useState({ medecin: "", technicien: "", adresse: "" });
  const [commentForm, setCommentForm] = useState("");

  // Get calendar days for the current month
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    // Add previous month days to fill the first week
    const startDate = startOfWeek(start, { weekStartsOn: 1 });
    const endDate = endOfWeek(end, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dayLabel = format(date, "EEEE dd/MM", { locale: fr });
    return planning[dayLabel] || [];
  };

  // Handle date selection
  const handleDatePress = (date) => {
    setSelectedDate(date);
    setModalVisible(true);
  };

  // Handle add event
  const handleAddEvent = () => {
    if (!form.medecin || !form.technicien || !form.adresse) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    const dayLabel = format(selectedDate, "EEEE dd/MM", { locale: fr });
    addEvent(dayLabel, form.medecin, form.technicien, form.adresse, "", "");
    setForm({ medecin: "", technicien: "", adresse: "" });
    setModalVisible(false);
  };

  // Handle event click
  const handleEventPress = (event, date, index) => {
    setSelectedEvent({ ...event, date });
    setSelectedEventIndex(index);
    setCommentForm(event.commentaire || "");
    setEventModalVisible(true);
  };

  // Handle delete event
  const handleDeleteEvent = () => {
    if (!canEdit) return;
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer cet événement ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: () => {
            const dayLabel = format(selectedEvent.date, "EEEE dd/MM", { locale: fr });
            const events = planning[dayLabel] || [];
            const index = events.findIndex((e) => 
              e.medecin === selectedEvent.medecin && 
              e.technicien === selectedEvent.technicien
            );
            if (index !== -1) {
              removeEvent(dayLabel, index);
            }
            setEventModalVisible(false);
            setSelectedEvent(null);
          }
        }
      ]
    );
  };

  // Handle add comment
  const handleAddComment = () => {
    if (!commentForm.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un commentaire");
      return;
    }
    const dayLabel = format(selectedEvent.date, "EEEE dd/MM", { locale: fr });
    addComment(dayLabel, selectedEventIndex, commentForm);
    setSelectedEvent({ ...selectedEvent, commentaire: commentForm });
    setEventModalVisible(false);
    Alert.alert("Succès", "Commentaire ajouté avec succès");
  };

  // Navigate months
  const goToPreviousMonth = () => setCurrentMonth(addMonths(currentMonth, -1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Day names
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>📅 Calendrier</Text>
          {canEdit ? (
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          ) : (
            <View style={styles.readOnlyBadge}>
              <Ionicons name="eye" size={16} color="#fff" />
              <Text style={styles.readOnlyBadgeText}>Lecture seule</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerMonth}>
          {format(currentMonth, "MMMM yyyy", { locale: fr })}
        </Text>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
          <Ionicons name="chevron-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Aujourd'hui</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarContainer} showsVerticalScrollIndicator={false}>
        {/* Day Names */}
        <View style={styles.weekRow}>
          {dayNames.map((day) => (
            <View key={day} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={styles.daysGrid}>
          {calendarDays.map((day, index) => {
            const events = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !isCurrentMonth && styles.otherMonthDay,
                  isTodayDate && styles.todayCell,
                ]}
                onPress={() => handleDatePress(day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    !isCurrentMonth && styles.otherMonthText,
                    isTodayDate && styles.todayText,
                  ]}
                >
                  {format(day, "d")}
                </Text>
                {events.length > 0 && (
                  <View style={styles.eventIndicators}>
                    {events.slice(0, 3).map((event, idx) => (
                      <View key={idx} style={styles.eventIndicator} />
                    ))}
                    {events.length > 3 && (
                      <Text style={styles.moreEvents}>+{events.length - 3}</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#007bff" }]} />
          <Text style={styles.legendText}>Aujourd'hui</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#28a745" }]} />
          <Text style={styles.legendText}>Événements</Text>
        </View>
        {canEdit && (
          <View style={styles.legendItem}>
            <Ionicons name="create" size={16} color="#28a745" />
            <Text style={styles.legendText}>Modifier</Text>
          </View>
        )}
      </View>

      {/* Add Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                📅 {selectedDate && format(selectedDate, "EEEE dd MMMM yyyy", { locale: fr })}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => {
                  setModalVisible(false);
                  setForm({ medecin: "", technicien: "", adresse: "" });
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Existing Events */}
            {selectedDate && getEventsForDate(selectedDate).length > 0 && (
              <View style={styles.existingEvents}>
                <Text style={styles.existingEventsTitle}>Événements existants:</Text>
                {getEventsForDate(selectedDate).map((event, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.existingEvent}
                    onPress={() => {
                      setModalVisible(false);
                      handleEventPress(event, selectedDate, idx);
                    }}
                  >
                    <View style={styles.existingEventHeader}>
                      <Ionicons name="medical" size={18} color="#28a745" />
                      <Text style={styles.existingEventText}>
                        {event.medecin} • {event.technicien}
                      </Text>
                    </View>
                    <View style={styles.existingEventRow}>
                      <Ionicons name="location" size={14} color="#666" />
                      <Text style={styles.existingEventAddress}>{event.adresse}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Add New Event Form - Admin Only */}
            {canEdit ? (
              <>
                <Text style={styles.formTitle}>Ajouter un nouvel événement:</Text>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="#007bff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Médecin"
                    value={form.medecin}
                    onChangeText={(text) => setForm({ ...form, medecin: text })}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="construct" size={20} color="#007bff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Technicien"
                    value={form.technicien}
                    onChangeText={(text) => setForm({ ...form, technicien: text })}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="map" size={20} color="#007bff" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Adresse"
                    value={form.adresse}
                    onChangeText={(text) => setForm({ ...form, adresse: text })}
                    multiline
                  />
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setModalVisible(false);
                      setForm({ medecin: "", technicien: "", adresse: "" });
                    }}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                    <Text style={styles.modalButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.addButton]}
                    onPress={handleAddEvent}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.modalButtonText}>Ajouter</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.readOnlyMessage}>
                <Ionicons name="information-circle" size={48} color="#ffc107" />
                <Text style={styles.readOnlyTitle}>Mode lecture seule</Text>
                <Text style={styles.readOnlyText}>
                  Seul l'administrateur peut ajouter ou modifier des événements. 
                  Vous pouvez consulter les détails et ajouter des commentaires.
                </Text>
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeModalButtonText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Event Details Modal with Comments */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={eventModalVisible}
        onRequestClose={() => setEventModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📋 Détails de l'événement</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setEventModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {selectedEvent && (
              <ScrollView style={styles.eventDetailsScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.eventDetails}>
                  <View style={styles.detailCard}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailIcon}>
                        <Ionicons name="person" size={20} color="#007bff" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Médecin</Text>
                        <Text style={styles.detailValue}>{selectedEvent.medecin}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <View style={styles.detailIcon}>
                        <Ionicons name="construct" size={20} color="#28a745" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Technicien</Text>
                        <Text style={styles.detailValue}>{selectedEvent.technicien}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <View style={styles.detailIcon}>
                        <Ionicons name="location" size={20} color="#dc3545" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Adresse</Text>
                        <Text style={styles.detailValue}>{selectedEvent.adresse}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <View style={styles.detailIcon}>
                        <Ionicons name="calendar" size={20} color="#17a2b8" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Date</Text>
                        <Text style={styles.detailValue}>
                          {selectedEvent.date && format(selectedEvent.date, "EEEE dd MMMM yyyy", { locale: fr })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Comments Section */}
                  <View style={styles.commentsSection}>
                    <View style={styles.commentsHeader}>
                      <Ionicons name="chatbubble-ellipses" size={20} color="#6c757d" />
                      <Text style={styles.commentsTitle}>Commentaires</Text>
                    </View>
                    
                    {selectedEvent.commentaire ? (
                      <View style={styles.existingComment}>
                        <Text style={styles.commentText}>{selectedEvent.commentaire}</Text>
                      </View>
                    ) : (
                      <Text style={styles.noComment}>Aucun commentaire</Text>
                    )}

                    {/* Add Comment Form */}
                    <View style={styles.addCommentForm}>
                      <Text style={styles.addCommentTitle}>Ajouter un commentaire:</Text>
                      <TextInput
                        style={styles.commentInput}
                        placeholder="Votre commentaire..."
                        value={commentForm}
                        onChangeText={setCommentForm}
                        multiline
                        numberOfLines={3}
                      />
                      <TouchableOpacity
                        style={styles.addCommentButton}
                        onPress={handleAddComment}
                      >
                        <Ionicons name="send" size={18} color="#fff" />
                        <Text style={styles.addCommentButtonText}>Envoyer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              {canEdit ? (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setEventModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Fermer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={handleDeleteEvent}
                  >
                    <Ionicons name="trash" size={18} color="#fff" />
                    <Text style={styles.modalButtonText}>Supprimer</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEventModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Fermer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#007bff",
    padding: 20,
    paddingTop: 40,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  adminBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  readOnlyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 193, 7, 0.8)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  readOnlyBadgeText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },
  headerMonth: {
    fontSize: 18,
    color: "#e3f2fd",
    textTransform: "capitalize",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  navButton: {
    padding: 5,
  },
  todayButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  todayButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  calendarContainer: {
    flex: 1,
    padding: 10,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  dayNameCell: {
    width: dayWidth,
    alignItems: "center",
    paddingVertical: 10,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: dayWidth,
    height: dayWidth,
    backgroundColor: "#fff",
    margin: 2,
    borderRadius: 12,
    padding: 5,
    justifyContent: "flex-start",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  otherMonthDay: {
    backgroundColor: "#f5f5f5",
  },
  todayCell: {
    backgroundColor: "#e3f2fd",
    borderWidth: 2,
    borderColor: "#007bff",
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  otherMonthText: {
    color: "#999",
  },
  todayText: {
    color: "#007bff",
    fontWeight: "bold",
  },
  eventIndicators: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 4,
  },
  eventIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#28a745",
    margin: 1,
  },
  moreEvents: {
    fontSize: 10,
    color: "#666",
    marginLeft: 2,
    fontWeight: "600",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "92%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textTransform: "capitalize",
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  existingEvents: {
    marginBottom: 15,
    maxHeight: 200,
  },
  existingEventsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
  },
  existingEvent: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  existingEventHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  existingEventText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    marginLeft: 8,
  },
  existingEventRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 26,
  },
  existingEventAddress: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  inputIcon: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  addButton: {
    backgroundColor: "#28a745",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  readOnlyMessage: {
    alignItems: "center",
    padding: 20,
  },
  readOnlyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  readOnlyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
  closeModalButton: {
    marginTop: 15,
    backgroundColor: "#007bff",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeModalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  eventDetailsScroll: {
    maxHeight: 400,
  },
  eventDetails: {
    marginVertical: 10,
  },
  detailCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  commentsSection: {
    marginTop: 10,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  existingComment: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  commentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  noComment: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 10,
  },
  addCommentForm: {
    marginTop: 10,
  },
  addCommentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
    minHeight: 80,
  },
  addCommentButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  addCommentButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
});

