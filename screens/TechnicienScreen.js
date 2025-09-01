import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TechnicienScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page Technicien</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('PlanningManagement')}
        >
          <Text style={styles.buttonText}>Planning</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.buttonText}>Chat 💬</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '80%',
    gap: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default TechnicienScreen;
