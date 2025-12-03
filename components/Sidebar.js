import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

export default function Sidebar({ visible, onClose }) {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useUser();

  if (!visible) return null;

  const menuItems = [
    { icon: '🏠', label: 'Accueil', route: '/welcome', roles: ['admin', 'medecin', 'technicien'] },
    { icon: '📊', label: 'Dashboard', route: '/dashboard', roles: ['admin', 'medecin', 'technicien'] },
    { icon: '📅', label: 'Calendrier', route: '/calendar', roles: ['admin', 'medecin', 'technicien'] },
    { icon: '📋', label: 'Planning', route: '/planning', roles: ['admin', 'medecin', 'technicien'] },
    { icon: '⏰', label: 'Routines', route: '/routine', roles: ['admin', 'medecin', 'technicien'] },
    { icon: '📆', label: 'Horaires', route: '/schedule', roles: ['admin', 'medecin', 'technicien'] },
    { icon: '📢', label: 'Annonces', route: '/announcements', roles: ['admin', 'medecin', 'technicien'] },
    { icon: '👨‍⚕️', label: 'Espace Médecin', route: '/medecin', roles: ['admin', 'medecin'] },
    { icon: '👷', label: 'Espace Technicien', route: '/technicien', roles: ['admin', 'technicien'] },
    { icon: '💬', label: 'Chat', route: '/chat', roles: ['admin', 'medecin', 'technicien'] },
    { icon: '⚙️', label: 'Paramètres', route: '/settings', roles: ['admin', 'medecin', 'technicien'] },
    { icon: '🔧', label: 'Administration', route: '/admin', roles: ['admin'] },
  ];

  const handleNavigation = (route) => {
    router.push(route);
    onClose();
  };

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || 'guest')
  );

  return (
    <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      
      <View style={[styles.sidebar, { backgroundColor: theme.surface }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Menu</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {user && (
          <View style={[styles.userInfo, { backgroundColor: theme.highlight }]}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user.name || 'Utilisateur'}
            </Text>
            <Text style={[styles.userRole, { color: theme.textSecondary }]}>
              {user.role || 'Invité'}
            </Text>
          </View>
        )}

        <ScrollView style={styles.menuContainer}>
          {filteredMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderBottomColor: theme.border }]}
              onPress={() => handleNavigation(item.route)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              <Text style={[styles.menuArrow, { color: theme.textTertiary }]}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Version 2.0 • {theme.isDark ? 'Sombre' : 'Clair'}
          </Text>
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
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    padding: 15,
    margin: 10,
    borderRadius: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 24,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
