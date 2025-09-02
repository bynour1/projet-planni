// App.js
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";

import { PlanningProvider } from "./contexts/PlanningContext";
import MedecinScreen from "./screens/MedecinScreen";
import TechnicienScreen from "./screens/TechnicienScreen";
// import PlanningScreen from "./screens/PlanningScreen";   // si tu en as besoin
// import ChatScreen from "./screens/ChatScreen";           // si tu en as besoin

const Stack = createStackNavigator();

export default function App() {
  return (
    <PlanningProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Ajoute/retire les écrans selon ton besoin */}
          <Stack.Screen name="MedecinScreen" component={MedecinScreen} />
          <Stack.Screen name="TechnicienScreen" component={TechnicienScreen} />
          {/* <Stack.Screen name="AdminScreen" component={AdminScreen} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </PlanningProvider>
  );
}
