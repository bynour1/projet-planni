import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminScreen from './../screens/AdminScreen';
import chatScreen from './../screens/chatScreen';
import MedecinScreen from './../screens/MedecinScreen';
import TechnicienScreen from './../screens/TechnicienScreen';
import UserManagementScreen from './../screens/UserManagementScreen';
import WelcomeScreen from './../screens/WelcomeScreen';



const Stack = createNativeStackNavigator();

export default function App() {
  return (
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="Medecin" component={MedecinScreen} />
        <Stack.Screen name="Technicien" component={TechnicienScreen} />
      <Stack.Screen name="Chat" component={chatScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />


      </Stack.Navigator>
  );
}
