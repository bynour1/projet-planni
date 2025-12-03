import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminScreen from '../screens/AdminScreen';
import MedecinScreen from '../screens/MedecinScreen';
import TechnicienScreen from '../screens/TechnicienScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import CalendarScreen from './../screens/CalendarScreen';
import DashboardScreen from './../screens/DashboardScreen';
import PlanningScreen from './../screens/PlanningScreen';
import chatScreen from './../screens/chatScreen';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Medecin" component={MedecinScreen} />
      <Stack.Screen name="Technicien" component={TechnicienScreen} />
      <Stack.Screen name="Planning" component={PlanningScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={chatScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
    </Stack.Navigator>
  );
}
