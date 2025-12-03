import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  
  const MenuButton = ({ icon, title, subtitle, onPress, color = '#007AFF' }) => (
    <TouchableOpacity 
      style={[styles(theme).menuButton, { borderLeftColor: color }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles(theme).menuIcon}>{icon}</Text>
      <View style={styles(theme).menuContent}>
        <Text style={styles(theme).menuTitle}>{title}</Text>
        {subtitle && <Text style={styles(theme).menuSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles(theme).menuArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView style={styles(theme).container}>
        <View style={styles(theme).header}>
          <TouchableOpacity
            onPress={() => setSidebarVisible(true)}
            style={styles(theme).menuIconButton}
          >
            <Text style={styles(theme).menuIconText}>☰</Text>
          </TouchableOpacity>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles(theme).logo}
            resizeMode="contain"
          />
          <Text style={styles(theme).title}>Planning Management</Text>
          <Text style={styles(theme).subtitle}>Gestion intelligente de votre planning</Text>
        </View>

        <View style={styles(theme).section}>
          <Text style={styles(theme).sectionTitle}>📊 Tableaux de Bord</Text>
        
          <MenuButton
            icon="📢"
            title="Annonces"
            subtitle="Mises à jour importantes"
            onPress={() => router.push('/announcements')}
            color="#ff6b6b"
          />
        
        <MenuButton
          icon="📊"
          title="Dashboard"
          subtitle="Statistiques et vue d'ensemble"
          onPress={() => router.push('/dashboard')}
          color="#007bff"
        />

        <MenuButton
          icon="📅"
          title="Calendrier"
          subtitle="Vue mensuelle interactive"
          onPress={() => router.push('/calendar')}
          color="#28a745"
        />

        <MenuButton
          icon="📋"
          title="Planning Hebdomadaire"
          subtitle="Gestion détaillée de la semaine"
          onPress={() => router.push('/planning')}
          color="#ffc107"
        />
      </View>

      <View style={styles(theme).section}>
        <Text style={styles(theme).sectionTitle}>⏰ Routines & Horaires</Text>

        <MenuButton
          icon="⏰"
          title="Routines"
          subtitle="Créer des routines récurrentes"
          onPress={() => router.push('/routine')}
          color="#9b59b6"
        />

        <MenuButton
          icon="📆"
          title="Horaires"
          subtitle="Planifier vos événements"
          onPress={() => router.push('/schedule')}
          color="#e74c3c"
        />
      </View>

      <View style={styles(theme).section}>
        <Text style={styles(theme).sectionTitle}>👥 Accès Rapide</Text>

        <MenuButton
          icon="👨‍⚕️"
          title="Médecin"
          subtitle="Espace médecin"
          onPress={() => router.push('/medecin')}
          color="#17a2b8"
        />

        <MenuButton
          icon="👷"
          title="Technicien"
          subtitle="Espace technicien"
          onPress={() => router.push('/technicien')}
          color="#6610f2"
        />

        <MenuButton
          icon="💬"
          title="Chat"
          subtitle="Messagerie instantanée"
          onPress={() => router.push('/chat')}
          color="#20c997"
        />

        <MenuButton
          icon="⚙️"
          title="Paramètres"
          subtitle="Thème et configuration"
          onPress={() => router.push('/settings')}
          color="#fd7e14"
        />

        <MenuButton
          icon="🔧"
          title="Administration"
          subtitle="Gestion système"
          onPress={() => router.push('/admin')}
          color="#dc3545"
        />
      </View>

        <View style={styles(theme).footer}>
          <Text style={styles(theme).footerText}>Version 2.0 • Mode {theme.isDark ? 'Sombre' : 'Clair'}</Text>
          <Text style={styles(theme).footerText}>© 2025 Planning Management</Text>
        </View>
      </ScrollView>

      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
    </>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: theme.background,
  },
  menuIconButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
  },
  menuIconText: {
    fontSize: 24,
    color: '#fff',
  },
  header: {
    backgroundColor: theme.primary,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logo: { 
    width: 100, 
    height: 100, 
    marginBottom: 15,
    tintColor: '#fff',
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 15,
  },
  menuButton: {
    backgroundColor: theme.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 28,
    color: theme.textTertiary,
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 5,
  },
});
