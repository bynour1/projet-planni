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
        const resp = await fetch('http://localhost:8001/users');
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
  
  // États pour la création de mot de passe par le participant
  const [userContactPassword, setUserContactPassword] = useState(""); // Email ou téléphone du participant
  const [userNewPassword, setUserNewPassword] = useState(""); // Nouveau mot de passe
  const [userConfirmPassword, setUserConfirmPassword] = useState(""); // Confirmation mot de passe

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
        const res = await fetch('http://localhost:8001/check-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail }) });
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
      
      const response = await fetch("http://localhost:8001/send-code", {
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
    // Vérifier qu'il y a au moins un email OU un téléphone
    if ((!inviteEmail && !invitePhone) || !inviteName || !invitePrenom) {
      return Alert.alert('Erreur', 'Veuillez remplir nom, prénom et au moins email OU téléphone');
    }
    
    if (!provisionalPassword || provisionalPassword.length < 6) {
      return Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8001/create-user-direct', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
        },
        body: JSON.stringify({
          email: inviteEmail.trim() || null,
          phone: invitePhone.trim() || null,
          password: provisionalPassword,
          nom: inviteName.trim(),
          prenom: invitePrenom.trim(),
          role: inviteRole
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const contact = data.contact || inviteEmail || invitePhone;
        Alert.alert(
          'Succès', 
          `Compte créé avec succès !\n\nIdentifiant : ${contact}\nMot de passe provisoire : ${data.provisionalPassword}\n\nCommuniquez ces identifiants au participant de manière sécurisée.\nIl devra changer son mot de passe lors de sa première connexion.`,
          [{ text: 'OK' }]
        );
        
        // Recharger la liste des utilisateurs
        try { 
          const r = await fetch('http://localhost:8001/users'); 
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

  // Admin: invite user (create user and send code)
  const handleInvite = async () => {
    if (!inviteEmail) return Alert.alert('Erreur', 'Veuillez entrer un email à inviter');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) return Alert.alert('Erreur', 'Email invalide');
    if (inviteEmailError === 'Cet email est déjà actif') return Alert.alert('Erreur', inviteEmailError);
    
    // Vérifier si l'utilisateur existe déjà en attente
    const existingUser = users.find(u => u.email === inviteEmail && !u.isConfirmed);
    if (existingUser) {
      // L'utilisateur existe déjà, juste renvoyer le code
      return handleResendCode();
    }
    try {
      setLoading(true);
      const resp = await fetch('http://localhost:8001/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, phone: invitePhone, nom: inviteName, prenom: invitePrenom, role: inviteRole, sendCodeBy: inviteSendCodeBy }),
      });
      const j = await resp.json();
      if (j.success) {
        // show returned id when available
        const sendTo = inviteSendCodeBy === "email" ? inviteEmail : invitePhone;
        const medium = inviteSendCodeBy === "email" ? "email" : "SMS";
        if (j.userId) {
          setLastInvitedId(j.userId);
          setInviteMessage(j.code ? `Participant créé (id: ${j.userId}). Code envoyé par ${medium}: ${j.code}` : `Participant créé (id: ${j.userId}). Un code de confirmation a été envoyé par ${medium} à ${sendTo}`);
        } else {
          setInviteMessage(j.code ? `Participant créé. Code envoyé par ${medium}: ${j.code}` : `Participant créé. Un code de confirmation a été envoyé par ${medium} à ${sendTo}`);
        }
        // Afficher le formulaire de confirmation pour l'admin
        setAdminConfirmContact(sendTo);
        setShowAdminConfirm(true);
        // reload users list
        try { const r = await fetch('http://localhost:8001/users'); const u = await r.json(); if (u.success) setUsers(u.users); } catch(e){ }
        // clear form on success
        setInviteEmail(''); setInvitePhone(''); setInviteName(''); setInvitePrenom(''); setInviteRole('medecin'); setInviteSendCodeBy('email');
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

  // Participant: créer son mot de passe après confirmation par l'admin
  const handleCreateUserPassword = async () => {
    if (!userContactPassword) {
      return Alert.alert("Erreur", "Veuillez entrer votre email ou téléphone");
    }
    if (userNewPassword.length < 8) {
      return Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères");
    }
    if (userNewPassword !== userConfirmPassword) {
      return Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
    }

    try {
      // Vérifier si l'utilisateur existe et est confirmé
      const existingUser = users.find((u) => 
        (u.email === userContactPassword || u.phone === userContactPassword) && u.isConfirmed
      );
      
      if (!existingUser) {
        return Alert.alert("Erreur", "Contact introuvable ou non confirmé par l'admin");
      }
      
      if (existingUser.password) {
        return Alert.alert("Info", "Ce compte a déjà un mot de passe. Connectez-vous.");
      }

      const response = await fetch('http://localhost:8001/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: existingUser.email, 
          password: userNewPassword, 
          nom: existingUser.nom, 
          prenom: existingUser.prenom, 
          role: existingUser.role 
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        Alert.alert('Succès', 'Mot de passe créé ! Vous pouvez maintenant vous connecter.');
        setUserContactPassword("");
        setUserNewPassword("");
        setUserConfirmPassword("");
        // Recharger la liste des utilisateurs
        try {
          const resp = await fetch('http://localhost:8001/users');
          const data = await resp.json();
          if (j.success) setUsers(j.users);
        } catch (e) { /* ignore */ }
      } else {
        Alert.alert('Erreur', data.message || 'Impossible de créer le mot de passe');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Problème de connexion au serveur');
    }
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
      const response = await fetch("http://localhost:8001/verify-code", {
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
          const r = await fetch('http://localhost:8001/users'); 
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
      const resp = await fetch('http://localhost:8001/admin/activate', {
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



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.mainTitle}>Gestion des utilisateurs</Text>

      {/* Section participant: créer son mot de passe après confirmation admin */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔐 Créer votre mot de passe</Text>
        <Text style={styles.infoText}>Si l'admin a confirmé votre compte, vous pouvez créer votre mot de passe</Text>
        
        <TextInput 
          style={styles.input} 
          placeholder="Votre email ou téléphone" 
          value={userContactPassword} 
          onChangeText={setUserContactPassword} 
          autoCapitalize="none"
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="Nouveau mot de passe (min 8 caractères)" 
          value={userNewPassword} 
          onChangeText={setUserNewPassword} 
          secureTextEntry
        />
        
        <TextInput 
          style={styles.input} 
          placeholder="Confirmer le mot de passe" 
          value={userConfirmPassword} 
          onChangeText={setUserConfirmPassword} 
          secureTextEntry
        />
        
        {userNewPassword && userConfirmPassword && userNewPassword !== userConfirmPassword ? (
          <Text style={{ color: 'red', marginBottom: 8 }}>❌ Les mots de passe ne correspondent pas</Text>
        ) : null}
        
        <TouchableOpacity 
          style={[
            styles.button, 
            (!userContactPassword || userNewPassword.length < 8 || userNewPassword !== userConfirmPassword) 
              ? { opacity: 0.6 } 
              : null
          ]} 
          onPress={handleCreateUserPassword} 
          disabled={!userContactPassword || userNewPassword.length < 8 || userNewPassword !== userConfirmPassword}
        >
          <Text style={styles.buttonText}>✅ Créer mon mot de passe</Text>
        </TouchableOpacity>
      </View>

      {/* Invite card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👥 Créer un nouveau participant</Text>
        <Text style={styles.infoText}>Choisissez votre méthode de création de compte</Text>
        <TextInput style={styles.input} placeholder="Nom *" value={inviteName} onChangeText={setInviteName} />
        <TextInput style={styles.input} placeholder="Prénom *" value={invitePrenom} onChangeText={setInvitePrenom} />
        <TextInput style={styles.input} placeholder="Email" value={inviteEmail} onChangeText={setInviteEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Téléphone" value={invitePhone} onChangeText={setInvitePhone} keyboardType="phone-pad" />
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 10, fontStyle: 'italic' }}>* Au moins un email OU un téléphone est requis</Text>
        
        {inviteChecking ? <ActivityIndicator style={{ marginBottom: 8 }} /> : null}
        {inviteEmailError === 'Cet email est déjà actif' ? <Text style={{ color: 'red', marginBottom: 8 }}>{inviteEmailError}</Text> : null}
        {users.find(u => u.email === inviteEmail && !u.isConfirmed) ? <Text style={{ color: 'blue', marginBottom: 8 }}>🔄 Cet email est en attente. Le code sera renvoyé.</Text> : null}
        
        <Text style={styles.labelText}>Situation (Rôle) *</Text>
        <Picker selectedValue={inviteRole} style={styles.picker} onValueChange={(itemValue) => setInviteRole(itemValue)}>
          <Picker.Item label="Médecin" value="medecin" />
          <Picker.Item label="Technicien" value="technicien" />
        </Picker>
        
        <View style={{ backgroundColor: '#f8f9fa', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>📝 Mot de passe provisoire (optionnel)</Text>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>Si vous entrez un mot de passe, le compte sera créé directement sans email de confirmation</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Mot de passe provisoire (min. 6 caractères)" 
            value={provisionalPassword} 
            onChangeText={setProvisionalPassword} 
            secureTextEntry={false}
            autoCapitalize="none"
          />
          {provisionalPassword && provisionalPassword.length < 6 ? (
            <Text style={{ color: 'orange', fontSize: 12 }}>⚠️ Le mot de passe doit contenir au moins 6 caractères</Text>
          ) : null}
        </View>
        
        {!provisionalPassword && (
          <>
            <Text style={styles.labelText}>📧 Envoyer le code de confirmation par :</Text>
            <Picker selectedValue={inviteSendCodeBy} style={styles.picker} onValueChange={setInviteSendCodeBy}>
              <Picker.Item label="✉️ Email" value="email" />
              <Picker.Item label="📱 SMS / Téléphone" value="phone" />
            </Picker>
            {inviteSendCodeBy === "phone" && !invitePhone ? <Text style={{ color: 'orange', marginBottom: 8 }}>⚠️ Veuillez entrer un numéro de téléphone pour l'envoi par SMS</Text> : null}
          </>
        )}
        
        <TouchableOpacity 
          style={[
            styles.button, 
            (
              (!inviteEmail && !invitePhone) || 
              !inviteName || 
              !invitePrenom || 
              inviteChecking || 
              loading ||
              (inviteEmailError === 'Cet email est déjà actif') || 
              (provisionalPassword && provisionalPassword.length < 6) ||
              (!provisionalPassword && inviteSendCodeBy === "phone" && !invitePhone) ||
              (!provisionalPassword && inviteSendCodeBy === "email" && !inviteEmail)
            ) ? { opacity: 0.6 } : null
          ]} 
          onPress={provisionalPassword ? handleCreateDirect : handleInvite} 
          disabled={
            (!inviteEmail && !invitePhone) || 
            !inviteName || 
            !invitePrenom || 
            inviteChecking || 
            loading ||
            (inviteEmailError === 'Cet email est déjà actif') || 
            (provisionalPassword && provisionalPassword.length < 6) ||
            (!provisionalPassword && inviteSendCodeBy === "phone" && !invitePhone) ||
            (!provisionalPassword && inviteSendCodeBy === "email" && !inviteEmail)
          }
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{provisionalPassword ? '✅ Créer directement' : (users.find(u => u.email === inviteEmail && !u.isConfirmed) ? '🔄 Renvoyer le code' : '✉️ Créer et envoyer le code')}</Text>}
        </TouchableOpacity>
        {inviteMessage ? <Text style={styles.successText}>✅ {inviteMessage}</Text> : null}
        {lastInvitedId ? <Text style={styles.smallInfo}>Dernier ID invité: #{lastInvitedId}</Text> : null}
        
        {showAdminConfirm && (
          <View style={styles.confirmSection}>
            <Text style={styles.confirmTitle}>🔐 Confirmer le participant</Text>
            <Text style={styles.infoText}>Le code a été envoyé à : {adminConfirmContact}</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Entrez le code de confirmation" 
              value={adminConfirmCode} 
              onChangeText={setAdminConfirmCode} 
              keyboardType="number-pad" 
            />
            <Text style={[styles.infoText, { marginTop: 15, fontWeight: 'bold' }]}>
              Créer un mot de passe provisoire
            </Text>
            <TextInput 
              style={styles.input} 
              placeholder="Mot de passe provisoire (min. 6 caractères)" 
              value={provisionalPassword} 
              onChangeText={setProvisionalPassword} 
              secureTextEntry={false}
              autoCapitalize="none"
            />
            <Text style={[styles.infoText, { fontSize: 12, color: '#888', marginTop: 5 }]}>
              Ce mot de passe sera communiqué au participant. Il devra le changer lors de sa première connexion.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity 
                style={[styles.button, { flex: 1, backgroundColor: '#6c757d' }]} 
                onPress={() => {
                  setShowAdminConfirm(false);
                  setAdminConfirmCode("");
                  setAdminConfirmContact("");
                  setProvisionalPassword("");
                }}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, { flex: 1 }, (!adminConfirmCode || !provisionalPassword) ? { opacity: 0.6 } : null]} 
                onPress={handleAdminConfirmCode} 
                disabled={!adminConfirmCode || !provisionalPassword}
              >
                <Text style={styles.buttonText}>✅ Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Pending invites */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏳ Comptes en attente de confirmation</Text>
        <Text style={styles.infoText}>Ces utilisateurs ont reçu un code mais ne l'ont pas encore validé</Text>
        <FlatList
          data={users.filter(u => !u.isConfirmed)}
          keyExtractor={(item) => item.id ? String(item.id) : item.email}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userText}>{item.id ? `#${item.id} ` : ''}{item.nom} {item.prenom}</Text>
                <Text style={styles.emailText}>✉️ {item.email}</Text>
                {item.phone ? <Text style={styles.phoneText}>📱 {item.phone}</Text> : null}
                <Text style={styles.roleText}>{item.role === 'medecin' ? '🩺 Médecin' : '🔧 Technicien'}</Text>
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
        <Text style={styles.cardTitle}>✅ Participants actifs</Text>
        <Text style={styles.infoText}>Utilisateurs ayant confirmé leur compte et pouvant accéder à l'application</Text>
        <FlatList
          data={users.filter(u => u.isConfirmed)}
          keyExtractor={(item) => item.id ? String(item.id) : item.email}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userText}>{item.id ? `#${item.id} ` : ''}{item.nom} {item.prenom}</Text>
                <Text style={styles.emailText}>✉️ {item.email}</Text>
                {item.phone ? <Text style={styles.phoneText}>📱 {item.phone}</Text> : null}
                <Text style={styles.roleText}>{item.role === 'medecin' ? '🩺 Médecin' : item.role === 'technicien' ? '🔧 Technicien' : '👑 Admin'}</Text>
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
  smallButton: { marginTop: 8, backgroundColor: '#28a745', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, alignSelf: 'flex-start' },
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
  }
});

