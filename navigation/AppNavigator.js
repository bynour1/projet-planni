import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminScreen from '../screens/AdminScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import MedecinScreen from '../screens/MedecinScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TechnicienScreen from '../screens/TechnicienScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import CalendarScreen from './../screens/CalendarScreen';
import chatScreen from './../screens/chatScreen';
import DashboardScreen from './../screens/DashboardScreen';
import PlanningScreen from './../screens/PlanningScreen';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CliniqueMobile" component={CliniqueMobileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Medecin" component={MedecinScreen} />
      <Stack.Screen name="Technicien" component={TechnicienScreen} />
      <Stack.Screen name="Planning" component={PlanningScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={chatScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Changer le mot de passe' }} />
    </Stack.Navigator>
  );
}
