import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_BASE } from '../constants/api';
import { useUser } from '../contexts/UserContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 8,
    marginRight: 12
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff'
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4
  },
  filterButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#0066cc',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 16
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 12
  },
  dateSection: {
    marginBottom: 16
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 1
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc'
  },
  cardUrgent: {
    borderLeftColor: '#dc3545',
    backgroundColor: '#fff5f5'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  timeText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  urgentText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4
  },
  cardContent: {
    padding: 12
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  cardAddress: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#2c3e50'
  },
  cardMedecin: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50'
  },
  cardComment: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic'
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 4
  },
  actionText: {
    fontSize: 14,
    color: '#2c3e50'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  modalForm: {
    padding: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 15
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center'
  },
  saveButton: {
    backgroundColor: '#0066cc'
  },
  cancelButton: {
    backgroundColor: '#95a5a6'
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default function CliniqueMobileScreen() {
  const params = useLocalSearchParams();
  const { user } = useUser();
  const isAdmin = user?.role === 'admin';

  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterMyInterventions, setFilterMyInterventions] = useState(false);
  const [form, setForm] = useState({
    date: '',
    heure: '',
    adresse: '',
    medecin: '',
    commentaire: ''
  });

  const fetchInterventions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/clino-mobile`, {
        headers: {
          'Authorization': `Bearer ${user?.token || ''}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setInterventions(data.data);
      }
    } catch (err) {
      console.error('Erreur fetch clino-mobile:', err);
      Alert.alert('Erreur', 'Impossible de charger les interventions');
    }
  }, [user?.token]);

  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  // Charger les données pré-remplies du planning
  useEffect(() => {
    if (params?.prefilledData) {
      try {
        const prefilledData = JSON.parse(params.prefilledData);
        setForm(prev => ({
          ...prev,
          date: prefilledData.date || prev.date,
          heure: prefilledData.heure || prev.heure,
          medecin: prefilledData.medecin || prev.medecin,
          adresse: prefilledData.adresse || prev.adresse,
          commentaire: prefilledData.commentaire || prev.commentaire,
        }));
        // Ouvrir automatiquement le modal pour continuer la saisie
        setModalVisible(true);
      } catch (err) {
        console.error('Erreur parsing prefilledData:', err);
      }
    }
  }, [params?.prefilledData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInterventions();
    setRefreshing(false);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setForm({
        date: item.date,
        heure: item.heure,
        adresse: item.adresse,
        medecin: item.medecin,
        commentaire: item.commentaire || ''
      });
    } else {
      setEditingId(null);
      setForm({
        date: new Date().toISOString().split('T')[0],
        heure: new Date().toTimeString().slice(0, 5),
        adresse: '',
        medecin: '',
        commentaire: ''
      });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.date || !form.heure || !form.adresse || !form.medecin) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE}/clino-mobile/${editingId}` : `${API_BASE}/clino-mobile`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || ''}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      if (data.success) {
        setInterventions(data.data);
        setModalVisible(false);
        Alert.alert('Succès', editingId ? 'Intervention modifiée' : 'Intervention ajoutée');
      } else {
        Alert.alert('Erreur', data.message);
      }
    } catch (err) {
      console.error('Erreur save:', err);
      Alert.alert('Erreur', 'Impossible de sauvegarder');
    }
    setLoading(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmer la suppression',
      'Voulez-vous vraiment supprimer cette intervention ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE}/clino-mobile/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${user?.token || ''}`
                }
              });
              const data = await response.json();
              if (data.success) {
                setInterventions(data.data);
                Alert.alert('Succès', 'Intervention supprimée');
              } else {
                Alert.alert('Erreur', data.message);
              }
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de supprimer');
            }
          }
        }
      ]
    );
  };

  const groupedByDate = interventions
    .filter(item => {
      // If filter is off, show all, admin always sees all
      if (!filterMyInterventions || isAdmin) return true;
      
      // If filter is on, show only user's interventions
      const userName = user?.nom || '';
      const firstNameLastName = user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : '';
      
      return item.medecin === userName || 
             item.medecin === firstNameLastName;
    })
    .reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    }, {});

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="alert-circle" size={28} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>🚑 Clino_Mobile</Text>
            <Text style={styles.headerSubtitle}>
              {isAdmin ? 'Toutes les interventions' : 'Interventions urgentes'}
            </Text>
          </View>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
        )}
        {!isAdmin && (
          <TouchableOpacity 
            style={[styles.filterButton, filterMyInterventions && styles.filterButtonActive]}
            onPress={() => setFilterMyInterventions(!filterMyInterventions)}
          >
            <Ionicons name={filterMyInterventions ? "checkmark-circle" : "funnel"} size={18} color="#fff" />
            <Text style={styles.filterButtonText}>
              {filterMyInterventions ? 'Les miennes' : 'Tous'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {interventions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Aucune intervention programmée</Text>
          </View>
        ) : (
          Object.entries(groupedByDate).map(([date, items]) => (
            <View key={date} style={styles.dateSection}>
              <View style={styles.dateHeader}>
                <Ionicons name="calendar" size={18} color="#e74c3c" />
                <Text style={styles.dateTitle}>
                  {new Date(date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </Text>
              </View>
              {items.map((item) => (
                <InterventionCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onEdit={() => openModal(item)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Modifier' : 'Nouvelle'} Intervention
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.label}>Date *</Text>
              <TextInput
                style={styles.input}
                value={form.date}
                onChangeText={(v) => setForm({ ...form, date: v })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Heure *</Text>
              <TextInput
                style={styles.input}
                value={form.heure}
                onChangeText={(v) => setForm({ ...form, heure: v })}
                placeholder="HH:MM"
              />

              <Text style={styles.label}>Adresse *</Text>
              <TextInput
                style={styles.input}
                value={form.adresse}
                onChangeText={(v) => setForm({ ...form, adresse: v })}
                placeholder="Adresse de l'intervention"
              />

              <Text style={styles.label}>Medecin *</Text>
              <TextInput
                style={styles.input}
                value={form.medecin}
                onChangeText={(v) => setForm({ ...form, medecin: v })}
                placeholder="Nom du medecin"
              />

              <Text style={styles.label}>Commentaire</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.commentaire}
                onChangeText={(v) => setForm({ ...form, commentaire: v })}
                placeholder="Notes supplementaires..."
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.modalButtonText}>
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InterventionCard({ item, isAdmin, onEdit, onDelete }) {
  return null;
}

