import { Picker } from "@react-native-picker/picker";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Base d'utilisateurs déjà créés par admin
// initial local placeholder; real users are fetched from backend
let usersList = [];

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  // load users from backend
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch('http://localhost:5000/users');
        const json = await resp.json();
        if (json.success) setUsers(json.users);
      } catch (e) {
        console.warn('Impossible de charger les utilisateurs', e);
      }
    })();
  }, []);
  const [loading, setLoading] = useState(false);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [role, setRole] = useState("medecin");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState("medecin");
  const [inviteName, setInviteName] = useState("");
  const [invitePrenom, setInvitePrenom] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [lastInvitedId, setLastInvitedId] = useState(null);
  const [inviteEmailError, setInviteEmailError] = useState('');
  const [inviteChecking, setInviteChecking] = useState(false);
  const inviteCheckRef = useRef(null);
  const [step, setStep] = useState(1); // 1 = infos + email, 2 = code, 3 = mot de passe
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [refresh, setRefresh] = useState(false); // pour forcer FlatList à refresh

  // Validate email locally: proper format and exists in backend users list
  // Debounced check for invite email: format, existing, MX via backend
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
        const res = await fetch('http://localhost:5000/check-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail }) });
        const j = await res.json();
        if (j && j.success) {
          if (j.exists && j.isConfirmed) setInviteEmailError('Cet email est déjà actif');
          else if (j.exists && !j.isConfirmed) setInviteEmailError('Cet email a déjà été invité (en attente)');
          else if (!j.mxOk) setInviteEmailError('Domaine de messagerie invalide (MX introuvable)');
          else setInviteEmailError('');
        }
      } catch (err) {
        setInviteEmailError('Impossible de vérifier le domaine actuellement');
      }
      setInviteChecking(false);
    }, 700);
    return () => { if (inviteCheckRef.current) clearTimeout(inviteCheckRef.current); };
  }, [inviteEmail]);

  useEffect(() => {
    if (!email) { setEmailError(""); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Email invalide");
      return;
    }
    const existing = users.find(u => u.email === email);
    if (!existing) {
      setEmailError("Email inconnu. Contactez l'admin.");
      return;
    }
    if (existing.isConfirmed) {
      setEmailError("Ce compte est déjà actif. Connectez-vous.");
      return;
    }
    setEmailError("");
  }, [email, users]);

  // Étape 1 : Vérifier l'email et envoyer le code via backend
  const handleNextStep = async () => {
    if (!nom || !prenom) return Alert.alert("Erreur", "Veuillez entrer votre nom et prénom !");
    if (!email) return Alert.alert("Erreur", "Veuillez entrer un email !");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return Alert.alert("Erreur", "Email invalide !");

    const existingUser = users.find((u) => u.email === email);
    if (!existingUser) return Alert.alert("Erreur", "Email inconnu ! Contactez l'admin.");

    if (existingUser.isConfirmed) {
      Alert.alert("Info", "Ce compte est déjà actif. Connectez-vous avec votre mot de passe.");
      return;
    }

    try {
      // Appel backend pour envoyer un email avec code
      const response = await fetch("http://localhost:5000/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        // If backend returned code (dev mode), show it in console for testing
        if (data.code) console.log('Code (dev):', data.code);
        Alert.alert("Email reconnu", `Un code de confirmation a été envoyé à ${email}`);
        setStep(2); // passer à la saisie du code
      } else {
        Alert.alert("Erreur", data.message || "Impossible d'envoyer l'email");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Problème de connexion au serveur");
    }
  };

  // Admin: invite user (create user and send code)
  const handleInvite = async () => {
    if (!inviteEmail) return Alert.alert('Erreur', 'Veuillez entrer un email à inviter');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) return Alert.alert('Erreur', 'Email invalide');
    if (inviteEmailError) return Alert.alert('Erreur', inviteEmailError);
    try {
      setLoading(true);
      const resp = await fetch('http://localhost:5000/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, phone: invitePhone, nom: inviteName, prenom: invitePrenom, role: inviteRole }),
      });
      const j = await resp.json();
      if (j.success) {
        // show returned id when available
        if (j.userId) {
          setLastInvitedId(j.userId);
          setInviteMessage(j.code ? `Invité créé (dev). Code: ${j.code} — id: ${j.userId}` : `Invité créé. id: ${j.userId}`);
        } else {
          setInviteMessage(j.code ? `Invité créé (dev). Code: ${j.code}` : 'Invité créé et email envoyé');
        }
        // reload users list
        try { const r = await fetch('http://localhost:5000/users'); const u = await r.json(); if (u.success) setUsers(u.users); } catch(e){ }
        // clear form on success
        setInviteEmail(''); setInvitePhone(''); setInviteName(''); setInvitePrenom(''); setInviteRole('medecin');
      } else {
        Alert.alert('Erreur', j.message || 'Impossible d\'inviter l\'utilisateur');
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.error(e);
      Alert.alert('Erreur', 'Problème de connexion au serveur');
    }
  };

  // Admin: activate a user immediately
  const handleActivate = async (userEmail) => {
    try {
      setLoading(true);
      const resp = await fetch('http://localhost:5000/admin/activate', {
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

  // Étape 2 : Vérifier le code de confirmation via backend
  const handleConfirmCode = async () => {
    try {
      const response = await fetch("http://localhost:5000/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert("Succès", "Code confirmé ! Vous pouvez maintenant créer votre mot de passe.");
        setStep(3);
      } else {
        Alert.alert("Erreur", data.message || "Code incorrect !");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de vérifier le code");
    }
  };

  // Étape 3 : Ajouter mot de passe
  const handleAddPassword = async () => {
    if (password.length < 8) return Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères !");
    try {
      const response = await fetch('http://localhost:5000/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nom, prenom, role }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Succès', 'Utilisateur ajouté avec succès ✅');
        // Reset
        setNom(''); setPrenom(''); setRole('medecin');
        setEmail(''); setPassword(''); setCode(''); setStep(1);
        setRefresh(!refresh);
        // reload users
        try {
          const resp = await fetch('http://localhost:5000/users');
          const j = await resp.json();
          if (j.success) setUsers(j.users);
        } catch (e) { /* ignore */ }
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de créer l\'utilisateur');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Problème de connexion au serveur');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.mainTitle}>Gestion des utilisateurs</Text>

      {/* Invite card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Inviter un utilisateur</Text>
        <TextInput style={styles.input} placeholder="Nom" value={inviteName} onChangeText={setInviteName} />
        <TextInput style={styles.input} placeholder="Prénom" value={invitePrenom} onChangeText={setInvitePrenom} />
        <TextInput style={styles.input} placeholder="Email à inviter" value={inviteEmail} onChangeText={setInviteEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Téléphone (optionnel)" value={invitePhone} onChangeText={setInvitePhone} keyboardType="phone-pad" />
        {inviteChecking ? <ActivityIndicator style={{ marginBottom: 8 }} /> : null}
        {inviteEmailError ? <Text style={{ color: 'red', marginBottom: 8 }}>{inviteEmailError}</Text> : null}
        <Picker selectedValue={inviteRole} style={styles.picker} onValueChange={(itemValue) => setInviteRole(itemValue)}>
          <Picker.Item label="Médecin" value="medecin" />
          <Picker.Item label="Technicien" value="technicien" />
        </Picker>
        <TouchableOpacity style={[styles.button, (!inviteEmail || !inviteName || !invitePrenom || inviteChecking || inviteEmailError) ? { opacity: 0.6 } : null]} onPress={handleInvite} disabled={!inviteEmail || !inviteName || !invitePrenom || inviteChecking || !!inviteEmailError}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Inviter</Text>}
        </TouchableOpacity>
        {inviteMessage ? <Text style={styles.successText}>{inviteMessage}</Text> : null}
        {lastInvitedId ? <Text style={styles.smallInfo}>Dernier ID invité: #{lastInvitedId}</Text> : null}
      </View>

      {/* Pending invites */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Invitations en attente</Text>
        <FlatList
          data={users.filter(u => !u.isConfirmed)}
          keyExtractor={(item) => item.id ? String(item.id) : item.email}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <View>
                <Text style={styles.userText}>{item.id ? `#${item.id} ` : ''}{item.nom} {item.prenom}</Text>
                <Text style={styles.emailText}>{item.email}</Text>
                {item.phone ? <Text style={styles.phoneText}>📱 {item.phone}</Text> : null}
              </View>
              <TouchableOpacity style={styles.smallButton} onPress={() => handleActivate(item.email)}>
                <Text style={styles.smallButtonText}>Activer</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucune invitation en attente</Text>}
        />
      </View>

      {/* Active users */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Utilisateurs actifs</Text>
        <FlatList
          data={users.filter(u => u.isConfirmed)}
          keyExtractor={(item) => item.id ? String(item.id) : item.email}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <View>
                <Text style={styles.userText}>{item.id ? `#${item.id} ` : ''}{item.nom} {item.prenom}</Text>
                <Text style={styles.emailText}>{item.email}</Text>
                {item.phone ? <Text style={styles.phoneText}>📱 {item.phone}</Text> : null}
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun utilisateur actif</Text>}
        />
      </View>
    </ScrollView>
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
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
  },
  successText: { color: '#28a745', marginTop: 10, fontWeight: '600' },
  smallInfo: { fontSize: 12, color: '#888', marginTop: 5 },
  empty: { textAlign: 'center', color: '#999', fontStyle: 'italic', marginTop: 10 },
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
  smallButton: { marginTop: 8, backgroundColor: '#28a745', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, alignSelf: 'flex-start' },
  smallButtonText: { color: '#fff', fontWeight: '600' }
});

