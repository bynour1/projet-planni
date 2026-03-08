import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Header from '../components/Header';

export default function ParticipantsCrudScreen() {
  return (
    <View style={styles.container}>
      <Header title="Participants" />
      <View style={styles.content}>
        <View style={styles.messageBox}>
          <Text style={styles.icon}>👥</Text>
          <Text style={styles.title}>Gestion des Participants</Text>
          <Text style={styles.message}>
            La gestion des participants a été intégrée à l'écran "Gestion des utilisateurs".
          </Text>
          <Text style={styles.submessage}>
            Veuillez accéder à cette section via le menu administrateur pour créer, modifier ou supprimer des participants.
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {}}
          >
            <Text style={styles.buttonText}>➜ Aller à la Gestion des utilisateurs</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  submessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
