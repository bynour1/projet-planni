import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from '../contexts/UserContext';
import ClinoMobile from '../screens/clinoMobile';

export default function CliniqueMobilePage() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <ClinoMobile />
      </SafeAreaProvider>
    </UserProvider>
  );
}

