import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from "@react-native-picker/picker";
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Header from "../components/Header";
import { API_BASE } from '../constants/api';

// Base d'utilisateurs déjà créés par admin
// initial local placeholder; real users are fetched from backend
let usersList = [];

export default function UserManagementScreen() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  // load users from backend
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/users`);
        const json = await resp.json();
        if (json.success) setUsers(json.users);
      } catch (e) {
        console.warn('Impossible de charger les utilisateurs', e);
      }
    })();
  }, []);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState("medecin");
  const [inviteName, setInviteName] = useState("");
  const [invitePrenom, setInvitePrenom] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [lastInvitedId, setLastInvitedId] = useState(null);
  const [inviteEmailError, setInviteEmailError] = useState('');
  const [inviteChecking, setInviteChecking] = useState(false);
  const [inviteSendCodeBy, setInviteSendCodeBy] = useState("email"); // "email" ou "phone"
  const inviteCheckRef = useRef(null);
  const [adminConfirmCode, setAdminConfirmCode] = useState(""); // Code saisi par l'admin
  const [adminConfirmContact, setAdminConfirmContact] = useState(""); // Contact du participant à confirmer
  const [showAdminConfirm, setShowAdminConfirm] = useState(false); // Afficher le formulaire de confirmation
  const [provisionalPassword, setProvisionalPassword] = useState(""); // Mot de passe provisoire créé par l'admin
  const [editModalVisible, setEditModalVisible] = useState(false); // Modal pour éditer
  const [editingUser, setEditingUser] = useState(null); // Utilisateur en cours d'édition
  const [editNom, setEditNom] = useState(""); // Nom en cours d'édition
  const [editPrenom, setEditPrenom] = useState(""); // Prénom en cours d'édition
  const [editEmail, setEditEmail] = useState(""); // Email en cours d'édition
  const [editPhone, setEditPhone] = useState(""); // Téléphone en cours d'édition
  const [editRole, setEditRole] = useState("medecin"); // Rôle en cours d'édition
  const [searchQuery, setSearchQuery] = useState(""); // Filtre de recherche des participants

  // Validate email locally: proper format and exists in backend users list
  // Debounced check for invite email: format, existing via backend
  useEffect(() => {
    setInviteEmailError('');
    if (inviteCheckRef.current) clearTimeout(inviteCheckRef.current);
    if (!inviteEmail) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      setInviteEmailError("Format d'email invalide");
      return;
    }
    inviteCheckRef.current = setTimeout(async () => {
      setInviteChecking(true);
      try {
        const res = await fetch(`${API_BASE}/check-email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail }) });
        const j = await res.json();
        if (j && j.success) {
          if (j.exists && j.isConfirmed) setInviteEmailError('Cet email est déjà actif');
          else if (j.exists && !j.isConfirmed) setInviteEmailError(''); // Permettre le renvoi
          // Suppression de la vérification MX qui bloquait
          else setInviteEmailError('');
        }
      } catch (err) {
        console.warn('Vérification email:', err);
        // Ne pas bloquer en cas d'erreur de vérification
        setInviteEmailError('');
      }
      setInviteChecking(false);
    }, 700);
    return () => { if (inviteCheckRef.current) clearTimeout(inviteCheckRef.current); };
  }, [inviteEmail]);





  // Admin: renvoyer le code à un utilisateur en attente 
  const handleResendCode = async () => {
    if (!inviteEmail) return Alert.alert('Erreur', 'Veuillez entrer un email');
    
    try {
      setLoading(true);
      const contactToSend = inviteSendCodeBy === "email" ? inviteEmail : invitePhone;
      
      if (inviteSendCodeBy === "phone" && !invitePhone) {
        setLoading(false);
        return Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone pour l\'envoi par SMS');
      }
      
      const response = await fetch(`${API_BASE}/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: contactToSend }),
      });

      const data = await response.json();
      if (data.success) {
        const medium = inviteSendCodeBy === "email" ? "email" : "SMS";
        if (data.code) console.log('Code (dev):', data.code);
        setInviteMessage(`Code renvoyé par ${medium} à ${contactToSend}${data.code ? '. Code: ' + data.code : ''}`);
        // Afficher le formulaire de confirmation pour l'admin
        setAdminConfirmContact(contactToSend);
        setShowAdminConfirm(true);
      } else {
        Alert.alert("Erreur", data.message || "Impossible de renvoyer le code");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert("Erreur", "Problème de connexion au serveur");
    }
  };

  // Admin: créer un utilisateur directement sans code
  const handleCreateDirect = async () => {
    // Vérifier les données requises
    if (!inviteEmail || !inviteName || !invitePrenom) {
      return Alert.alert('Erreur', 'Veuillez remplir nom, prénom et email');
    }
    
    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      return Alert.alert('Erreur', 'Email invalide');
    }
    
    if (!provisionalPassword || provisionalPassword.length < 6) {
      return Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE}/create-user-direct`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          phone: invitePhone.trim() || null,
          password: provisionalPassword,
          nom: inviteName.trim(),
          prenom: invitePrenom.trim(),
          role: inviteRole
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        Alert.alert(
          'Succès ✅', 
          `Compte créé avec succès !\n\nEmail : ${inviteEmail}\nMot de passe : ${provisionalPassword}\n\nL'utilisateur peut maintenant se connecter directement.`,
          [{ text: 'OK' }]
        );
        
        // Recharger la liste des utilisateurs
        try { 
          const r = await fetch(`${API_BASE}/users`); 
          const u = await r.json(); 
          if (u.success) setUsers(u.users); 
        } catch(e){ }
        
        // Réinitialiser le formulaire
        setInviteEmail('');
        setInvitePhone('');
        setInviteName('');
        setInvitePrenom('');
        setInviteRole('medecin');
        setProvisionalPassword('');
        setInviteMessage('');
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de créer le compte');
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error creating user directly:', error);
      Alert.alert('Erreur', 'Problème de connexion au serveur');
    }
  };

  // Admin: invite user (create user directly with password)
  const handleInvite = async () => {
    return handleCreateDirect();
  };

  // Admin: confirmer le code pour activer le participant
  const handleAdminConfirmCode = async () => {
    if (!adminConfirmCode || !adminConfirmContact) {
      return Alert.alert("Erreur", "Veuillez entrer le code de confirmation");
    }
    
    if (!provisionalPassword || provisionalPassword.length < 6) {
      return Alert.alert("Erreur", "Le mot de passe provisoire doit contenir au moins 6 caractères");
    }
    
    try {
      const response = await fetch(`${API_BASE}/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contact: adminConfirmContact, 
          code: adminConfirmCode,
          provisionalPassword: provisionalPassword 
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert(
          "Succès", 
          `Participant confirmé avec succès !\n\nMot de passe provisoire : ${provisionalPassword}\n\nCommuniquez ce mot de passe au participant de manière sécurisée.\nIl devra le changer lors de sa première connexion.`,
          [{ text: "OK" }]
        );
        setAdminConfirmCode("");
        setAdminConfirmContact("");
        setProvisionalPassword("");
        setShowAdminConfirm(false);
        setInviteMessage("");
        setLastInvitedId(null);
        // Recharger la liste des utilisateurs
        try { 
          const r = await fetch(`${API_BASE}/users`); 
          const u = await r.json(); 
          if (u.success) setUsers(u.users); 
        } catch(e){ }
      } else {
        Alert.alert("Erreur", data.message || "Code incorrect !");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de vérifier le code");
    }
  };

  // Admin: activate a user immediately
  const handleActivate = async (userEmail) => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE}/admin/activate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: userEmail }),
      });
      const j = await resp.json();
      if (j.success) {
        Alert.alert('Succès', 'Utilisateur activé');
        if (j.users) setUsers(j.users);
      } else {
        Alert.alert('Erreur', j.message || 'Impossible d\'activer');
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
      Alert.alert('Erreur', 'Problème de connexion au serveur');
    }
  };

  // Edit active user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditNom(user.nom || "");
    setEditPrenom(user.prenom || "");
    setEditEmail(user.email || "");
    setEditPhone(user.phone || "");
    setEditRole(user.role || "medecin");
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editPrenom || editPrenom.trim() === '') {
      Alert.alert('Erreur', 'Veuillez entrer un prénom');
      return;
    }
    if (!editNom || editNom.trim() === '') {
      Alert.alert('Erreur', 'Veuillez entrer un nom');
      return;
    }
    if (!editEmail || editEmail.trim() === '') {
      Alert.alert('Erreur', 'Veuillez entrer un email');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE}/update-user/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prenom: editPrenom.trim(),
          nom: editNom.trim(),
          email: editEmail.trim(),
          phone: editPhone.trim(),
          role: editRole,
        }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Succès', 'Participant modifié');
        setEditModalVisible(false);
        setEditingUser(null);
        setEditNom("");
        setEditPrenom("");
        setEditEmail("");
        setEditPhone("");
        // Recharger la liste
        const r = await fetch(`${API_BASE}/users`);
        const u = await r.json();
        if (u.success) setUsers(u.users);
      } else {
        Alert.alert('Erreur', data.message || 'Modification échouée');
      }
    } catch (error) {
      console.error('Edit error:', error);
      Alert.alert('Erreur', 'Problème de connexion');
    }
  };

  // Delete active user
  const handleDeleteUser = (user) => {
    Alert.alert(
      'Supprimer le participant',
      `Êtes-vous sûr de vouloir supprimer ${user.prenom} ${user.nom} (${user.email}) ?\n\nCette action est permanente !`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              console.log('[DELETE] Token récupéré:', token ? '✓' : '✗');
              console.log('[DELETE] Suppression de user ID:', user.id);
              console.log('[DELETE] URL:', `${API_BASE}/delete-user/${user.id}`);
              
              const response = await fetch(`${API_BASE}/delete-user/${user.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });

              console.log('[DELETE] Status:', response.status);
              const data = await response.json();
              console.log('[DELETE] Response:', data);
              
              if (data.success) {
                Alert.alert('Succès', `${user.prenom} ${user.nom} a été supprimé`);
                // Recharger la liste
                const r = await fetch(`${API_BASE}/users`);
                const u = await r.json();
                if (u.success) setUsers(u.users);
              } else {
                Alert.alert('Erreur', data.message || 'Suppression échouée');
              }
            } catch (error) {
              console.error('[DELETE] Erreur:', error);
              Alert.alert('Erreur', 'Problème de connexion: ' + error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Edit Modal - Web compatible */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setEditModalVisible(false);
          setEditingUser(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Modifier le participant</Text>
              {editingUser && (
                <Text style={styles.modalSubtitle}>
                  ID #{editingUser.id} - {editingUser.prenom} {editingUser.nom}
                </Text>
              )}
              
              <Text style={styles.labelText}>Nom *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nom"
                value={editNom}
                onChangeText={setEditNom}
              />
              
              <Text style={styles.labelText}>Prénom *</Text>
              <TextInput
                style={styles.input}
                placeholder="Prénom"
                value={editPrenom}
                onChangeText={setEditPrenom}
              />
              
              <Text style={styles.labelText}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <Text style={styles.labelText}>Téléphone</Text>
              <TextInput
                style={styles.input}
                placeholder="Téléphone (optionnel)"
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />
              
              <Text style={styles.labelText}>Rôle *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={editRole}
                  onValueChange={setEditRole}
                  style={{ height: 50, width: '100%' }}
                >
                  <Picker.Item label="👑 Admin" value="admin" />
                  <Picker.Item label="🩺 Médecin" value="medecin" />
                  <Picker.Item label="🔧 Technicien" value="technicien" />
                </Picker>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, backgroundColor: '#6c757d' }]}
                  onPress={() => {
                    setEditModalVisible(false);
                    setEditingUser(null);
                  }}
                >
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { flex: 1 }]}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.buttonText}>✏️ Modifier</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
      <Header title="Gestion des utilisateurs" />
      <ScrollView contentContainerStyle={styles.container}>

      {/* Invite card - ADMIN ONLY */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👥 Créer un nouveau participant (Admin)</Text>
        <Text style={styles.infoText}>Le participant pourra se connecter immédiatement avec ses identifiants</Text>
        <TextInput style={styles.input} placeholder="Nom *" value={inviteName} onChangeText={setInviteName} />
        <TextInput style={styles.input} placeholder="Prénom *" value={invitePrenom} onChangeText={setInvitePrenom} />
        <TextInput style={styles.input} placeholder="Email *" value={inviteEmail} onChangeText={setInviteEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Mot de passe *" value={provisionalPassword} onChangeText={setProvisionalPassword} secureTextEntry={true} />
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 10, fontStyle: 'italic' }}>* Mot de passe minimum 6 caractères</Text>
        
        {inviteChecking ? <ActivityIndicator style={{ marginBottom: 8 }} /> : null}
        {inviteEmailError === 'Cet email est déjà actif' ? <Text style={{ color: 'red', marginBottom: 8 }}>{inviteEmailError}</Text> : null}
        
        <Text style={styles.labelText}>Rôle *</Text>
        <Picker selectedValue={inviteRole} style={styles.picker} onValueChange={(itemValue) => setInviteRole(itemValue)}>
          <Picker.Item label="Médecin" value="medecin" />
          <Picker.Item label="Technicien" value="technicien" />
        </Picker>
        
        <View style={{ backgroundColor: '#e7f3ff', padding: 15, borderRadius: 8, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#007bff' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5, color: '#004085' }}>ℹ️ Information</Text>
          <Text style={{ fontSize: 13, color: '#004085' }}>
            Le participant sera créé immédiatement et pourra se connecter directement avec son email et son mot de passe.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            (
              !inviteEmail ||
              !inviteName || 
              !invitePrenom || 
              !provisionalPassword ||
              provisionalPassword.length < 6 ||
              inviteChecking || 
              loading ||
              (inviteEmailError === 'Cet email est déjà actif')
            ) ? { opacity: 0.6 } : null
          ]} 
          onPress={handleInvite} 
          disabled={
            !inviteEmail ||
            !inviteName || 
            !invitePrenom || 
            !provisionalPassword ||
            provisionalPassword.length < 6 ||
            inviteChecking || 
            loading ||
            (inviteEmailError === 'Cet email est déjà actif')
          }
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>✅ Créer le compte</Text>}
        </TouchableOpacity>
        {inviteMessage ? <Text style={styles.successText}>✅ {inviteMessage}</Text> : null}
        {lastInvitedId ? <Text style={styles.smallInfo}>Dernier ID créé: #{lastInvitedId}</Text> : null}
      </View>


      {/* Active users - CRUD Admin */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅ Participants actifs</Text>
        
        {/* Recherche et Statistiques */}
        <TextInput
          style={styles.input}
          placeholder="🔍 Rechercher par nom, email, téléphone..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{users.filter(u => u.isConfirmed).length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{users.filter(u => u.isConfirmed && u.role === 'medecin').length}</Text>
            <Text style={styles.statLabel}>Médecins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{users.filter(u => u.isConfirmed && u.role === 'technicien').length}</Text>
            <Text style={styles.statLabel}>Techniciens</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{users.filter(u => u.isConfirmed && u.role === 'admin').length}</Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
        </View>
        
        {/* Liste des participants */}
        <FlatList
          scrollEnabled={false}
          data={users.filter(u => {
            if (!u.isConfirmed) return false;
            const query = searchQuery.toLowerCase();
            return (
              u.nom.toLowerCase().includes(query) ||
              u.prenom.toLowerCase().includes(query) ||
              u.email.toLowerCase().includes(query) ||
              (u.phone && u.phone.includes(query))
            );
          })}
          keyExtractor={(item) => item.id ? String(item.id) : item.email}
          renderItem={({ item }) => (
            <View style={styles.expandedParticipantCard}>
              <View>
                <Text style={styles.participantIdExpanded}>#{item.id}</Text>
                <View style={styles.userHeaderRow}>
                  <Text style={styles.userTextExpanded}>{item.nom} {item.prenom}</Text>
                  <View style={[
                    styles.roleBadge,
                    {
                      backgroundColor: '#007bff'
                    }
                  ]}>
                    <Text style={styles.badgeText}>
                      {item.role === 'medecin' ? '🩺 Médecin' : item.role === 'technicien' ? '🔧 Technicien' : '👑 Admin'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.emailText}>✉️ {item.email}</Text>
                {item.phone ? <Text style={styles.phoneText}>📱 {item.phone}</Text> : null}
              </View>
              
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity 
                  style={styles.editActionBtn}
                  onPress={() => handleEditUser(item)}
                >
                  <Text style={styles.actionBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteActionBtn}
                  onPress={() => handleDeleteUser(item)}
                >
                  <Text style={styles.actionBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun participant actif</Text>}
        />
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  mainTitle: { fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#333", textAlign: "center" },
  input: { width: "100%", padding: 15, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginBottom: 15, backgroundColor: "#fff" },
  picker: { width: "100%", marginBottom: 15, backgroundColor: "#fff", borderRadius: 10 },
  button: { backgroundColor: "#007bff", paddingVertical: 15, borderRadius: 10, alignItems: "center", marginBottom: 20 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  listTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 10, color: "#444" },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  cardTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#333" },
  crudButton: { 
    backgroundColor: '#007bff', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 6 
  },
  crudButtonText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  activeUserCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
  },
  userHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 10,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  deleteActionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#cce5ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#99c9ff',
  },
  actionBtnText: {
    fontSize: 16,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  successText: { color: '#007bff', marginTop: 10, fontWeight: '600' },
  smallInfo: { fontSize: 12, color: '#888', marginTop: 5 },
  empty: { textAlign: 'center', color: '#999', fontStyle: 'italic', marginTop: 10 },
  infoText: { fontSize: 14, color: '#555', marginBottom: 15, textAlign: 'center' },
  userCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    // Use boxShadow for web (react-native-web warns on shadow* props)
    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
    // Keep elevation for Android
    elevation: 3,
  },
  
  userText: { fontSize: 16, fontWeight: "600", color: "#333" },
  emailText: { fontSize: 14, color: "#666" },
  phoneText: { fontSize: 14, color: "#888", marginTop: 2 },
  roleText: { fontSize: 13, color: "#007bff", marginTop: 4, fontWeight: '500' },
  labelText: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 5 },
  smallButton: { marginTop: 8, backgroundColor: '#007bff', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, alignSelf: 'flex-start' },
  smallButtonText: { color: '#fff', fontWeight: '600' },
  confirmSection: { 
    marginTop: 20, 
    padding: 15, 
    backgroundColor: '#fff3cd', 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#ffc107' 
  },
  confirmTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#856404', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  expandedParticipantCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 3,
    borderLeftColor: '#007bff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
    elevation: 2,
  },
  participantIdExpanded: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  userTextExpanded: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emptyExpandedContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedPromptText: {
    fontSize: 15,
    color: '#007bff',
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
