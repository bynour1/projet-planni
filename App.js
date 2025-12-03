import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { StatusBar } from "react-native";

// Contexts
import { ChatProvider } from "./contexts/ChatContext";
import { PlanningProvider } from "./contexts/PlanningContext";
import { RoutineProvider } from "./contexts/RoutineContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";

// Écrans
import AdminPlanningScreen from "./screens/AdminPlanningScreen";
import AdminScreen from "./screens/AdminScreen";
import CalendarScreen from "./screens/CalendarScreen";
import ChatScreen from "./screens/chatScreen";
import DashboardScreen from "./screens/DashboardScreen";
import MedecinScreen from "./screens/MedecinScreen";
import PlanningScreen from "./screens/PlanningScreen";
import RoutineScreen from "./screens/RoutineScreen";
import ScheduleScreen from "./screens/ScheduleScreen";
import SettingsScreen from "./screens/SettingsScreen";
import TechnicienScreen from "./screens/TechnicienScreen";
import UserManagementScreen from "./screens/UserManagementScreen";
import WelcomeScreen from "./screens/WelcomeScreen";

const Stack = createNativeStackNavigator();

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="Routine" component={RoutineScreen} />
          <Stack.Screen name="Schedule" component={ScheduleScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="Medecin" component={MedecinScreen} />
          <Stack.Screen name="Technicien" component={TechnicienScreen} />
          <Stack.Screen name="Planning" component={PlanningScreen} />
          <Stack.Screen name="AdminPlanning" component={AdminPlanningScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="UserManagement" component={UserManagementScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <PlanningProvider>
          <RoutineProvider>
            <ChatProvider>
              <AppContent />
            </ChatProvider>
          </RoutineProvider>
        </PlanningProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
