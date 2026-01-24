import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from 'socket.io-client';
import { API_BASE } from '../constants/api';

export const CliniqueMobileContext = createContext();

export const CliniqueMobileProvider = ({ children }) => {
  const [clinoMobile, setClinoMobile] = useState([]);
  const socketRef = useRef(null);
  const API_URL = API_BASE;

  useEffect(() => {
    // Charger le planning initial depuis le serveur
    (async () => {
      try {
        const res = await fetch(`${API_URL}/clino-mobile`);
        const json = await res.json();
        if (json && json.success) setClinoMobile(json.data || []);
      } catch (e) {
        console.error('Erreur chargement clino-mobile:', e);
      }
    })();

    // Connecter Socket.io pour les mises à jour en temps réel
    try {
      socketRef.current = io(API_URL);
      socketRef.current.on('clino-mobile:update', (data) => {
        setClinoMobile(data || []);
      });
    } catch (err) {
      console.error('Socket.io error:', err);
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Récupérer le token d'authentification
  const getAuthHeader = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Ajouter une intervention Clino Mobile
  const addClinoMobile = async (intervention) => {
    try {
      const res = await fetch(`${API_URL}/clino-mobile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(intervention),
      });
      const json = await res.json();
      if (json && json.success) {
        // La mise à jour viendra via socket.io
      }
      return json;
    } catch (e) {
      console.error('Erreur ajout clino-mobile:', e);
      throw e;
    }
  };

  // Modifier une intervention
  const updateClinoMobile = async (id, intervention) => {
    try {
      const res = await fetch(`${API_URL}/clino-mobile/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(intervention),
      });
      const json = await res.json();
      if (json && json.success) {
        // La mise à jour viendra via socket.io
      }
      return json;
    } catch (e) {
      console.error('Erreur modification clino-mobile:', e);
      throw e;
    }
  };

  // Supprimer une intervention
  const deleteClinoMobile = async (id) => {
    try {
      const res = await fetch(`${API_URL}/clino-mobile/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      const json = await res.json();
      if (json && json.success) {
        // La mise à jour viendra via socket.io
      }
      return json;
    } catch (e) {
      console.error('Erreur suppression clino-mobile:', e);
      throw e;
    }
  };

  return (
    <CliniqueMobileContext.Provider
      value={{ 
        clinoMobile, 
        addClinoMobile, 
        updateClinoMobile, 
        deleteClinoMobile 
      }}
    >
      {children}
    </CliniqueMobileContext.Provider>
  );
};

export const useCliniqueMobile = () => useContext(CliniqueMobileContext);

