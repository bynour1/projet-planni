// App.js
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { PlanningProvider } from "./contexts/PlanningContext";

// Écrans
import AdminPlanningScreen from "./screens/AdminPlanningScreen";
import AdminScreen from "./screens/AdminScreen";
import ChatScreen from "./screens/chatScreen";
import MedecinScreen from "./screens/MedecinScreen";
import PlanningScreen from "./screens/PlanningScreen";
import TechnicienScreen from "./screens/TechnicienScreen";
import UserManagementScreen from "./screens/UserManagementScreen";
import WelcomeScreen from "./screens/WelcomeScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PlanningProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{ headerShown: false }}
        >
          {/* Accueil / rôle */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />

          {/* Rôles */}
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="Medecin" component={MedecinScreen} />
          <Stack.Screen name="Technicien" component={TechnicienScreen} />

          {/* Fonctionnalités */}
          <Stack.Screen name="Planning" component={PlanningScreen} />
          <Stack.Screen name="AdminPlanning" component={AdminPlanningScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PlanningProvider>
  );
}
