import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParticipantsProvider } from './contexts/ParticipantsContext';
import AdminScreen from './screens/AdminScreen';
import MedecinScreen from './screens/MedecinScreen';
import TechnicienScreen from './screens/TechnicienScreen';
import WelcomeScreen from './screens/WelcomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ParticipantsProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="Medecin" component={MedecinScreen} />
          <Stack.Screen name="Technicien" component={TechnicienScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ParticipantsProvider>
  );
}
