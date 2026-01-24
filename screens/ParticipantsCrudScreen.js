import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useUser } from '../contexts/UserContext';

const API_BASE = (() => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:8082`;
  }
  return 'http://127.0.0.1:8082';
})();

export default function ParticipantsCrudScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    phone: '',
    role: 'medecin', // médecin, technicien, admin
  });
  const [searchText, setSearchText] = useState('');

  // Load participants on mount
  useEffect(() => {
    loadParticipants();
  }, []);

  // Get user token from AsyncStorage
  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (e) {
      console.error('Error getting token:', e);
      return null;
    }
  };

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(`${API_BASE}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      // Filter only confirmed users
      const activeParticipants = Array.isArray(data) 
        ? data.filter(p => p.isConfirmed)
        : [];
      
      setParticipants(activeParticipants);
    } catch (error) {
      console.error('[ParticipantsCrud] Load error:', error);
      Alert.alert('Erreur', 'Impossible de charger les participants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadParticipants();
  };

  const openAddModal = () => {
    setEditingParticipant(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      phone: '',
      role: 'medecin',
    });
    setModalVisible(true);
  };

  const openEditModal = (participant) => {
    setEditingParticipant(participant);
    setFormData({
      nom: participant.nom || '',
      prenom: participant.prenom || '',
      email: participant.email || '',
      phone: participant.phone || '',
      role: participant.role || 'medecin',
    });
    setModalVisible(true);
  };

  const handleSaveParticipant = async () => {
    if (!formData.nom || !formData.prenom || !formData.email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const token = await getToken();

      if (editingParticipant) {
        // Update existing participant
        const response = await fetch(`${API_BASE}/update-user/${editingParticipant.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        Alert.alert('Succès', 'Participant modifié avec succès');
      } else {
        // Create new participant
        const response = await fetch(`${API_BASE}/create-user-direct`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        Alert.alert('Succès', 'Participant créé avec succès');
      }

      setModalVisible(false);
      loadParticipants();
    } catch (error) {
      console.error('[ParticipantsCrud] Save error:', error);
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder le participant');
    }
  };

  const handleDeleteParticipant = (participant) => {
    Alert.alert(
      'Supprimer le participant',
      `Êtes-vous sûr de vouloir supprimer ${participant.prenom} ${participant.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              const response = await fetch(`${API_BASE}/delete-user/${participant.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }

              Alert.alert('Succès', 'Participant supprimé avec succès');
              loadParticipants();
            } catch (error) {
              console.error('[ParticipantsCrud] Delete error:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le participant');
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#dc3545';
      case 'medecin':
        return '#007bff';
      case 'technicien':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return '👑 Admin';
      case 'medecin':
        return '🩺 Médecin';
      case 'technicien':
        return '🔧 Technicien';
      default:
        return '👤 Utilisateur';
    }
  };

  const filteredParticipants = participants.filter(p => {
    const search = searchText.toLowerCase();
    return (
      p.nom.toLowerCase().includes(search) ||
      p.prenom.toLowerCase().includes(search) ||
      p.email.toLowerCase().includes(search) ||
      (p.phone && p.phone.includes(search))
    );
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>✅ Participants Actifs</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom, email, téléphone..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{participants.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{participants.filter(p => p.role === 'medecin').length}</Text>
            <Text style={styles.statLabel}>Médecins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{participants.filter(p => p.role === 'technicien').length}</Text>
            <Text style={styles.statLabel}>Techniciens</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{participants.filter(p => p.role === 'admin').length}</Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
        </View>

        {/* Participants List */}
        <View style={styles.listContainer}>
          {loading ? (
            <Text style={styles.loadingText}>Chargement...</Text>
          ) : filteredParticipants.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchText ? 'Aucun participant trouvé' : 'Aucun participant actif'}
            </Text>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={filteredParticipants}
              keyExtractor={(item) => String(item.id || item.email)}
              renderItem={({ item }) => (
                <View style={styles.participantCard}>
                  <View style={styles.participantInfo}>
                    <View style={styles.participantHeader}>
                      <View>
                        <Text style={styles.participantId}>#{item.id}</Text>
                        <Text style={styles.participantName}>
                          {item.nom} {item.prenom}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.roleBadge,
                          { backgroundColor: getRoleColor(item.role) },
                        ]}
                      >
                        <Text style={styles.roleText}>{getRoleLabel(item.role)}</Text>
                      </View>
                    </View>
                    <Text style={styles.participantEmail}>✉️ {item.email}</Text>
                    {item.phone && (
                      <Text style={styles.participantPhone}>📱 {item.phone}</Text>
                    )}
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.iconButton, styles.editButton]}
                      onPress={() => openEditModal(item)}
                    >
                      <Text style={styles.buttonIcon}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconButton, styles.deleteButton]}
                      onPress={() => handleDeleteParticipant(item)}
                    >
                      <Text style={styles.buttonIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>

      {/* Modal - Add/Edit Participant */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingParticipant ? 'Modifier le participant' : 'Ajouter un participant'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Prénom *"
              value={formData.prenom}
              onChangeText={(text) =>
                setFormData({ ...formData, prenom: text })
              }
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Nom *"
              value={formData.nom}
              onChangeText={(text) => setFormData({ ...formData, nom: text })}
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              placeholderTextColor="#999"
              editable={!editingParticipant}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Téléphone (optionnel)"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />

            <View style={styles.roleSelector}>
              <Text style={styles.roleSelectorLabel}>Rôle:</Text>
              {['medecin', 'technicien', 'admin'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    formData.role === role && styles.roleOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, role })}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      formData.role === role && styles.roleOptionTextSelected,
                    ]}
                  >
                    {getRoleLabel(role)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveParticipant}
              >
                <Text style={styles.saveButtonText}>
                  {editingParticipant ? 'Mettre à jour' : 'Créer'}
                </Text>
              </TouchableOpacity>
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  backButton: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  participantCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  participantInfo: {
    flex: 1,
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 10,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  participantEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  participantPhone: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  participantId: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#fff3cd',
  },
  deleteButton: {
    backgroundColor: '#f8d7da',
  },
  buttonIcon: {
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
  },
  roleSelector: {
    marginBottom: 20,
  },
  roleSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  roleOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  roleOptionSelected: {
    backgroundColor: '#e7f5ff',
    borderColor: '#007bff',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  roleOptionTextSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
