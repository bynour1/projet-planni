import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAnnouncements } from '../contexts/AnnouncementContext';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

export default function AnnouncementsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useUser();
  const { announcements, addAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [modalVisible, setModalVisible] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info',
  });

  const isAdmin = user?.role === 'admin';

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    addAnnouncement({
      ...newAnnouncement,
      author: user?.name || 'Admin',
    });

    setNewAnnouncement({ title: '', message: '', type: 'info' });
    setModalVisible(false);
    Alert.alert('Succès', 'Annonce publiée avec succès');
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer cette annonce?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteAnnouncement(id) },
      ]
    );
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'urgent': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'success': return '#28a745';
      default: return '#007bff';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'urgent': return '🚨';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.primary }]}>← Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>📢 Annonces</Text>
        {isAdmin && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Nouvelle</Text>
          </TouchableOpacity>
        )}
      </View>

      {announcements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Aucune annonce pour le moment
          </Text>
        </View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.announcementCard, { 
              backgroundColor: theme.card,
              borderLeftColor: getTypeColor(item.type),
            }]}>
              <View style={styles.cardHeader}>
                <View style={styles.typeContainer}>
                  <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
                  <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
                    {item.type.toUpperCase()}
                  </Text>
                </View>
                {isAdmin && (
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.message, { color: theme.textSecondary }]}>{item.message}</Text>

              <View style={styles.footer}>
                <Text style={[styles.author, { color: theme.textTertiary }]}>
                  Par {item.author}
                </Text>
                <Text style={[styles.date, { color: theme.textTertiary }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
          )}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Nouvelle Annonce</Text>

            <ScrollView>
              <Text style={[styles.label, { color: theme.text }]}>Type</Text>
              <View style={styles.typeButtons}>
                {['info', 'success', 'warning', 'urgent'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      { 
                        backgroundColor: newAnnouncement.type === type ? getTypeColor(type) : theme.background,
                        borderColor: getTypeColor(type),
                      }
                    ]}
                    onPress={() => setNewAnnouncement({ ...newAnnouncement, type })}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      { color: newAnnouncement.type === type ? '#fff' : theme.text }
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.text }]}>Titre</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border,
                }]}
                value={newAnnouncement.title}
                onChangeText={(text) => setNewAnnouncement({ ...newAnnouncement, title: text })}
                placeholder="Titre de l'annonce"
                placeholderTextColor={theme.textTertiary}
              />

              <Text style={[styles.label, { color: theme.text }]}>Message</Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border,
                }]}
                value={newAnnouncement.message}
                onChangeText={(text) => setNewAnnouncement({ ...newAnnouncement, message: text })}
                placeholder="Contenu de l'annonce"
                placeholderTextColor={theme.textTertiary}
                multiline
                numberOfLines={4}
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleAddAnnouncement}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Publier</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  listContent: {
    padding: 15,
  },
  announcementCard: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  author: {
    fontSize: 12,
  },
  date: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  typeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
