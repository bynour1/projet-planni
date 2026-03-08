/* eslint-disable import/first */
import { Stack, useSegments } from 'expo-router';
import { useState } from 'react';
import { LogBox, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Supprimer des warnings connus pour react-native-web en mode dev
LogBox.ignoreLogs([
  '"shadow*" style props are deprecated',
  'props.pointerEvents is deprecated',
]);

import Sidebar from '../components/Sidebar';
import { AnnouncementProvider } from '../contexts/AnnouncementContext';
import { ChatProvider } from '../contexts/ChatContext';
import { PlanningProvider } from '../contexts/PlanningContext';
import { RoutineProvider } from '../contexts/RoutineContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { UserProvider } from '../contexts/UserContext';

function RootLayoutContent() {
  const { theme } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const segments = useSegments();
  const currentSegment = (segments && segments[0]) || '';
  const isLoginRoute = currentSegment === 'login' || currentSegment === 'forgot-password';

  return (
    <>
      {!isLoginRoute && (
        <>
          <View style={[styles.floatingContainer, { pointerEvents: 'box-none' }]}> 
            <TouchableOpacity style={[styles.floatingButton, { backgroundColor: theme.primary }]} onPress={() => setSidebarVisible(true)}>
              <Text style={styles.floatingText}>☰</Text>
            </TouchableOpacity>
          </View>
          <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
        </>
      )}
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      />
    </>
  );
}



export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AnnouncementProvider>
          <PlanningProvider>
            <RoutineProvider>
              <ChatProvider>
                <RootLayoutContent />
              </ChatProvider>
            </RoutineProvider>
          </PlanningProvider>
        </AnnouncementProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: 24,
    left: 12,
    zIndex: 2000,
  },
  floatingButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  floatingText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
});
