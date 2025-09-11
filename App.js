import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// Contexts
import { ChatProvider } from "./contexts/ChatContext";
import { PlanningProvider } from "./contexts/PlanningContext";
import { UserProvider } from "./contexts/UserContext";

// Écrans
import AdminPlanningScreen from "./screens/AdminPlanningScreen";
import AdminScreen from "./screens/AdminScreen";
import ChatScreen from "./screens/chatScreen"; // si le fichier reste en minuscules

import MedecinScreen from "./screens/MedecinScreen";
import PlanningScreen from "./screens/PlanningScreen";
import TechnicienScreen from "./screens/TechnicienScreen";
import UserManagementScreen from "./screens/UserManagementScreen";
import WelcomeScreen from "./screens/WelcomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <PlanningProvider>
        <ChatProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Admin" component={AdminScreen} />
              <Stack.Screen name="Medecin" component={MedecinScreen} />
              <Stack.Screen name="Technicien" component={TechnicienScreen} />
              <Stack.Screen name="Planning" component={PlanningScreen} />
              <Stack.Screen name="AdminPlanning" component={AdminPlanningScreen} />
              <Stack.Screen name="Chat" component={ChatScreen} />
              <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </ChatProvider>
      </PlanningProvider>
    </UserProvider>
  );
}
