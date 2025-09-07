import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Bienvenue</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Medecin')}>
        <Text style={styles.buttonText}>Médecin</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Technicien')}>
        <Text style={styles.buttonText}>Technicien</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Admin')}>
        <Text style={styles.buttonText}>Administration</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  logo: { 
    width: 120, 
    height: 120, 
    marginBottom: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 30 
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center'
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18 
  }
});
