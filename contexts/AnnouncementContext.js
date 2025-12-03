import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const AnnouncementContext = createContext();

export const AnnouncementProvider = ({ children }) => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const saved = await AsyncStorage.getItem('@announcements');
      if (saved) {
        setAnnouncements(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const saveAnnouncements = async (newAnnouncements) => {
    try {
      await AsyncStorage.setItem('@announcements', JSON.stringify(newAnnouncements));
      setAnnouncements(newAnnouncements);
    } catch (error) {
      console.error('Error saving announcements:', error);
    }
  };

  const addAnnouncement = (announcement) => {
    const newAnnouncement = {
      id: Date.now().toString(),
      ...announcement,
      createdAt: new Date().toISOString(),
    };
    const updated = [newAnnouncement, ...announcements];
    saveAnnouncements(updated);
  };

  const deleteAnnouncement = (id) => {
    const updated = announcements.filter(a => a.id !== id);
    saveAnnouncements(updated);
  };

  const updateAnnouncement = (id, updates) => {
    const updated = announcements.map(a => 
      a.id === id ? { ...a, ...updates } : a
    );
    saveAnnouncements(updated);
  };

  return (
    <AnnouncementContext.Provider value={{
      announcements,
      addAnnouncement,
      deleteAnnouncement,
      updateAnnouncement,
    }}>
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncements = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within AnnouncementProvider');
  }
  return context;
};
