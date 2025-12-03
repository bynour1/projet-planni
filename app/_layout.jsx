import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { AnnouncementProvider } from '../contexts/AnnouncementContext';
import { ChatProvider } from '../contexts/ChatContext';
import { PlanningProvider } from '../contexts/PlanningContext';
import { RoutineProvider } from '../contexts/RoutineContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { UserProvider } from '../contexts/UserContext';

function RootLayoutContent() {
  const { theme } = useTheme();

  return (
    <>
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
