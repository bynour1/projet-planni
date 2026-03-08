import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from '../contexts/UserContext';
import CliniqueMobileScreen from '../screens/CliniqueMobileScreen';

export default function CliniqueMobilePage() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <CliniqueMobileScreen />
      </SafeAreaProvider>
    </UserProvider>
  );
}

