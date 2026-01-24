import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../contexts/UserContext';

export default function Sidebar({ visible, onClose }) {
  const router = useRouter();
  const { user, logout } = useUser();

  if (!visible) return null;

  const adminMenu = [
    { icon: '🏠', label: 'Accueil', route: '/welcome' },
    { icon: '📊', label: 'Dashboard', route: '/dashboard' },
    { icon: '🚑', label: 'Clino_Mobile', route: '/clinique-mobile' },
    { icon: '📅', label: 'Calendrier', route: '/calendar' },
    { icon: '📋', label: 'Mon Planning', route: '/mon-planning' },
    { icon: '⚙️', label: 'Planning Admin', route: '/admin-planning' },
    { icon: '📌', label: 'Evenements & Routines', route: '/events-routines' },
    { icon: '💬', label: 'Chat', route: '/chat' },
    { icon: '⚙️', label: 'Parametres', route: '/settings' },
    { icon: '👥', label: 'Utilisateurs', route: '/user-management' },
    { icon: '🚪', label: 'Deconnexion', route: 'logout' },
  ];

  const medecinTechnicienMenu = [
    { icon: '🚑', label: 'Clino_Mobile', route: '/clinique-mobile' },
    { icon: '📅', label: 'Calendrier', route: '/calendar' },
    { icon: '📋', label: 'Mon Planning', route: '/mon-planning' },
    { icon: '📌', label: 'Evenements & Routines', route: '/events-routines' },
    { icon: '💬', label: 'Chat', route: '/chat' },
    { icon: '⚙️', label: 'Parametres', route: '/settings' },
    { icon: '🚪', label: 'Deconnexion', route: 'logout' },
  ];

  let menuItems;
  if (user?.role === 'admin') {
    menuItems = adminMenu;
  } else if (user?.role === 'medecin' || user?.role === 'technicien') {
    menuItems = medecinTechnicienMenu;
  } else {
    menuItems = medecinTechnicienMenu;
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
    if (onClose) onClose();
  };

  const handleNavigation = (route) => {
    if (route === 'logout') {
      handleLogout();
      return;
    }
    try {
      const path = typeof route === 'string' && !route.startsWith('/') ? '/' + route : route;
      router.push(path);
    } catch (e) {
      console.error('Navigation error:', e);
    }
    if (onClose) onClose();
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      <View style={styles.sidebar}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Menu</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
        </View>

        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.prenom + ' ' + user.nom || user.email || 'Utilisateur'}
            </Text>
            <Text style={styles.userRole}>{user.role || 'Invite'}</Text>
          </View>
        )}

        <ScrollView style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleNavigation(item.route)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 2.0</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 1001,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userInfo: {
    padding: 15,
    margin: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  userRole: {
    fontSize: 14,
    textTransform: 'capitalize',
    color: '#666',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
