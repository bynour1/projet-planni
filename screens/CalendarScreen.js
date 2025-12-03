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
import React, { useMemo, useState } from "react";
import {
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

const { width } = Dimensions.get("window");
const dayWidth = (width - 40) / 7;

export default function CalendarScreen() {
  const { planning, addEvent, removeEvent } = usePlanning();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState({ medecin: "", technicien: "", adresse: "" });

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
    if (!form.medecin || !form.technicien || !form.adresse) return;
    const dayLabel = format(selectedDate, "EEEE dd/MM", { locale: fr });
    addEvent(dayLabel, form);
    setForm({ medecin: "", technicien: "", adresse: "" });
    setModalVisible(false);
  };

  // Handle event click
  const handleEventPress = (event, date) => {
    setSelectedEvent({ ...event, date });
    setEventModalVisible(true);
  };

  // Handle delete event
  const handleDeleteEvent = () => {
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
        <Text style={styles.headerTitle}>📅 Calendrier</Text>
        <Text style={styles.headerMonth}>
          {format(currentMonth, "MMMM yyyy", { locale: fr })}
        </Text>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
          <Text style={styles.navButtonText}>⬅️ Précédent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Aujourd&apos;hui</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
          <Text style={styles.navButtonText}>Suivant ➡️</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarContainer}>
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
                  <View style={styles.eventDots}>
                    {events.slice(0, 3).map((event, idx) => (
                      <View key={idx} style={styles.eventDot} />
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

      {/* Add Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              📅 {selectedDate && format(selectedDate, "EEEE dd MMMM yyyy", { locale: fr })}
            </Text>

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
                      handleEventPress(event, selectedDate);
                    }}
                  >
                    <Text style={styles.existingEventText}>
                      👨‍⚕️ {event.medecin} • 👷 {event.technicien}
                    </Text>
                    <Text style={styles.existingEventAddress}>📍 {event.adresse}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Add New Event Form */}
            <Text style={styles.formTitle}>Ajouter un nouvel événement:</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Médecin"
              value={form.medecin}
              onChangeText={(text) => setForm({ ...form, medecin: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Technicien"
              value={form.technicien}
              onChangeText={(text) => setForm({ ...form, technicien: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Adresse"
              value={form.adresse}
              onChangeText={(text) => setForm({ ...form, adresse: text })}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setForm({ medecin: "", technicien: "", adresse: "" });
                }}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddEvent}
              >
                <Text style={styles.modalButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={eventModalVisible}
        onRequestClose={() => setEventModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📋 Détails de l&apos;événement</Text>
            
            {selectedEvent && (
              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>👨‍⚕️ Médecin:</Text>
                  <Text style={styles.detailValue}>{selectedEvent.medecin}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>👷 Technicien:</Text>
                  <Text style={styles.detailValue}>{selectedEvent.technicien}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📍 Adresse:</Text>
                  <Text style={styles.detailValue}>{selectedEvent.adresse}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📅 Date:</Text>
                  <Text style={styles.detailValue}>
                    {selectedEvent.date && format(selectedEvent.date, "EEEE dd MMMM yyyy", { locale: fr })}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
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
                <Text style={styles.modalButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#007bff" }]} />
          <Text style={styles.legendText}>Aujourd&apos;hui</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#28a745" }]} />
          <Text style={styles.legendText}>Événements</Text>
        </View>
      </View>
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
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  headerMonth: {
    fontSize: 18,
    color: "#e3f2fd",
    marginTop: 5,
    textTransform: "capitalize",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 14,
    color: "#007bff",
    fontWeight: "600",
  },
  todayButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    marginBottom: 10,
  },
  dayNameCell: {
    width: dayWidth,
    alignItems: "center",
    paddingVertical: 10,
  },
  dayNameText: {
    fontSize: 14,
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
    borderRadius: 8,
    padding: 5,
    justifyContent: "flex-start",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  eventDots: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 5,
  },
  eventDot: {
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
    textTransform: "capitalize",
  },
  existingEvents: {
    marginBottom: 20,
  },
  existingEventsTitle: {
    fontSize: 16,
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
  existingEventText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  existingEventAddress: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
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
  },
  eventDetails: {
    marginVertical: 20,
  },
  detailRow: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
});
