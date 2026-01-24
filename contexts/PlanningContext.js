import { createContext, useContext, useEffect, useRef, useState } from "react";
import io from 'socket.io-client';
import { API_BASE } from '../constants/api';

const API_URL = API_BASE;

export const PlanningContext = createContext();

export const PlanningProvider = ({ children }) => {
  // Maintenant, le planning commence vide : aucun jour fixe
  const [planning, setPlanning] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    // fetch initial planning from server
    (async () => {
      try {
        const res = await fetch(`${API_URL}/planning`);
        const json = await res.json();
        if (json && json.success) setPlanning(json.planning || {});
      } catch (e) {
        // ignore
      }
    })();

    // connect socket
    try {
      socketRef.current = io(API_URL);
      socketRef.current.on('planning:update', (newPlanning) => {
        setPlanning(newPlanning || {});
      });
    } catch (err) {
      // socket may fail in some environments
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Ajouter un événement
  const addEvent = async (jour, medecin, technicien, adresse, heureDebut, heureFin) => {
    const event = { medecin, technicien, adresse, heureDebut, heureFin };
    // call server to persist and broadcast
    try {
      const res = await fetch(`${API_URL}/planning/event`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jour, event }),
      });
      const json = await res.json();
      if (json && json.success) setPlanning(json.planning || {});
    } catch (e) {}
  };

  // Supprimer un événement
  const removeEvent = async (jour, index) => {
    try {
      const res = await fetch(`${API_URL}/planning/event`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jour, index }),
      });
      const json = await res.json();
      if (json && json.success) setPlanning(json.planning || {});
    } catch (e) {}
  };

  // Modifier un événement
  const updateEvent = async (jour, index, newEvent) => {
    try {
      const res = await fetch(`${API_URL}/planning/event`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jour, index, event: newEvent }),
      });
      const json = await res.json();
      if (json && json.success) setPlanning(json.planning || {});
    } catch (e) {}
  };

  // Ajouter un commentaire à un événement
  const addComment = async (jour, index, commentaire) => {
    try {
      const res = await fetch(`${API_URL}/planning/comment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jour, index, commentaire }),
      });
      const json = await res.json();
      if (json && json.success) setPlanning(json.planning || {});
    } catch (e) {}
  };

  // Ajouter un planning hebdomadaire complet
  const addWeeklyPlanning = async (planningSemaine) => {
    try {
      const res = await fetch(`${API_URL}/planning/replace`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planning: planningSemaine }),
      });
      const json = await res.json();
      if (json && json.success) setPlanning(planningSemaine);
    } catch (e) {}
  };

  return (
    <PlanningContext.Provider
      value={{ planning, addEvent, removeEvent, updateEvent, addWeeklyPlanning, addComment }}
    >
      {children}
    </PlanningContext.Provider>
  );
};

export const usePlanning = () => useContext(PlanningContext);

