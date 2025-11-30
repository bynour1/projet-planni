import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import io from 'socket.io-client';

export const PlanningContext = createContext();

export const PlanningProvider = ({ children }) => {
  // Maintenant, le planning commence vide : aucun jour fixe
  const [planning, setPlanning] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    // fetch initial planning from server
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/planning');
        const json = await res.json();
        if (json && json.success) setPlanning(json.planning || {});
      } catch (e) {
        // ignore
      }
    })();

    // connect socket
    try {
      socketRef.current = io('http://localhost:5000');
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
  const addEvent = async (jour, event) => {
    // call server to persist and broadcast
    try {
      const res = await fetch('http://localhost:5000/planning/event', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jour, event }),
      });
      const json = await res.json();
      if (json && json.success) setPlanning(json.planning || {});
    } catch (e) {}
  };

  // Supprimer un événement
  const removeEvent = async (jour, index) => {
    try {
      const res = await fetch('http://localhost:5000/planning/event', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jour, index }),
      });
      const json = await res.json();
      if (json && json.success) setPlanning(json.planning || {});
    } catch (e) {}
  };

  // Modifier un événement
  const updateEvent = async (jour, index, newEvent) => {
    try {
      const res = await fetch('http://localhost:5000/planning/event', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jour, index, event: newEvent }),
      });
      const json = await res.json();
      if (json && json.success) setPlanning(json.planning || {});
    } catch (e) {}
  };

  // Ajouter un planning hebdomadaire complet
  const addWeeklyPlanning = async (planningSemaine) => {
    try {
      const res = await fetch('http://localhost:5000/planning/replace', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planning: planningSemaine }),
      });
      const json = await res.json();
      if (json && json.success) setPlanning(planningSemaine);
    } catch (e) {}
  };

  return (
    <PlanningContext.Provider
      value={{ planning, addEvent, removeEvent, updateEvent, addWeeklyPlanning }}
    >
      {children}
    </PlanningContext.Provider>
  );
};

export const usePlanning = () => useContext(PlanningContext);
