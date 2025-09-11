// app/index.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatProvider } from '../contexts/ChatContext';
import { PlanningProvider } from '../contexts/PlanningContext';
import { UserProvider } from '../contexts/UserContext';

import AdminScreen from './../screens/AdminScreen';
import ChatScreen from './../screens/chatScreen';
import MedecinScreen from './../screens/MedecinScreen';
import PlanningScreen from './../screens/PlanningScreen';
import TechnicienScreen from './../screens/TechnicienScreen';
import UserManagementScreen from './../screens/UserManagementScreen';
import WelcomeScreen from './../screens/WelcomeScreen';

const Stack = createNativeStackNavigator();

export default function Index() {
  return (
    <UserProvider>
      <PlanningProvider>
        <ChatProvider>
          <Stack.Navigator initialRouteName="Welcome">
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Admin" component={AdminScreen} />
            <Stack.Screen name="Medecin" component={MedecinScreen} />
            <Stack.Screen name="Technicien" component={TechnicienScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="Planning" component={PlanningScreen} />
          </Stack.Navigator>
        </ChatProvider>
      </PlanningProvider>
    </UserProvider>
  );
}
