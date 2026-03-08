import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Animated, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import boxShadow from '../utils/boxShadow';

export default function WelcomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useUser();
  const userRole = user?.role;
  
  const MenuButton = ({ icon, title, subtitle, onPress, color = '#007AFF', badge = null }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    
    const handlePressIn = () => {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity 
          style={[styles(theme).menuButton, { borderLeftColor: color }]} 
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={styles(theme).iconContainer}>
            <Text style={styles(theme).menuIcon}>{icon}</Text>
            {badge && badge > 0 && (
              <View style={styles(theme).badge}>
                <Text style={styles(theme).badgeText}>{badge > 99 ? '99+' : badge}</Text>
              </View>
            )}
          </View>
          <View style={styles(theme).menuContent}>
            <Text style={styles(theme).menuTitle}>{title}</Text>
            <Text style={styles(theme).menuSubtitle}>{subtitle}</Text>
          </View>
          <Text style={styles(theme).menuArrow}>›</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (

    <>
      <ScrollView style={styles(theme).container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={theme.isDark ? ['#1a237e', '#283593', '#3949ab'] : ['#1976d2', '#2196f3', '#42a5f5']}
          style={styles(theme).header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
            }}
            style={styles(theme).menuIconButton}
          >
            <Text style={styles(theme).menuIconText}>☰</Text>
          </TouchableOpacity>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles(theme).logo}
            resizeMode="contain"
          />
          <Text style={styles(theme).title}>🏥 Plateforme Médicale</Text>
          <Text style={styles(theme).subtitle}>Gestion Intelligente & Planning</Text>
        </LinearGradient>

        <View style={styles(theme).section}>
          <Text style={styles(theme).sectionTitle}>📊 Tableaux de Bord</Text>

          <MenuButton
            icon="📢"
            title="Annonces"
            subtitle="Mises à jour importantes"
            onPress={() => router.push('/announcements')}
            color="#ff6b6b"
            badge={3}
            accessibilityLabel="Voir les annonces importantes"
          />

          <MenuButton
            icon="📊"
            title="Dashboard"
            subtitle="Statistiques et vue d'ensemble"
            onPress={() => router.push('/dashboard')}
            color="#007bff"
            accessibilityLabel="Accéder au dashboard"
          />

          <MenuButton
            icon="📅"
            title="Calendrier"
            subtitle="Vue mensuelle interactive"
            onPress={() => router.push('/calendar')}
            color="#28a745"
            badge={7}
            accessibilityLabel="Voir le calendrier mensuel"
          />

          <MenuButton
            icon="🗓️"
            title="Mon Planning"
            subtitle="Vue calendrier personnelle"
            onPress={() => router.push('/mon-planning')}
            color="#00bcd4"
            accessibilityLabel="Voir mon planning personnel"
          />

          <MenuButton
            icon="📋"
            title="Planning Hebdomadaire"
            subtitle="Gestion détaillée de la semaine"
            onPress={() => router.push('/planning')}
            color="#ffc107"
            accessibilityLabel="Voir le planning hebdomadaire"
          />
        </View>

      {userRole === 'admin' && (
        <>
          <View style={styles(theme).section}>
            <Text style={styles(theme).sectionTitle}>⏰ Routines & Horaires</Text>

            <MenuButton
              icon="⏰"
              title="Routines"
              subtitle="Créer des routines récurrentes"
              onPress={() => router.push('/routine')}
              color="#9b59b6"
              accessibilityLabel="Créer ou voir les routines"
            />

            <MenuButton
              icon="📆"
              title="Horaires"
              subtitle="Planifier vos événements"
              onPress={() => router.push('/schedule')}
              color="#e74c3c"
              accessibilityLabel="Planifier vos horaires"
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
              accessibilityLabel="Accéder à l'espace médecin"
            />

            <MenuButton
              icon="👷"
              title="Technicien"
              subtitle="Espace technicien"
              onPress={() => router.push('/technicien')}
              color="#6610f2"
              accessibilityLabel="Accéder à l'espace technicien"
            />

            <MenuButton
              icon="💬"
              title="Chat"
              subtitle="Messagerie instantanée"
              onPress={() => router.push('/chat')}
              color="#20c997"
              badge={12}
              accessibilityLabel="Ouvrir la messagerie instantanée"
            />

            <MenuButton
              icon="⚙️"
              title="Paramètres"
              subtitle="Thème et configuration"
              onPress={() => router.push('/settings')}
              color="#fd7e14"
              accessibilityLabel="Accéder aux paramètres"
            />

            <MenuButton
              icon="🔧"
              title="Administration"
              subtitle="Gestion système"
              onPress={() => router.push('/admin')}
              color="#dc3545"
              badge={2}
              accessibilityLabel="Accéder à l'administration"
            />
          </View>
        </>
      )}

        <View style={styles(theme).footer}>
          <Text style={styles(theme).footerText}>Version 2.0 • Mode {theme.isDark ? 'Sombre' : 'Clair'}</Text>
          <Text style={styles(theme).footerText}>© 2025 Planning Management</Text>
        </View>
      </ScrollView>

      {/* Sidebar is provided globally in app/_layout.jsx */}
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
    borderRadius: 16,
    marginBottom: 14,
    borderLeftWidth: 5,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    boxShadow: boxShadow(theme.shadow, 4, 8, 0.15),
  },
  iconContainer: {
    position: 'relative',
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 36,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.card,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  menuArrow: {
    fontSize: 32,
    color: theme.textTertiary,
    fontWeight: 'bold',
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
